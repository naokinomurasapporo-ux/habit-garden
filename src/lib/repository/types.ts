import type { AppData, DateKey, Habit, HabitLog, PartnerCompletion } from "../types";

/**
 * 永続化層のインターフェース。
 * MVP では localStorage 実装を使い、将来は同じインターフェースで Supabase 実装に差し替える。
 * （habits テーブル / habit_logs テーブル(habit_id, date, value) にそのまま対応する粒度）
 */
export interface HabitRepository {
  load(): Promise<AppData>;
  createHabit(habit: Habit): Promise<void>;
  updateHabit(habit: Habit): Promise<void>;
  deleteHabit(id: string): Promise<void>;
  /** 並び順（order）だけをまとめて更新 */
  updateHabitOrders(orders: { id: string; order: number }[]): Promise<void>;
  upsertLog(log: HabitLog): Promise<void>;
  deleteLog(habitId: string, date: DateKey): Promise<void>;
  /** 育成完了（Lv.100）の記録を追加 */
  addCompletions(list: PartnerCompletion[]): Promise<void>;
  /** インポート・リセット用 */
  replaceAll(data: AppData): Promise<void>;
}
