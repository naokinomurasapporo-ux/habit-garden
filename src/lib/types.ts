// ドメイン型。保存先（localStorage / Supabase）に依存しない形で定義する。

/** ローカル日付 "YYYY-MM-DD" */
export type DateKey = string;

/** 続ける習慣 / やらない習慣 */
export type HabitKind = "build" | "quit";

/**
 * 入力方式（目標頻度 PeriodUnit とは独立）
 * - check: その日やった / やっていない（1日1回まで。週○回なら「チェックした日数」で数える）
 * - time: 分数
 * - count: 複数回（1日に何回も記録する意味がある習慣だけ。+1 で入力）
 */
export type TrackType = "check" | "time" | "count";

/** 評価の単位期間 */
export type PeriodUnit = "day" | "week" | "month";

/** 旧データの植物（v0.1 の3種）。新規データは partnerType / partnerId を使う */
export type PlantType = "monstera" | "cactus" | "sakura";

export type HabitCategory =
  | "health"
  | "lifestyle"
  | "sleep"
  | "study"
  | "career"
  | "money"
  | "relationships"
  | "mental"
  | "beauty"
  | "home"
  | "hobby"
  | "other";

/** 育成パートナーの種類 */
export type PartnerType = "plant" | "animal";

export interface Habit {
  id: string;
  name: string;
  kind: HabitKind;
  /** やらない習慣は常に "check"（守った/破った）として扱う */
  trackType: TrackType;
  /** 評価期間。時間型は常に week、やらない習慣は常に day */
  period: PeriodUnit;
  /**
   * 期間あたりの目標値
   * - check: 期間内のチェック日数（毎日なら 1）
   * - count: 期間内の合計回数
   * - time: 週間目標（分）
   * - quit: 1
   */
  target: number;
  /** 時間型の 1 日の目安（分）。任意 */
  dailyTargetMinutes?: number;
  /** 時間型の週の実施日数（1〜7）。任意（旧データには無い） */
  weeklyDays?: number;
  /**
   * 時間型：週間目標（target）をユーザーが手動で上書きしたか。
   * false/未設定なら target = 1日の目安 × 週の実施日数（自動計算値）
   */
  weeklyTargetManual?: boolean;
  /** カテゴリー（旧データに無い場合は読み込み時に "other"） */
  category: HabitCategory;
  /** 育成パートナー（旧データの plant は読み込み時に plant / その ID へ変換） */
  partnerType: PartnerType;
  partnerId: string;
  /** 旧形式の植物。後方互換のため読み込みにだけ使う */
  plant?: PlantType;
  createdAt: DateKey;
  order: number;
}

/**
 * Lv.100 到達（育成完了）の記録。コレクションに残る。
 * 同じ種類のパートナーを何度でも育て切れるよう、1件ずつ独立したレコードにしている。
 */
export interface PartnerCompletion {
  id: string;
  habitId: string;
  /** 完了時点の習慣名（習慣を削除・改名してもコレクションに残す） */
  habitName: string;
  partnerType: PartnerType;
  partnerId: string;
  completedAt: DateKey;
  /** 完了時点の累計XP */
  totalXp: number;
}

/**
 * 1 日 1 件の記録値
 * - check: 1 = 達成
 * - count: 回数
 * - time: 分
 * - quit: 1 = 守った / 0 = 破った（記録なし = 未入力）
 */
export interface HabitLog {
  habitId: string;
  date: DateKey;
  value: number;
}

/** habitId -> date -> value */
export type LogMap = Record<string, Record<DateKey, number>>;

export interface AppData {
  habits: Habit[];
  logs: LogMap;
  completions: PartnerCompletion[];
}

export type NewHabitInput = Omit<Habit, "id" | "createdAt" | "order">;
