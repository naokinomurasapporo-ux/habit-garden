import { isHabitCategory } from "../categories";
import { isKnownPartnerId, legacyPlantToPartnerId } from "../partners";
import type { AppData, DateKey, Habit, HabitLog, PartnerCompletion } from "../types";
import type { HabitRepository } from "./types";

// キー名は互換性のため据え置き（データ形式のバージョンは中身の version で管理する）
const STORAGE_KEY = "habit-garden:v1";

/**
 * 保存形式のバージョン
 * - 1: 初期
 * - 2: 入力方式（trackType）と目標頻度（period）を分離。「週○回/月○回」は原則チェック入力
 */
const CURRENT_VERSION = 2;

interface StoredData {
  version: typeof CURRENT_VERSION;
  habits: Habit[];
  logs: HabitLog[];
  /** 育成完了（Lv.100）の記録。旧データには無い */
  completions?: PartnerCompletion[];
}

export function emptyData(): AppData {
  return { habits: [], logs: {}, completions: [] };
}

function toStored(data: AppData): StoredData {
  const logs: HabitLog[] = [];
  for (const [habitId, byDate] of Object.entries(data.logs)) {
    for (const [date, value] of Object.entries(byDate)) logs.push({ habitId, date, value });
  }
  return { version: CURRENT_VERSION, habits: data.habits, logs, completions: data.completions };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const LEGACY_PLANTS = ["monstera", "cactus", "sakura"];

/** 不正な習慣は除外（壊れたデータで画面全体が止まらないようにする） */
function isValidHabit(h: unknown): h is Habit {
  return (
    isObj(h) &&
    typeof h.id === "string" &&
    typeof h.name === "string" &&
    (h.kind === "build" || h.kind === "quit") &&
    (h.trackType === "check" || h.trackType === "time" || h.trackType === "count") &&
    (h.period === "day" || h.period === "week" || h.period === "month") &&
    typeof h.target === "number" &&
    h.target > 0 &&
    // 新形式（partnerId）か旧形式（plant）のどちらかがあればよい
    (isKnownPartnerId(h.partnerId) || LEGACY_PLANTS.includes(h.plant as string)) &&
    typeof h.createdAt === "string" &&
    DATE_RE.test(h.createdAt)
  );
}

function storedVersion(raw: Record<string, unknown>): number {
  return typeof raw.version === "number" ? raw.version : 1;
}

/**
 * v1 → v2：「週○回/月○回」を +1（複数回）で記録していた習慣のうち、
 * 1日に1回までしか記録していないもの（例：ジム 週2回）をチェック入力へ移行する。
 * 記録値はそのまま（1 = その日やった）なので、評価・ストリークは変わらない。
 * 1日に2回以上記録した日がある習慣は、複数回の意味があるものとして変更しない。
 */
function migrateV1(data: AppData): AppData {
  const habits = data.habits.map((h) => {
    if (h.trackType !== "count" || h.period === "day") return h;
    const values = Object.values(data.logs[h.id] ?? {});
    return values.every((v) => v <= 1) ? { ...h, trackType: "check" as const } : h;
  });
  return { ...data, habits };
}

export function fromStored(raw: unknown): AppData {
  if (!isObj(raw)) return emptyData();
  const data = parseStored(raw);
  return storedVersion(raw) < 2 ? migrateV1(data) : data;
}

function parseStored(raw: Record<string, unknown>): AppData {
  if (!Array.isArray(raw.habits) || !Array.isArray(raw.logs)) return emptyData();
  const habits = raw.habits.filter(isValidHabit).map((h, i) => normalizeHabit(h, i));
  const ids = new Set(habits.map((h) => h.id));
  const logs: AppData["logs"] = {};
  for (const log of raw.logs as unknown[]) {
    if (!isObj(log) || typeof log.habitId !== "string" || !ids.has(log.habitId)) continue;
    if (typeof log.date !== "string" || !DATE_RE.test(log.date)) continue;
    if (typeof log.value !== "number" || !Number.isFinite(log.value)) continue;
    if (!logs[log.habitId]) logs[log.habitId] = {};
    logs[log.habitId][log.date] = log.value;
  }
  return { habits, logs, completions: parseCompletions(raw.completions) };
}

/**
 * 旧データを現在の形に補完する（保存データそのものは次の保存時に新形式になる）
 * - order が無い → 保存順
 * - category が無い / 不明 → "other"
 * - partner が無い（旧 plant のみ）→ plant パートナーとして同じ植物を使う
 */
function normalizeHabit(h: Habit, index: number): Habit {
  const hasPartner = isKnownPartnerId(h.partnerId) && (h.partnerType === "plant" || h.partnerType === "animal");
  return {
    ...h,
    order: typeof h.order === "number" ? h.order : index + 1,
    category: isHabitCategory(h.category) ? h.category : "other",
    partnerType: hasPartner ? h.partnerType : "plant",
    partnerId: hasPartner ? h.partnerId : legacyPlantToPartnerId(h.plant),
  };
}

function parseCompletions(raw: unknown): PartnerCompletion[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (c): c is PartnerCompletion =>
      isObj(c) &&
      typeof c.id === "string" &&
      typeof c.habitId === "string" &&
      typeof c.habitName === "string" &&
      (c.partnerType === "plant" || c.partnerType === "animal") &&
      typeof c.partnerId === "string" &&
      typeof c.completedAt === "string" &&
      DATE_RE.test(c.completedAt) &&
      typeof c.totalXp === "number",
  );
}

export function serialize(data: AppData): string {
  return JSON.stringify(toStored(data), null, 2);
}

export class LocalStorageRepository implements HabitRepository {
  /** localStorage が使えない環境（例外）はそのまま投げ、ストア側でエラー表示する */
  private storage(): Storage {
    return window.localStorage;
  }

  private read(): AppData {
    const raw = this.storage().getItem(STORAGE_KEY);
    if (!raw) return emptyData(); // 初回起動
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // JSON が壊れていても起動は続ける（元データは上書きしないよう退避しておく）
      console.error("保存データが壊れています", e);
      try {
        this.storage().setItem(`${STORAGE_KEY}:broken`, raw);
      } catch {
        // 退避できなくても起動を優先
      }
      return emptyData();
    }
    const data = fromStored(parsed);
    // 旧バージョンは移行後の形で保存し直す（移行は一度だけ行う）
    if (isObj(parsed) && storedVersion(parsed) < CURRENT_VERSION) {
      try {
        this.write(data);
      } catch (e) {
        console.error("移行データの保存に失敗しました", e);
      }
    }
    return data;
  }

  private write(data: AppData) {
    this.storage().setItem(STORAGE_KEY, JSON.stringify(toStored(data)));
  }

  private mutate(fn: (data: AppData) => AppData) {
    this.write(fn(this.read()));
  }

  async load() {
    return this.read();
  }

  async createHabit(habit: Habit) {
    this.mutate((d) => ({ ...d, habits: [...d.habits, habit] }));
  }

  async updateHabit(habit: Habit) {
    this.mutate((d) => ({ ...d, habits: d.habits.map((h) => (h.id === habit.id ? habit : h)) }));
  }

  async updateHabitOrders(orders: { id: string; order: number }[]) {
    const byId = new Map(orders.map((o) => [o.id, o.order]));
    this.mutate((d) => ({
      ...d,
      habits: d.habits.map((h) => (byId.has(h.id) ? { ...h, order: byId.get(h.id)! } : h)),
    }));
  }

  async deleteHabit(id: string) {
    this.mutate((d) => {
      const logs = { ...d.logs };
      delete logs[id];
      // 育成完了の記録（コレクション）は習慣を削除しても残す
      return { ...d, habits: d.habits.filter((h) => h.id !== id), logs };
    });
  }

  async upsertLog(log: HabitLog) {
    this.mutate((d) => ({
      ...d,
      logs: { ...d.logs, [log.habitId]: { ...d.logs[log.habitId], [log.date]: log.value } },
    }));
  }

  async deleteLog(habitId: string, date: DateKey) {
    this.mutate((d) => {
      const byDate = { ...d.logs[habitId] };
      delete byDate[date];
      return { ...d, logs: { ...d.logs, [habitId]: byDate } };
    });
  }

  async addCompletions(list: PartnerCompletion[]) {
    this.mutate((d) => ({ ...d, completions: [...d.completions, ...list] }));
  }

  async replaceAll(data: AppData) {
    this.write(data);
  }
}
