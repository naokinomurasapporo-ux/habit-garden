"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { addDays, formatMonthDay, relativeDayLabel, shortDayLabel } from "@/lib/date";
import { summarizeOn, type HabitSummary } from "@/lib/habit-logic";
import { sortByOrder } from "@/lib/ordering";
import { buildSampleData } from "@/lib/sample";
import { replaceAllData, useAppState, useToday } from "@/lib/store";
import type { DateKey, HabitKind } from "@/lib/types";
import { Loading } from "./Loading";
import { Partner } from "./partner/Partner";
import { QuickTimeSheet } from "./QuickTimeSheet";
import { SortableHabitList } from "./SortableHabitList";

const SECTIONS: { kind: HabitKind; label: string }[] = [
  { kind: "build", label: "続ける" },
  { kind: "quit", label: "やらない" },
];

export function HomeScreen() {
  const { ready, data } = useAppState();
  const today = useToday();
  // 表示日（null = 今日）。日付が変わっても「今日」表示なら自動で新しい今日に追従する
  const [selected, setSelected] = useState<DateKey | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  // 自動保存フィードバック：値を変えるたびに要素を作り直し、CSS アニメーションで約1秒表示する
  const [savedToast, setSavedToast] = useState(0);
  const showSaved = () => setSavedToast((n) => n + 1);

  // 未来日は表示しない（表示日は常に today 以前）
  const viewDate = today && selected && selected < today ? selected : today;
  const isPast = viewDate !== today;

  // XP・Lv・ストリークは保存済み記録から今日時点で都度再計算、カードの値は表示日のもの
  const summaries = useMemo(
    () =>
      today
        ? sortByOrder(data.habits).map((h) => summarizeOn(h, data.logs[h.id], today, viewDate))
        : [],
    [data, today, viewDate],
  );

  if (!ready || !today) return <Loading />;

  const entered = summaries.filter((s) =>
    s.habit.kind === "quit" ? s.todayValue !== undefined : (s.todayValue ?? 0) > 0 || s.current.state === "success",
  ).length;
  const editing = summaries.find((s) => s.habit.id === editingId);

  return (
    <main
      // レイアウト側の余白（ナビ高さ + 1.5rem）に＋ボタン分を足し、最下部のカードが＋ボタンの上に出るようにする
      className="px-4 pt-5 pb-[calc(var(--fab-gap)+var(--fab-size))]"
    >
      <header className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          {summaries.length > 0 && (
            <p className="text-xs text-stone-500">
              {shortDayLabel(viewDate, today)}の積み上げ{" "}
              <span className="font-bold text-emerald-700">{entered}</span>/{summaries.length}
            </p>
          )}
          <h1 className="text-xl font-bold tracking-tight text-emerald-900">Habit Garden</h1>
        </div>
        <Link
          href="/calendar"
          className="flex h-9 shrink-0 items-center gap-1 rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-stone-600 active:bg-stone-50"
        >
          <span aria-hidden>📅</span>カレンダー
        </Link>
      </header>

      {summaries.length > 0 && (
        <DateNav
          date={viewDate}
          today={today}
          onMove={(n) => setSelected(addDays(viewDate, n))}
          onToday={() => setSelected(null)}
        />
      )}

      {summaries.length === 0 ? (
        <EmptyState onSample={() => replaceAllData(buildSampleData(today))} />
      ) : (
        SECTIONS.map((section) => (
          <HabitSection
            key={section.kind}
            kind={section.kind}
            label={section.label}
            summaries={summaries.filter((s) => s.habit.kind === section.kind)}
            date={viewDate}
            today={today}
            onOpenEditor={setEditingId}
            onSaved={showSaved}
          />
        ))
      )}

      <Link
        href="/habits/new"
        className="fixed right-[max(1rem,calc(50%-14rem+1rem))] bottom-(--fab-bottom) z-20 flex size-(--fab-size) items-center justify-center rounded-full bg-emerald-600 text-3xl text-white shadow-lg active:bg-emerald-700"
        aria-label="習慣を追加"
      >
        ＋
      </Link>

      {editing && (
        <QuickTimeSheet
          habit={editing.habit}
          date={viewDate}
          today={today}
          value={editing.todayValue}
          onClose={() => setEditingId(null)}
        />
      )}

      {savedToast > 0 && !editing && (
        <div
          key={savedToast}
          role="status"
          className="hg-fade-out fixed inset-x-0 bottom-[calc(var(--nav-total)+0.75rem)] z-30 flex justify-center"
        >
          <span className="rounded-full bg-stone-800/85 px-3 py-1 text-xs text-white shadow">
            ✓ {isPast ? `${shortDayLabel(viewDate, today)}の記録を` : ""}保存しました
          </span>
        </div>
      )}
    </main>
  );
}

function HabitSection({
  kind,
  label,
  summaries,
  date,
  today,
  onOpenEditor,
  onSaved,
}: {
  kind: HabitKind;
  label: string;
  summaries: HabitSummary[];
  date: DateKey;
  today: DateKey;
  onOpenEditor: (id: string) => void;
  onSaved: () => void;
}) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 flex items-baseline gap-1.5 px-1 text-sm font-bold text-stone-600">
        {label}
        <span className="text-xs font-normal text-stone-400">{summaries.length}</span>
      </h2>
      {summaries.length > 0 ? (
        <SortableHabitList
          kind={kind}
          summaries={summaries}
          date={date}
          today={today}
          onOpenEditor={onOpenEditor}
          onSaved={onSaved}
        />
      ) : (
        <Link
          href={`/habits/new${kind === "quit" ? "?kind=quit" : ""}`}
          className="block rounded-2xl border border-dashed border-stone-300 py-3 text-center text-sm text-stone-500"
        >
          ＋ {kind === "build" ? "続けたい習慣を追加" : "やめたい習慣を追加"}
        </Link>
      )}
    </section>
  );
}

/** 1日ずつ前後する日付ナビ。未来日には進めない */
function DateNav({
  date,
  today,
  onMove,
  onToday,
}: {
  date: DateKey;
  today: DateKey;
  onMove: (days: number) => void;
  onToday: () => void;
}) {
  const isPast = date < today;
  const arrow = "h-10 shrink-0 rounded-full px-3 text-sm whitespace-nowrap transition-colors";
  return (
    <nav
      aria-label="表示する日付"
      className={`mt-3 flex items-center justify-between gap-2 rounded-2xl border px-1 py-1 ${isPast ? "border-amber-200 bg-amber-50" : "border-stone-200 bg-white"}`}
    >
      <button type="button" onClick={() => onMove(-1)} className={`${arrow} text-stone-600 active:bg-stone-100`}>
        ‹ 前の日
      </button>
      <div className="min-w-0 text-center" aria-live="polite">
        <p className={`text-sm font-bold whitespace-nowrap ${isPast ? "text-amber-900" : "text-stone-800"}`}>
          {formatMonthDay(date)}
        </p>
        {isPast ? (
          <p className="text-[11px] leading-4 text-amber-700">
            {relativeDayLabel(date, today)}
            <span className="mx-1 text-amber-300">·</span>
            <button type="button" onClick={onToday} className="underline underline-offset-2 active:text-amber-900">
              今日へ
            </button>
          </p>
        ) : (
          <p className="text-[11px] leading-4 text-stone-400">今日</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={!isPast}
        className={`${arrow} text-stone-600 active:bg-stone-100 disabled:text-stone-300 disabled:active:bg-transparent`}
      >
        次の日 ›
      </button>
    </nav>
  );
}

function EmptyState({ onSample }: { onSample: () => void }) {
  return (
    <div className="mt-10 flex flex-col items-center text-center">
      <Partner partnerId="monstera" level={1} size={96} />
      <p className="mt-3 font-bold text-stone-700">続けたい習慣を植えましょう</p>
      <p className="mt-1 text-sm text-stone-500">記録するたびに植物が育ちます</p>
      <Link href="/habits/new" className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white">
        習慣を追加する
      </Link>
      <button onClick={onSample} className="mt-3 text-sm text-emerald-700 underline">
        サンプルデータで試す
      </button>
    </div>
  );
}
