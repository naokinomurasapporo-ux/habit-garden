"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { addDays, formatMonthDay, isDateKey, relativeDayLabel } from "@/lib/date";
import { summarizeDay, type DayHabitStatus } from "@/lib/daily";
import { summarize } from "@/lib/habit-logic";
import { MAX_LEVEL } from "@/lib/level";
import { markReplaceNavigation } from "@/lib/nav-history";
import { useAppState, useToday } from "@/lib/store";
import type { DateKey, HabitKind, LogMap } from "@/lib/types";
import { BackButton } from "./BackButton";
import { Loading } from "./Loading";
import { Partner } from "./partner/Partner";

const SECTIONS: { kind: HabitKind; label: string }[] = [
  { kind: "build", label: "続ける" },
  { kind: "quit", label: "やらない" },
];

const TONE_CLASS: Record<DayHabitStatus["tone"], string> = {
  done: "bg-emerald-600 text-white",
  partial: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  none: "bg-stone-100 text-stone-500",
  broken: "border border-amber-200 bg-amber-50 text-amber-700",
};

/** カレンダーから開く日別の確認画面（記録の編集はホームの日付移動・習慣詳細から） */
export function DayDetailScreen({ date }: { date: string }) {
  const { ready, data } = useAppState();
  const today = useToday();
  const router = useRouter();
  const valid = isDateKey(date);
  const calendarHref = valid ? `/calendar?month=${date.slice(0, 7)}` : "/calendar";

  const day = useMemo(() => (valid ? summarizeDay(data.habits, data.logs, date) : null), [valid, data, date]);

  if (!ready || !today) return <Loading />;

  if (!day || date > today) {
    return (
      <main className="px-4 pt-3">
        <header>
          <BackButton fallback={calendarHref} />
        </header>
        <p className="mt-16 text-center text-stone-600">
          {day ? "未来の日付は表示できません" : "日付が正しくありません"}
        </p>
      </main>
    );
  }

  // 前日・翌日は履歴を増やさずに切り替える（戻るでカレンダーへ戻れるように）
  const goDay = (key: DateKey) => {
    markReplaceNavigation();
    router.replace(`/calendar/${key}`, { scroll: false });
  };
  const next = addDays(date, 1);
  const excluded = data.habits.length - day.total;
  const pct = day.total > 0 ? Math.round((day.achieved / day.total) * 100) : 0;

  return (
    <main className="px-4 pt-3">
      <header className="flex items-center justify-between">
        <BackButton fallback={calendarHref} showHome />
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => goDay(addDays(date, -1))}
            className="h-10 rounded-full px-3 text-sm text-stone-500 active:bg-stone-100"
            aria-label="前の日"
          >
            ‹ 前日
          </button>
          <button
            type="button"
            onClick={() => goDay(next)}
            disabled={next > today}
            className="h-10 rounded-full px-3 text-sm text-stone-500 active:bg-stone-100 disabled:text-stone-300 disabled:active:bg-transparent"
            aria-label="次の日"
          >
            翌日 ›
          </button>
        </div>
      </header>

      <section
        className={`mt-2 rounded-2xl border px-4 py-3 ${day.perfect ? "border-emerald-300 bg-emerald-50" : "border-stone-200 bg-white"}`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-lg font-bold text-stone-800">{formatMonthDay(date)}</h1>
          <span className="text-xs text-stone-400">{relativeDayLabel(date, today)}</span>
        </div>
        {day.total > 0 ? (
          <>
            <p className="mt-1 flex items-baseline gap-1 text-stone-600">
              <span className="text-3xl font-black text-emerald-700">{day.achieved}</span>
              <span className="text-sm">/ {day.total} 達成</span>
              {day.perfect && (
                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-300">
                  <span className="text-amber-500">★</span> パーフェクト
                </span>
              )}
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden>
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-stone-500">この日に対象の習慣はありません</p>
        )}
      </section>

      {SECTIONS.map(({ kind, label }) => {
        const items = day.statuses.filter((s) => s.habit.kind === kind);
        if (items.length === 0) return null;
        return (
          <section key={kind} className="mt-4">
            <h2 className="mb-2 flex items-baseline gap-1.5 px-1 text-sm font-bold text-stone-600">
              {label}
              <span className="text-xs font-normal text-stone-400">
                {items.filter((s) => s.achieved).length}/{items.length}
              </span>
            </h2>
            <ul className="flex flex-col gap-2">
              {items.map((s) => (
                <HabitRow key={s.habit.id} status={s} logs={data.logs} today={today} />
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-4 px-1 text-[11px] leading-relaxed text-stone-400">
        {excluded > 0 && <>この日より後に始めた習慣（{excluded}件）は対象外です。</>}
        記録の修正は、ホームの日付移動か各習慣の詳細から行えます。
      </p>
    </main>
  );
}

function HabitRow({ status, logs, today }: { status: DayHabitStatus; logs: LogMap; today: DateKey }) {
  const { habit, label, tone, achieved } = status;
  // パートナーの姿は現在のレベル（XP は保存済み記録から都度計算）
  const level = summarize(habit, logs[habit.id], today).level.level;
  const legend = level >= MAX_LEVEL;
  return (
    <li>
      <Link
        href={`/habits/${habit.id}`}
        className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white py-2 pr-3 pl-2 active:bg-stone-50"
      >
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${legend ? "bg-amber-50" : "bg-emerald-50"}`}>
          <Partner partnerId={habit.partnerId} level={level} size={42} />
        </div>
        <p className={`min-w-0 flex-1 text-sm leading-snug font-bold break-words ${achieved ? "text-emerald-800" : "text-stone-700"}`}>
          {habit.name}
        </p>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${TONE_CLASS[tone]}`}>
          {tone === "done" && "✓ "}
          {label}
        </span>
        <span className="shrink-0 text-stone-300" aria-hidden>›</span>
      </Link>
    </li>
  );
}
