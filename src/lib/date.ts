import type { DateKey } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: DateKey): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): DateKey {
  return toKey(new Date());
}

export function addDays(key: DateKey, n: number): DateKey {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function diffDays(from: DateKey, to: DateKey): number {
  return Math.round((fromKey(to).getTime() - fromKey(from).getTime()) / 86_400_000);
}

/** 月曜始まりの週の開始日 */
export function weekStart(key: DateKey): DateKey {
  const dow = (fromKey(key).getDay() + 6) % 7;
  return addDays(key, -dow);
}

export function monthStart(key: DateKey): DateKey {
  return `${key.slice(0, 8)}01`;
}

export function addMonths(key: DateKey, n: number): DateKey {
  const d = fromKey(monthStart(key));
  d.setMonth(d.getMonth() + n);
  return toKey(d);
}

export function daysInMonth(key: DateKey): number {
  const d = fromKey(key);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** 月曜=0 … 日曜=6 */
export function weekdayIndex(key: DateKey): number {
  return (fromKey(key).getDay() + 6) % 7;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatMonthDay(key: DateKey): string {
  const d = fromKey(key);
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS[d.getDay()]})`;
}

/** today から見た相対表記：今日 / 昨日 / n日前 */
export function relativeDayLabel(key: DateKey, today: DateKey): string {
  const n = diffDays(key, today);
  if (n <= 0) return "今日";
  if (n === 1) return "昨日";
  return `${n}日前`;
}

/** 短い日付表記：今日 / 昨日 / 9/29 */
export function shortDayLabel(key: DateKey, today: DateKey): string {
  const n = diffDays(key, today);
  if (n <= 0) return "今日";
  if (n === 1) return "昨日";
  const d = fromKey(key);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function formatYearMonth(key: DateKey): string {
  const d = fromKey(key);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function minKey(a: DateKey, b: DateKey): DateKey {
  return a < b ? a : b;
}

/** "YYYY-MM-DD" として正しい日付か（URL から受け取る日付の検証用） */
export function isDateKey(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && toKey(fromKey(s)) === s;
}
