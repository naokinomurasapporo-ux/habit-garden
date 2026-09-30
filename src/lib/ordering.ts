import type { Habit, HabitKind } from "./types";

/** 表示順（order 昇順。同値は保存順）で並べる */
export function sortByOrder(habits: Habit[]): Habit[] {
  return habits
    .map((h, i) => ({ h, i }))
    .sort((a, b) => a.h.order - b.h.order || a.i - b.i)
    .map((x) => x.h);
}

/**
 * 「続ける」「やらない」どちらか一方のセクション内だけを orderedIds の順に並び替える。
 * - 他セクションの習慣の相対順・位置は変えない（セクション跨ぎは起こらない）
 * - order は全体で 1.. に振り直す（旧データの重複した order もここで解消される）
 * - orderedIds がそのセクションの習慣と一致しない場合は何もしない
 */
export function reorderWithinKind(habits: Habit[], kind: HabitKind, orderedIds: string[]): Habit[] {
  const sorted = sortByOrder(habits);
  const sectionIds = sorted.filter((h) => h.kind === kind).map((h) => h.id);
  const sameSet =
    orderedIds.length === sectionIds.length &&
    new Set(orderedIds).size === orderedIds.length &&
    sectionIds.every((id) => orderedIds.includes(id));
  if (!sameSet) return habits;

  const byId = new Map(habits.map((h) => [h.id, h]));
  let k = 0;
  const sequence = sorted.map((h) => (h.kind === kind ? byId.get(orderedIds[k++])! : h));
  const newOrder = new Map(sequence.map((h, i) => [h.id, i + 1]));
  return habits.map((h) => (newOrder.get(h.id) === h.order ? h : { ...h, order: newOrder.get(h.id)! }));
}
