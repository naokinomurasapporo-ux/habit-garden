// 習慣の「作成」「編集」フォームで共通に使う純粋ロジック。
// UI（HabitGoalFields）はこの状態を表示・更新するだけにして、作成画面と編集画面で同じ仕様を保つ。

import type { TemplateGoal } from "./templates";
import type { Habit, PeriodUnit, TrackType } from "./types";

// ---- 数値入力 ----

/**
 * 入力文字列 → 数値（空欄は null）。入力中は最小値で補正しない（全削除できるようにするため）。
 * 全角数字も受け付け、数字以外は取り除く。
 */
export function parseNumericInput(raw: string, max: number): number | null {
  const digits = raw.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[^0-9]/g, "");
  if (digits === "") return null;
  return Math.min(max, Number(digits));
}

/** blur 時・保存時の正規化：空欄や範囲外を min〜max に収める（空欄は fallback） */
export function normalizeNumber(value: number | null, min: number, max: number, fallback: number = min): number {
  if (value === null || Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

// ---- 時間型の目標 ----

export interface TimeGoal {
  /** 1日の目安（分）。空欄 = null */
  dailyMinutes: number | null;
  /** 週の実施日数（1〜7）。空欄 = null */
  days: number | null;
  /** ユーザーが手動で入力した週間目標（分）。weeklyManual のときだけ採用 */
  weeklyMinutes: number | null;
  /** 週間目標を手動で上書きしたか。false の間は 1日の目安 × 週日数 を自動採用 */
  weeklyManual: boolean;
}

export const TIME_LIMITS = { dailyMax: 1440, daysMin: 1, daysMax: 7, weeklyMax: 10080 } as const;

/** 自動計算値：1日の目安 × 週の実施日数 */
export function autoWeeklyMinutes(goal: Pick<TimeGoal, "dailyMinutes" | "days">): number {
  return (goal.dailyMinutes ?? 0) * (goal.days ?? 0);
}

/** 実際に採用する週間目標 */
export function effectiveWeeklyMinutes(goal: TimeGoal): number {
  return goal.weeklyManual ? (goal.weeklyMinutes ?? 0) : autoWeeklyMinutes(goal);
}

/**
 * 時間目標の更新。
 * - 週間目標を直接入力したら手動扱いにする（以後、1日の目安・週日数の変更で上書きしない）
 * - 手動でない間は、表示用の weeklyMinutes も自動計算値に追従させる
 */
export function updateTimeGoal(goal: TimeGoal, patch: Partial<Pick<TimeGoal, "dailyMinutes" | "days" | "weeklyMinutes">>): TimeGoal {
  if ("weeklyMinutes" in patch) {
    return { ...goal, ...patch, weeklyManual: true };
  }
  const next = { ...goal, ...patch };
  return next.weeklyManual ? next : { ...next, weeklyMinutes: autoWeeklyMinutes(next) };
}

/** 「自動計算に戻す」 */
export function resetTimeGoalToAuto(goal: TimeGoal): TimeGoal {
  return { ...goal, weeklyManual: false, weeklyMinutes: autoWeeklyMinutes(goal) };
}

export function defaultTimeGoal(): TimeGoal {
  return { dailyMinutes: 30, days: 5, weeklyMinutes: 150, weeklyManual: false };
}

/** 既存習慣（編集画面）から時間目標を復元。週日数が未保存の旧データは目標から推定する */
export function timeGoalFromHabit(habit: Habit): TimeGoal {
  const daily = habit.dailyTargetMinutes ?? null;
  const days =
    habit.weeklyDays ??
    (daily ? Math.max(TIME_LIMITS.daysMin, Math.min(TIME_LIMITS.daysMax, Math.round(habit.target / daily))) : 7);
  const manual = habit.weeklyTargetManual ?? habit.target !== autoWeeklyMinutes({ dailyMinutes: daily, days });
  return { dailyMinutes: daily, days, weeklyMinutes: habit.target, weeklyManual: manual };
}

// ---- 目標設定フォーム全体（入力方式・目標頻度・目標値・時間目標） ----

export interface GoalFormState {
  trackType: TrackType;
  period: PeriodUnit;
  /** チェック（週/月）・複数回の目標回数。空欄 = null */
  target: number | null;
  time: TimeGoal;
}

export function initialGoalForm(): GoalFormState {
  return { trackType: "check", period: "day", target: 1, time: defaultTimeGoal() };
}

export function goalFormFromHabit(habit: Habit): GoalFormState {
  return {
    trackType: habit.trackType,
    period: habit.trackType === "time" ? "week" : habit.period,
    target: habit.trackType === "time" ? 3 : habit.target,
    time: habit.trackType === "time" ? timeGoalFromHabit(habit) : defaultTimeGoal(),
  };
}

export function maxTargetFor(trackType: TrackType, period: PeriodUnit): number {
  if (trackType === "check") return period === "week" ? 7 : period === "month" ? 31 : 1;
  return 999;
}

/** 目標回数の入力が必要か（チェック + 毎日 は常に 1） */
export function needsTargetInput(s: Pick<GoalFormState, "trackType" | "period">): boolean {
  return s.trackType !== "time" && !(s.trackType === "check" && s.period === "day");
}

function defaultTarget(trackType: TrackType, period: PeriodUnit): number {
  if (period === "day") return trackType === "count" ? 3 : 1;
  return period === "week" ? 3 : 8;
}

/** 入力方式の変更（編集画面では呼ばない：記録タイプは変更不可） */
export function changeTrackType(s: GoalFormState, trackType: TrackType): GoalFormState {
  if (trackType === "count" && s.period === "day") return { ...s, trackType, target: defaultTarget(trackType, s.period) };
  const target = s.target === null ? null : Math.min(s.target, maxTargetFor(trackType, s.period));
  return { ...s, trackType, target };
}

export function changePeriod(s: GoalFormState, period: PeriodUnit): GoalFormState {
  return { ...s, period, target: defaultTarget(s.trackType, period) };
}

export function isGoalFormValid(s: GoalFormState): boolean {
  if (s.trackType === "time") return effectiveWeeklyMinutes(s.time) > 0;
  if (!needsTargetInput(s)) return true;
  return s.target !== null && s.target >= 1 && s.target <= maxTargetFor(s.trackType, s.period);
}

/** 保存用：フォーム状態 → Habit の目標関連フィールド */
export function goalFormToHabitFields(
  s: GoalFormState,
): Pick<Habit, "trackType" | "period" | "target" | "dailyTargetMinutes" | "weeklyDays" | "weeklyTargetManual"> {
  if (s.trackType === "time") {
    const daily = s.time.dailyMinutes ?? 0;
    return {
      trackType: "time",
      period: "week",
      target: effectiveWeeklyMinutes(s.time),
      dailyTargetMinutes: daily > 0 ? daily : undefined,
      weeklyDays: normalizeNumber(s.time.days, TIME_LIMITS.daysMin, TIME_LIMITS.daysMax, TIME_LIMITS.daysMax),
      weeklyTargetManual: s.time.weeklyManual,
    };
  }
  const target = needsTargetInput(s) ? normalizeNumber(s.target, 1, maxTargetFor(s.trackType, s.period)) : 1;
  return {
    trackType: s.trackType,
    period: s.period,
    target,
    dailyTargetMinutes: undefined,
    weeklyDays: undefined,
    weeklyTargetManual: undefined,
  };
}

/** 人気習慣テンプレートの初期値 → フォーム状態（時間型は 1日の目安 × 週日数 の自動計算） */
export function goalFormFromTemplate(goal: TemplateGoal | undefined): GoalFormState {
  if (!goal) return initialGoalForm();
  if (goal.trackType === "time") {
    return {
      ...initialGoalForm(),
      trackType: "time",
      period: "week",
      time: resetTimeGoalToAuto({ dailyMinutes: goal.dailyMinutes, days: goal.days, weeklyMinutes: null, weeklyManual: false }),
    };
  }
  return { trackType: goal.trackType, period: goal.period, target: goal.target, time: defaultTimeGoal() };
}
