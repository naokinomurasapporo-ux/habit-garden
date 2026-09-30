// 「おすすめから選ぶ」の人気習慣テンプレート。
// タップしても即登録せず、作成フォームの初期値として使う（登録前に自由に変更できる）。

import type { HabitCategory, HabitKind, PeriodUnit } from "./types";

export type TemplateGoal =
  | { trackType: "check"; period: PeriodUnit; target: number }
  | { trackType: "count"; period: PeriodUnit; target: number }
  | { trackType: "time"; dailyMinutes: number; days: number };

export interface HabitTemplate {
  id: string;
  name: string;
  category: HabitCategory;
  kind: HabitKind;
  emoji: string;
  /** kind = quit のときは不要（毎日 守った/破った） */
  goal?: TemplateGoal;
}

const check = (period: PeriodUnit, target = 1): TemplateGoal => ({ trackType: "check", period, target });
const count = (period: PeriodUnit, target: number): TemplateGoal => ({ trackType: "count", period, target });
const time = (dailyMinutes: number, days: number): TemplateGoal => ({ trackType: "time", dailyMinutes, days });

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // 健康・運動
  { id: "gym", name: "ジム", category: "health", kind: "build", emoji: "🏋️", goal: check("week", 2) },
  { id: "walking", name: "ウォーキング", category: "health", kind: "build", emoji: "🚶", goal: time(30, 5) },
  { id: "running", name: "ランニング", category: "health", kind: "build", emoji: "🏃", goal: check("week", 3) },
  { id: "stretch", name: "ストレッチ", category: "health", kind: "build", emoji: "🤸", goal: check("day") },
  { id: "weigh", name: "体重測定", category: "health", kind: "build", emoji: "⚖️", goal: check("day") },
  // 食事・生活習慣
  { id: "water", name: "水を飲む", category: "lifestyle", kind: "build", emoji: "💧", goal: count("day", 6) },
  { id: "no-snack", name: "お菓子を控える", category: "lifestyle", kind: "quit", emoji: "🍪" },
  { id: "no-late-meal", name: "夜食をしない", category: "lifestyle", kind: "quit", emoji: "🍜" },
  { id: "no-alcohol", name: "飲酒しない", category: "lifestyle", kind: "quit", emoji: "🍺" },
  // 睡眠・休息
  { id: "early-sleep", name: "早寝する", category: "sleep", kind: "build", emoji: "🛏️", goal: check("day") },
  { id: "same-bedtime", name: "同じ時間に寝る", category: "sleep", kind: "build", emoji: "⏰", goal: check("day") },
  { id: "no-sns-bed", name: "寝る前のSNSをやめる", category: "sleep", kind: "quit", emoji: "📱" },
  // 勉強・資格
  { id: "reading", name: "読書", category: "study", kind: "build", emoji: "📖", goal: time(20, 7) },
  { id: "english", name: "英語学習", category: "study", kind: "build", emoji: "🔤", goal: time(30, 5) },
  { id: "certification", name: "資格勉強", category: "study", kind: "build", emoji: "📝", goal: time(60, 5) },
  { id: "morning", name: "朝活", category: "study", kind: "build", emoji: "🌅", goal: time(30, 5) },
  // 仕事・キャリア
  { id: "task-plan", name: "今日のタスク整理", category: "career", kind: "build", emoji: "🗒️", goal: check("day") },
  { id: "review", name: "振り返り", category: "career", kind: "build", emoji: "🔁", goal: check("week", 1) },
  { id: "deep-work", name: "集中作業", category: "career", kind: "build", emoji: "🎯", goal: time(60, 5) },
  // お金・資産
  { id: "household-book", name: "家計簿", category: "money", kind: "build", emoji: "🧾", goal: check("day") },
  { id: "asset-check", name: "資産確認", category: "money", kind: "build", emoji: "📊", goal: check("month", 1) },
  { id: "invest-study", name: "投資の勉強", category: "money", kind: "build", emoji: "📈", goal: time(30, 2) },
  // 人間関係・家族
  { id: "family-time", name: "家族との時間", category: "relationships", kind: "build", emoji: "👨‍👩‍👧", goal: time(30, 7) },
  { id: "gratitude", name: "感謝を伝える", category: "relationships", kind: "build", emoji: "💐", goal: check("day") },
  { id: "keep-in-touch", name: "大切な人に連絡する", category: "relationships", kind: "build", emoji: "💌", goal: check("week", 1) },
  // メンタル・内省
  { id: "meditation", name: "瞑想", category: "mental", kind: "build", emoji: "🧘", goal: time(10, 7) },
  { id: "diary", name: "日記", category: "mental", kind: "build", emoji: "📔", goal: check("day") },
  { id: "journaling", name: "ジャーナリング", category: "mental", kind: "build", emoji: "✍️", goal: check("week", 3) },
  // 美容・身だしなみ
  { id: "skincare", name: "スキンケア", category: "beauty", kind: "build", emoji: "🧴", goal: check("day") },
  { id: "sunscreen", name: "日焼け止め", category: "beauty", kind: "build", emoji: "☀️", goal: check("day") },
  { id: "dental", name: "歯のケア", category: "beauty", kind: "build", emoji: "🦷", goal: check("day") },
  // 家事・生活管理
  { id: "cleaning", name: "掃除", category: "home", kind: "build", emoji: "🧹", goal: check("week", 3) },
  { id: "laundry", name: "洗濯", category: "home", kind: "build", emoji: "👕", goal: check("week", 3) },
  { id: "tidy", name: "片付け", category: "home", kind: "build", emoji: "📦", goal: check("day") },
  // 趣味・創作
  { id: "instrument", name: "楽器", category: "hobby", kind: "build", emoji: "🎸", goal: time(30, 3) },
  { id: "art", name: "絵・創作", category: "hobby", kind: "build", emoji: "🖌️", goal: time(30, 3) },
  { id: "hobby-time", name: "趣味の時間", category: "hobby", kind: "build", emoji: "🎲", goal: time(60, 2) },
];

export function templatesFor(category: HabitCategory): HabitTemplate[] {
  return HABIT_TEMPLATES.filter((t) => t.category === category);
}

