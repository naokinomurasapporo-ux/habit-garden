import type { HabitCategory } from "./types";

export interface CategoryDef {
  id: HabitCategory;
  /** チップ用の短い名称 */
  short: string;
  name: string;
  emoji: string;
}

export const CATEGORIES: CategoryDef[] = [
  { id: "health", short: "健康", name: "健康・運動", emoji: "🏃" },
  { id: "lifestyle", short: "食事", name: "食事・生活習慣", emoji: "🍎" },
  { id: "sleep", short: "睡眠", name: "睡眠・休息", emoji: "🌙" },
  { id: "study", short: "勉強", name: "勉強・資格", emoji: "📚" },
  { id: "career", short: "仕事", name: "仕事・キャリア", emoji: "💼" },
  { id: "money", short: "お金", name: "お金・資産", emoji: "💰" },
  { id: "relationships", short: "人間関係", name: "人間関係・家族", emoji: "🤝" },
  { id: "mental", short: "メンタル", name: "メンタル・内省", emoji: "🧘" },
  { id: "beauty", short: "美容", name: "美容・身だしなみ", emoji: "✨" },
  { id: "home", short: "家事", name: "家事・生活管理", emoji: "🏠" },
  { id: "hobby", short: "趣味", name: "趣味・創作", emoji: "🎨" },
  { id: "other", short: "その他", name: "その他", emoji: "⭐" },
];

const BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

export function isHabitCategory(v: unknown): v is HabitCategory {
  return typeof v === "string" && BY_ID.has(v as HabitCategory);
}

export function getCategory(id: HabitCategory | undefined): CategoryDef {
  return (id && BY_ID.get(id)) || BY_ID.get("other")!;
}
