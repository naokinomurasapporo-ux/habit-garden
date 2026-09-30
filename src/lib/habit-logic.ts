// 記録（ログ）から評価・ストリーク・XP・統計をすべて導出する純粋関数群。
// 状態として保存するのはログだけなので、過去記録を修正すれば自動的に再計算される。

import {
  addDays,
  addMonths,
  daysInMonth,
  diffDays,
  minKey,
  monthStart,
  weekStart,
} from "./date";
import { levelFromXp, totalXpForLevel, type LevelInfo } from "./level";
import type { DateKey, Habit, PeriodUnit } from "./types";

export type Grade = "★" | "◎" | "○" | "△" | "×";

export const GRADE_XP: Record<Grade, number> = {
  "★": 50,
  "◎": 40,
  "○": 30,
  "△": 20,
  "×": 5,
};

export const XP = {
  check: 10,
  quitKept: 10,
  periodGoal: 40,
} as const;

export function gradeOf(ratio: number): Grade {
  if (ratio >= 1.5) return "★";
  if (ratio >= 1) return "◎";
  if (ratio >= 0.7) return "○";
  if (ratio > 0.5) return "△";
  return "×";
}

/**
 * success: 達成 / fail: 未達（期間終了後）/ pending: 期間中でまだ未達（失敗扱いしない）
 * missing: やらない習慣の過去日で未入力
 */
export type PeriodState = "success" | "fail" | "pending" | "missing";

export interface PeriodResult {
  start: DateKey;
  end: DateKey;
  progress: number;
  target: number;
  ratio: number;
  state: PeriodState;
  isCurrent: boolean;
  grade?: Grade;
  xp: number;
}

export function periodStart(unit: PeriodUnit, key: DateKey): DateKey {
  if (unit === "week") return weekStart(key);
  if (unit === "month") return monthStart(key);
  return key;
}

export function periodEnd(unit: PeriodUnit, start: DateKey): DateKey {
  if (unit === "week") return addDays(start, 6);
  if (unit === "month") return addDays(start, daysInMonth(start) - 1);
  return start;
}

function nextPeriodStart(unit: PeriodUnit, start: DateKey): DateKey {
  if (unit === "week") return addDays(start, 7);
  if (unit === "month") return addMonths(start, 1);
  return addDays(start, 1);
}

export const UNIT_LABEL: Record<PeriodUnit, string> = {
  day: "日",
  week: "週",
  month: "ヶ月",
};

export const PERIOD_WORD: Record<PeriodUnit, string> = {
  day: "今日",
  week: "今週",
  month: "今月",
};

export function valueUnit(habit: Habit): string {
  if (habit.kind === "quit") return "日";
  if (habit.trackType === "time") return "分";
  if (habit.trackType === "count") return "回";
  return "日";
}

/** 期間内の進捗値 */
function sumProgress(habit: Habit, logs: Record<DateKey, number>, start: DateKey, end: DateKey): number {
  let total = 0;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const v = logs[d];
    if (v === undefined) continue;
    total += habit.trackType === "check" ? (v >= 1 ? 1 : 0) : v;
  }
  return total;
}

function evaluatePeriod(
  habit: Habit,
  logs: Record<DateKey, number>,
  start: DateKey,
  today: DateKey,
): PeriodResult {
  const end = periodEnd(habit.period, start);
  const isCurrent = start <= today && today <= end;
  const base = { start, end, isCurrent, target: habit.target };

  if (habit.kind === "quit") {
    const v = logs[start];
    const state: PeriodState =
      v === 1 ? "success" : v === 0 ? "fail" : isCurrent ? "pending" : "missing";
    return {
      ...base,
      progress: v === 1 ? 1 : 0,
      ratio: v === 1 ? 1 : 0,
      state,
      xp: v === 1 ? XP.quitKept : 0,
    };
  }

  const progress = sumProgress(habit, logs, start, end > today ? today : end);
  const ratio = habit.target > 0 ? progress / habit.target : 0;

  if (habit.trackType === "time") {
    const grade = gradeOf(ratio);
    const ok = ratio >= 0.7;
    const state: PeriodState = ok ? "success" : isCurrent ? "pending" : "fail";
    // 進行中の週は ○ 以上になった時点で XP を付与（途中経過の × で +5 は付けない）
    const xp = !isCurrent || ok ? GRADE_XP[grade] : 0;
    return { ...base, progress, ratio, state, grade, xp };
  }

  const ok = progress >= habit.target;
  const state: PeriodState = ok ? "success" : isCurrent ? "pending" : "fail";
  let xp = 0;
  if (habit.trackType === "check") {
    // チェック達成ごとに +10、週・月の回数目標達成で +40
    xp += progress * XP.check;
    if (habit.period !== "day" && ok) xp += XP.periodGoal;
  } else if (ok) {
    xp += habit.period === "day" ? XP.check : XP.periodGoal;
  }
  return { ...base, progress, ratio, state, xp };
}

/** 評価開始日：作成日と最古の記録日のうち早い方 */
export function habitStartDate(habit: Habit, logs: Record<DateKey, number>): DateKey {
  let start = habit.createdAt;
  for (const d of Object.keys(logs)) start = minKey(start, d);
  return start;
}

/** 開始期間から今日を含む期間までの評価（古い順） */
export function evaluatePeriods(
  habit: Habit,
  logs: Record<DateKey, number>,
  today: DateKey,
): PeriodResult[] {
  const results: PeriodResult[] = [];
  const first = periodStart(habit.period, minKey(habitStartDate(habit, logs), today));
  const last = periodStart(habit.period, today);
  for (let s = first; s <= last; s = nextPeriodStart(habit.period, s)) {
    results.push(evaluatePeriod(habit, logs, s, today));
  }
  return results;
}

export interface Streak {
  current: number;
  longest: number;
}

/** pending（進行中の未達）はストリークを切らない */
export function computeStreak(periods: PeriodResult[]): Streak {
  let run = 0;
  let longest = 0;
  for (const p of periods) {
    if (p.state === "success") {
      run++;
      longest = Math.max(longest, run);
    } else if (p.state !== "pending") {
      run = 0;
    }
  }
  return { current: run, longest };
}

export interface HabitSummary {
  habit: Habit;
  periods: PeriodResult[];
  current: PeriodResult;
  streak: Streak;
  totalXp: number;
  level: LevelInfo;
  todayValue: number | undefined;
}

export function summarize(
  habit: Habit,
  logs: Record<DateKey, number> | undefined,
  today: DateKey,
): HabitSummary {
  const l = logs ?? {};
  const periods = evaluatePeriods(habit, l, today);
  const totalXp = periods.reduce((sum, p) => sum + p.xp, 0);
  return {
    habit,
    periods,
    current: periods[periods.length - 1],
    streak: computeStreak(periods),
    totalXp,
    level: levelFromXp(totalXp),
    todayValue: l[today],
  };
}

/**
 * ホームの日付移動用。XP・Lv・ストリークは常に today 時点（保存済み記録から再計算）、
 * current / todayValue だけを表示日 date のもの（その日の値・その日を含む期間）に差し替える。
 */
export function summarizeOn(
  habit: Habit,
  logs: Record<DateKey, number> | undefined,
  today: DateKey,
  date: DateKey,
): HabitSummary {
  const s = summarize(habit, logs, today);
  if (date >= today) return s;
  const l = logs ?? {};
  const start = periodStart(habit.period, date);
  const current = s.periods.find((p) => p.start === start) ?? evaluatePeriod(habit, l, start, today);
  return { ...s, current, todayValue: l[date] };
}

/** 累計値 */
export function totalAmount(habit: Habit, logs: Record<DateKey, number> | undefined): number {
  let total = 0;
  for (const v of Object.values(logs ?? {})) {
    if (habit.kind === "quit" || habit.trackType === "check") total += v >= 1 ? 1 : 0;
    else total += v;
  }
  return total;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}時間${m}分` : `${h}時間`;
}

/**
 * 直近 30 日（今日を含む）の達成率 0〜1。
 * - 毎日型・やらない習慣：達成日 / 評価対象日（今日の未入力・やらない習慣の未入力は分母から除外）
 * - 週・月・時間型：30 日間の実績 / 30 日換算の目標（上限 100%）
 */
export function achievementRate30(
  habit: Habit,
  logs: Record<DateKey, number> | undefined,
  today: DateKey,
): number | null {
  const l = logs ?? {};
  const startLimit = habitStartDate(habit, l);
  let from = addDays(today, -29);
  if (from < startLimit) from = startLimit;
  const days = diffDays(from, today) + 1;
  if (days <= 0) return null;

  if (habit.kind === "quit") {
    let kept = 0;
    let judged = 0;
    for (let d = from; d <= today; d = addDays(d, 1)) {
      if (l[d] === undefined) continue;
      judged++;
      if (l[d] === 1) kept++;
    }
    return judged ? kept / judged : null;
  }

  if (habit.period === "day") {
    let ok = 0;
    let judged = 0;
    for (let d = from; d <= today; d = addDays(d, 1)) {
      const v = l[d] ?? 0;
      const achieved = v >= habit.target;
      if (d === today && !achieved) continue;
      judged++;
      if (achieved) ok++;
    }
    return judged ? ok / judged : null;
  }

  const actual = sumProgress(habit, l, from, today);
  const periodDays = habit.period === "week" ? 7 : 30;
  const expected = (habit.target * days) / periodDays;
  return expected > 0 ? Math.min(1, actual / expected) : null;
}

/** ヒートマップの濃さ 0〜4（やらない習慣で破った日は -1） */
export function heatLevel(habit: Habit, value: number | undefined): number {
  if (value === undefined) return 0;
  if (habit.kind === "quit") return value === 1 ? 4 : -1;
  if (habit.trackType === "check") return value >= 1 ? 4 : 0;
  if (value <= 0) return 0;
  let ref: number;
  if (habit.trackType === "time") {
    ref = habit.dailyTargetMinutes || habit.target / 7;
  } else {
    ref = habit.period === "day" ? habit.target : Math.max(1, habit.target / (habit.period === "week" ? 7 : 30));
  }
  const r = value / ref;
  if (r >= 1) return 4;
  if (r >= 0.66) return 3;
  if (r >= 0.33) return 2;
  return 1;
}

export function frequencyLabel(habit: Habit): string {
  if (habit.kind === "quit") return "毎日";
  if (habit.trackType === "time") {
    const daily = habit.dailyTargetMinutes ? `1日${habit.dailyTargetMinutes}分・` : "";
    return `${daily}週${habit.target}分`;
  }
  const unit = habit.trackType === "count" ? "回" : "日";
  if (habit.period === "day") return habit.trackType === "count" ? `毎日${habit.target}回` : "毎日";
  return `${habit.period === "week" ? "週" : "月"}${habit.target}${unit === "日" ? "回" : unit}`;
}

export const TRACK_LABEL = { check: "チェック", time: "時間", count: "複数回" } as const;

/**
 * 累計XPが指定レベルに達した日（育成完了日の算出用）。
 * XPは期間ごとに付くので、到達した期間の最終日（進行中の期間なら今日）とする。未到達なら null。
 */
export function levelReachedDate(periods: PeriodResult[], level: number, today: DateKey): DateKey | null {
  const need = totalXpForLevel(level);
  let sum = 0;
  for (const p of periods) {
    sum += p.xp;
    if (sum >= need) return p.end < today ? p.end : today;
  }
  return null;
}
