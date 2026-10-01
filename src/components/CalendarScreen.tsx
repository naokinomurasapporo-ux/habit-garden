"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { addDays, addMonths, daysInMonth, formatYearMonth, monthStart, weekdayIndex } from "@/lib/date";
import { summarizeDay, type DaySummary } from "@/lib/daily";
import { useAppState, useToday } from "@/lib/store";
import type { DateKey } from "@/lib/types";
import { BackButton } from "./BackButton";
import { Loading } from "./Loading";

const WEEK_HEAD = ["月", "火", "水", "木", "金", "土", "日"];

/** URL の ?month=YYYY-MM（戻ったときも同じ月を表示するため URL に持つ） */
function parseMonth(m: string | null): DateKey | null {
  return m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? `${m}-01` : null;
}

export function CalendarScreen() {
  const { ready, data } = useAppState();
  const today = useToday();
  const router = useRouter();
  const params = useSearchParams();
  const month = parseMonth(params.get("month")) ?? (today ? monthStart(today) : "");

  // 未来日は達成数を出さない
  const days = useMemo(() => {
    if (!month || !today) return [];
    return Array.from({ length: daysInMonth(month) }, (_, i) => {
      const date = addDays(month, i);
      return { date, summary: date <= today ? summarizeDay(data.habits, data.logs, date) : null };
    });
  }, [month, today, data]);

  if (!ready || !today) return <Loading />;

  const isThisMonth = month === monthStart(today);
  // 月の切り替えは履歴を増やさない（戻る操作で月を1つずつ遡らないように）
  const goMonth = (key: DateKey) => {
    const target = key === monthStart(today) ? "/calendar" : `/calendar?month=${key.slice(0, 7)}`;
    router.replace(target, { scroll: false });
  };
  const recorded = days.filter((d) => d.summary && d.summary.achieved > 0).length;
  const perfect = days.filter((d) => d.summary?.perfect).length;

  return (
    <main className="px-4 pt-3">
      <header className="flex items-center justify-between">
        <BackButton fallback="/" />
        <h1 className="text-base font-bold text-stone-800">カレンダー</h1>
        <span className="w-16" aria-hidden />
      </header>

      <div className="mt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goMonth(addMonths(month, -1))}
          className="h-10 rounded-full px-3 text-sm text-stone-600 active:bg-stone-100"
          aria-label="前の月"
        >
          ‹ 前月
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-900">{formatYearMonth(month)}</p>
          {!isThisMonth && (
            <button type="button" onClick={() => goMonth(monthStart(today))} className="text-[11px] text-emerald-700 underline underline-offset-2">
              今月へ
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => goMonth(addMonths(month, 1))}
          className="h-10 rounded-full px-3 text-sm text-stone-600 active:bg-stone-100"
          aria-label="次の月"
        >
          次月 ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center">
        {WEEK_HEAD.map((w, i) => (
          <span key={w} className={`pb-0.5 text-[11px] ${i === 5 ? "text-sky-600" : i === 6 ? "text-rose-500" : "text-stone-400"}`}>
            {w}
          </span>
        ))}
        {Array.from({ length: weekdayIndex(month) }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {days.map(({ date, summary }) => (
          <DayCell key={date} date={date} summary={summary} isToday={date === today} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 text-[11px] text-stone-500">
        <span>
          記録した日 <b className="text-stone-700">{recorded}</b>日・パーフェクト{" "}
          <b className="text-emerald-700">{perfect}</b>日
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-3 rounded bg-emerald-100 ring-1 ring-emerald-300" aria-hidden />
          <span className="text-amber-500">★</span>すべて達成
        </span>
      </div>
      <p className="mt-2 px-1 text-[11px] text-stone-400">日付をタップするとその日の習慣が見られます</p>
    </main>
  );
}

function DayCell({ date, summary, isToday }: { date: DateKey; summary: DaySummary | null; isToday: boolean }) {
  const day = Number(date.slice(8));
  const ring = isToday ? "ring-2 ring-emerald-600" : "";

  // 未来日：日付だけ（押せない）
  if (!summary) {
    return (
      <div className="flex h-14 flex-col items-center rounded-xl pt-1.5 text-[11px] leading-none text-stone-300" aria-hidden>
        {day}
      </div>
    );
  }

  const { achieved, total, perfect } = summary;
  const bg = perfect ? "bg-emerald-100 ring-1 ring-emerald-300" : total > 0 ? "bg-white" : "bg-white/50";
  return (
    <Link
      href={`/calendar/${date}`}
      aria-label={`${Number(date.slice(5, 7))}月${day}日 ${total > 0 ? `${achieved}/${total}達成` : "対象の習慣なし"}${perfect ? " パーフェクト" : ""}`}
      className={`relative flex h-14 flex-col items-center rounded-xl pt-1.5 active:bg-emerald-50 ${bg} ${ring}`}
    >
      <span className={`text-[11px] leading-none ${perfect ? "font-bold text-emerald-800" : "text-stone-500"}`}>{day}</span>
      {perfect && <span className="absolute top-0.5 right-1 text-[9px] leading-none text-amber-500" aria-hidden>★</span>}
      {total > 0 && (
        <span className="mt-1.5 flex items-baseline leading-none">
          <span className={`text-base font-bold ${perfect ? "text-emerald-800" : achieved > 0 ? "text-emerald-700" : "text-stone-300"}`}>
            {achieved}
          </span>
          <span className="text-[9px] text-stone-400">/{total}</span>
        </span>
      )}
    </Link>
  );
}
