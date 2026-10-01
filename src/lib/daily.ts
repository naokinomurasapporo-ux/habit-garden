// カレンダー用：1日単位の達成判定。保存済みの記録（LogMap）から都度計算し、データは追加しない。

import { habitStartDate } from "./habit-logic";
import { sortByOrder } from "./ordering";
import type { DateKey, Habit, LogMap } from "./types";

export interface DayHabitStatus {
  habit: Habit;
  value: number | undefined;
  achieved: boolean;
  /** 状態の短い表記（達成 / 30 / 60分 / 4 / 6回 / 守った など） */
  label: string;
  tone: "done" | "partial" | "none" | "broken";
}

export interface DaySummary {
  date: DateKey;
  /** その日の対象習慣（表示順） */
  statuses: DayHabitStatus[];
  achieved: number;
  total: number;
  perfect: boolean;
}

/**
 * 時間型の1日の目安（分）。設定が無い旧データは「週間目標 ÷ 週の実施日数（無ければ7）」の切り上げ。
 * ホームの「今日 30 / 60分」と同じ目安を使う。
 */
export function dailyMinutesGoal(habit: Habit): number {
  if (habit.dailyTargetMinutes && habit.dailyTargetMinutes > 0) return habit.dailyTargetMinutes;
  return Math.max(1, Math.ceil(habit.target / (habit.weeklyDays || 7)));
}

/** その日1日分の状態 */
export function dayHabitStatus(habit: Habit, value: number | undefined): DayHabitStatus {
  const v = value ?? 0;
  if (habit.kind === "quit") {
    if (value === 1) return { habit, value, achieved: true, label: "守った", tone: "done" };
    if (value === 0) return { habit, value, achieved: false, label: "破った", tone: "broken" };
    return { habit, value, achieved: false, label: "未入力", tone: "none" };
  }
  if (habit.trackType === "check") {
    const ok = v >= 1;
    return { habit, value, achieved: ok, label: ok ? "達成" : "未達成", tone: ok ? "done" : "none" };
  }
  if (habit.trackType === "time") {
    const goal = dailyMinutesGoal(habit);
    const ok = v >= goal;
    return { habit, value, achieved: ok, label: `${v} / ${goal}分`, tone: ok ? "done" : v > 0 ? "partial" : "none" };
  }
  // 回数型：1日目標ならその回数、週・月目標は1日の目標回数が無いため「その日に記録があれば」達成
  if (habit.period === "day") {
    const ok = v >= habit.target;
    return { habit, value, achieved: ok, label: `${v} / ${habit.target}回`, tone: ok ? "done" : v > 0 ? "partial" : "none" };
  }
  const ok = v > 0;
  return { habit, value, achieved: ok, label: `${v}回`, tone: ok ? "done" : "none" };
}

/**
 * その日に存在していた習慣か。
 * 習慣の開始日（作成日と最古の記録日の早い方）以降を対象にする。削除済みの習慣は記録ごと消えているため対象外。
 */
export function isHabitActiveOn(habit: Habit, logs: Record<DateKey, number> | undefined, date: DateKey): boolean {
  return habitStartDate(habit, logs ?? {}) <= date;
}

export function summarizeDay(habits: Habit[], logs: LogMap, date: DateKey): DaySummary {
  const statuses = sortByOrder(habits)
    .filter((h) => isHabitActiveOn(h, logs[h.id], date))
    .map((h) => dayHabitStatus(h, logs[h.id]?.[date]));
  const achieved = statuses.filter((s) => s.achieved).length;
  const total = statuses.length;
  return { date, statuses, achieved, total, perfect: total > 0 && achieved === total };
}
