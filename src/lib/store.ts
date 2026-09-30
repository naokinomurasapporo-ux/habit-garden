"use client";

// アプリ全体の状態。メモリ上の状態を即時更新（楽観的更新）し、リポジトリへ永続化する。
// リポジトリを差し替えれば Supabase などにも移行できる。

import { useSyncExternalStore } from "react";
import { todayKey } from "./date";
import { levelReachedDate, summarize } from "./habit-logic";
import { MAX_LEVEL } from "./level";
import { reorderWithinKind } from "./ordering";
import { LocalStorageRepository, emptyData } from "./repository/local-storage";
import type { HabitRepository } from "./repository/types";
import type { AppData, DateKey, Habit, HabitKind, NewHabitInput, PartnerCompletion } from "./types";

interface StoreState {
  ready: boolean;
  data: AppData;
  /** 直前の操作で解放された伝説形態（短い演出用。保存しない） */
  celebration: PartnerCompletion | null;
}

const repository: HabitRepository = new LocalStorageRepository();

const SERVER_STATE: StoreState = { ready: false, data: emptyData(), celebration: null };
let state: StoreState = SERVER_STATE;
let loading = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setData(fn: (d: AppData) => AppData) {
  state = { ...state, data: fn(state.data) };
  emit();
}

function persist(p: Promise<void>) {
  p.catch((e) => console.error("保存に失敗しました", e));
}

/** 成功・失敗どちらでも必ず ready=true にする（読み込み中のまま止まらない） */
function ensureLoaded() {
  if (loading) return;
  loading = true;
  let load: Promise<AppData>;
  try {
    load = repository.load();
  } catch (e) {
    load = Promise.reject(e);
  }
  load
    .then((data) => {
      state = { ready: true, data, celebration: null };
      // 読み込み時点で Lv.100 に達していて未記録のものはコレクションに保存（演出は出さない）
      syncCompletions(false);
    })
    .catch((e) => {
      console.error("データの読み込みに失敗しました", e);
      state = { ready: true, data: emptyData(), celebration: null };
    })
    .finally(emit);
}

/**
 * Lv.100 に到達した「習慣 × パートナー」を育成完了としてコレクションに記録する。
 * 記録は1回だけ（同じ習慣・同じパートナーで重複しない）。一度記録したら、後でXPが減っても残す。
 */
function syncCompletions(celebrate: boolean, habitIds?: string[]) {
  const today = todayKey();
  const done = new Set(state.data.completions.map((c) => `${c.habitId}:${c.partnerId}`));
  const added: PartnerCompletion[] = [];
  for (const h of state.data.habits) {
    if (habitIds && !habitIds.includes(h.id)) continue;
    if (done.has(`${h.id}:${h.partnerId}`)) continue;
    const s = summarize(h, state.data.logs[h.id], today);
    if (s.level.level < MAX_LEVEL) continue;
    added.push({
      id: newId(),
      habitId: h.id,
      habitName: h.name,
      partnerType: h.partnerType,
      partnerId: h.partnerId,
      completedAt: levelReachedDate(s.periods, MAX_LEVEL, today) ?? today,
      totalXp: s.totalXp,
    });
  }
  if (added.length === 0) return;
  state = {
    ...state,
    data: { ...state.data, completions: [...state.data.completions, ...added] },
    celebration: celebrate ? added[added.length - 1] : state.celebration,
  };
  emit();
  persist(repository.addCompletions(added));
}

/** 伝説形態解放の演出を閉じる */
export function dismissCelebration() {
  if (!state.celebration) return;
  state = { ...state, celebration: null };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureLoaded();
  return () => {
    listeners.delete(listener);
  };
}

export function useAppState(): StoreState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function addHabit(input: NewHabitInput): Habit {
  const habit: Habit = {
    ...input,
    id: newId(),
    createdAt: todayKey(),
    order: state.data.habits.reduce((m, h) => Math.max(m, h.order), 0) + 1,
  };
  setData((d) => ({ ...d, habits: [...d.habits, habit] }));
  persist(repository.createHabit(habit));
  return habit;
}

export function updateHabit(habit: Habit) {
  setData((d) => ({ ...d, habits: d.habits.map((h) => (h.id === habit.id ? habit : h)) }));
  persist(repository.updateHabit(habit));
  // 目標変更などで Lv.100 に届いた場合
  syncCompletions(true, [habit.id]);
}

/** ホームでの並び替え（セクション内のみ）。並び順は即時に自動保存する */
export function reorderHabits(kind: HabitKind, orderedIds: string[]) {
  const prev = state.data.habits;
  const next = reorderWithinKind(prev, kind, orderedIds);
  const changed = next.filter((h, i) => h !== prev[i]);
  if (changed.length === 0) return;
  setData((d) => ({ ...d, habits: next }));
  persist(repository.updateHabitOrders(changed.map((h) => ({ id: h.id, order: h.order }))));
}

export function deleteHabit(id: string) {
  setData((d) => {
    const logs = { ...d.logs };
    delete logs[id];
    // 育成完了の記録（コレクション）は残す
    return { ...d, habits: d.habits.filter((h) => h.id !== id), logs };
  });
  persist(repository.deleteHabit(id));
}

/** value が null なら記録を削除（未入力に戻す）。未来日は保存しない */
export function setLog(habitId: string, date: DateKey, value: number | null) {
  if (date > todayKey()) return;
  setData((d) => {
    const byDate = { ...d.logs[habitId] };
    if (value === null) delete byDate[date];
    else byDate[date] = value;
    return { ...d, logs: { ...d.logs, [habitId]: byDate } };
  });
  persist(
    value === null
      ? repository.deleteLog(habitId, date)
      : repository.upsertLog({ habitId, date, value }),
  );
  syncCompletions(true, [habitId]);
}

export function replaceAllData(data: AppData) {
  state = { ready: true, data, celebration: null };
  emit();
  persist(repository.replaceAll(data));
  syncCompletions(false);
}

// ---- 今日の日付（日付が変わったら自動で更新） ----

function subscribeToday(listener: () => void) {
  const id = window.setInterval(listener, 60_000);
  const onVisible = () => listener();
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onVisible);
  };
}

export function useToday(): DateKey {
  return useSyncExternalStore(subscribeToday, todayKey, () => "");
}
