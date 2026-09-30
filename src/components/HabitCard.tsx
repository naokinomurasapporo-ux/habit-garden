"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { shortDayLabel } from "@/lib/date";
import { PERIOD_WORD, UNIT_LABEL, type HabitSummary } from "@/lib/habit-logic";
import { setLog } from "@/lib/store";
import type { DateKey } from "@/lib/types";
import { MAX_LEVEL } from "@/lib/level";
import { Partner } from "./partner/Partner";

interface Props {
  summary: HabitSummary;
  /** 表示日。カードの値はこの日のもので、入力もこの日に保存する */
  date: DateKey;
  today: DateKey;
  onOpenEditor: () => void;
  /** 自動保存した直後に呼ぶ（控えめなフィードバック表示用） */
  onSaved: () => void;
  /** ホームの並び替え用（ドラッグハンドルとドラッグ中の見た目） */
  sortable?: {
    setNodeRef: (el: HTMLElement | null) => void;
    style: CSSProperties;
    isDragging: boolean;
    handle: ReactNode;
  };
}

const PAST_PERIOD_WORD = { day: "", week: "その週", month: "その月" } as const;

/** 期間の呼び方。過去日表示中は「今日」ではなく表示日・その週などにする */
function periodWord(s: HabitSummary, date: DateKey, today: DateKey): string {
  const { habit, current } = s;
  if (habit.period === "day") return shortDayLabel(date, today);
  return current.isCurrent ? PERIOD_WORD[habit.period] : PAST_PERIOD_WORD[habit.period];
}

/** 時間型以外の進捗（1行で収まる短い表記） */
function progressText(s: HabitSummary, date: DateKey, today: DateKey): string {
  const { habit, current } = s;
  if (habit.kind === "quit") return "";
  if (habit.period === "day") {
    return habit.trackType === "count" ? `${periodWord(s, date, today)} ${current.progress}/${habit.target}回` : "";
  }
  return `${periodWord(s, date, today)} ${current.progress}/${habit.target}回`;
}

const GRADE_COLOR: Record<string, string> = {
  "★": "text-amber-500",
  "◎": "text-emerald-600",
  "○": "text-emerald-600",
  "△": "text-stone-500",
};

export function HabitCard({ summary, date, today, onOpenEditor, onSaved, sortable }: Props) {
  const progress = progressText(summary, date, today);
  const { habit, streak, level, todayValue, current } = summary;
  const done = current.state === "success";
  const isTime = habit.kind === "build" && habit.trackType === "time";
  const legend = level.level >= MAX_LEVEL;
  const streakEl = (
    <span className={`whitespace-nowrap ${streak.current > 0 ? "text-orange-600" : "text-stone-400"}`}>
      🔥{streak.current}
      {UNIT_LABEL[habit.period]}
    </span>
  );

  return (
    <li
      ref={sortable?.setNodeRef}
      style={sortable?.style}
      className={`flex items-center gap-3 rounded-2xl border bg-white py-2 pr-3 ${sortable ? "pl-1" : "pl-3"} ${
        sortable?.isDragging
          ? "relative z-10 scale-[1.02] border-emerald-300 opacity-95 shadow-lg"
          : "border-stone-200 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
      }`}
    >
      {sortable?.handle}
      <Link href={`/habits/${habit.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative shrink-0 pb-1">
          <div className={`flex h-15 w-15 items-center justify-center rounded-xl ${legend ? "bg-amber-50" : "bg-emerald-50"}`}>
            <Partner partnerId={habit.partnerId} level={level.level} size={58} />
          </div>
          {/* Lv バッジは足元（下中央）に重ね、パートナー本体を隠さない。Lv.100 は「伝説」 */}
          <span
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full px-1.5 text-[10px] leading-4 font-bold whitespace-nowrap text-white shadow-sm ${legend ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-emerald-700"}`}
          >
            {legend ? "伝説" : `Lv${level.level}`}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`leading-snug font-bold break-words ${done ? "text-emerald-800" : "text-stone-800"}`}>
            {habit.name}
          </p>
          {isTime ? (
            <TimeProgress summary={summary} date={date} today={today} streak={streakEl} />
          ) : (
            <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-stone-500">
              {progress && <span className="whitespace-nowrap">{progress}</span>}
              {streakEl}
            </p>
          )}
        </div>
      </Link>
      <div className="shrink-0">
        <QuickAction
          summary={summary}
          date={date}
          dayLabel={shortDayLabel(date, today)}
          todayValue={todayValue}
          onOpenEditor={onOpenEditor}
          onSaved={onSaved}
        />
      </div>
    </li>
  );
}

/** 時間型：表示日 / その週 を 2 行で省略せずに表示 */
function TimeProgress({
  summary,
  date,
  today,
  streak,
}: {
  summary: HabitSummary;
  date: DateKey;
  today: DateKey;
  streak: ReactNode;
}) {
  const { habit, todayValue, current } = summary;
  const pct = Math.round(current.ratio * 100);
  // 進行中の週は × を出さない（50%以下の間は「進行中」）。△以上は暫定評価として表示。終わった週は確定評価
  const grade = current.grade && (current.grade !== "×" || !current.isCurrent) ? current.grade : null;
  return (
    <div className="mt-0.5 text-xs leading-snug text-stone-500">
      <p className="flex flex-wrap gap-x-2">
        <span className="whitespace-nowrap">
          {shortDayLabel(date, today)} {todayValue ?? 0}
          {habit.dailyTargetMinutes ? ` / ${habit.dailyTargetMinutes}` : ""}分
        </span>
        {streak}
      </p>
      <p className="flex flex-wrap gap-x-1.5">
        <span className="whitespace-nowrap">
          {periodWord(summary, date, today)} {current.progress} / {habit.target}分
        </span>
        <span className="whitespace-nowrap">
          {pct}%{" "}
          {grade ? (
            <span className={`font-bold ${GRADE_COLOR[grade] ?? "text-stone-400"}`}>{grade}</span>
          ) : (
            <span className="text-stone-400">進行中</span>
          )}
        </span>
      </p>
    </div>
  );
}

function QuickAction({
  summary,
  date,
  dayLabel,
  todayValue,
  onOpenEditor,
  onSaved,
}: {
  summary: HabitSummary;
  date: DateKey;
  dayLabel: string;
  todayValue: number | undefined;
  onOpenEditor: () => void;
  onSaved: () => void;
}) {
  const { habit } = summary;
  // 日々の記録は操作した瞬間に自動保存（表示日の記録として保存）
  const record = (value: number | null) => {
    setLog(habit.id, date, value);
    onSaved();
  };

  if (habit.kind === "quit") {
    // 未入力 / 守った(1) / 破った(0) の3状態。押し直すと未入力に戻る
    const toggle = (v: 0 | 1) => record(todayValue === v ? null : v);
    const kept = todayValue === 1;
    const broken = todayValue === 0;
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => toggle(1)}
          aria-pressed={kept}
          className={`h-10 rounded-full px-4 text-sm font-bold transition-colors ${kept ? "bg-emerald-600 text-white" : "border-2 border-emerald-500 bg-emerald-50 text-emerald-700 active:bg-emerald-100"}`}
        >
          {kept ? "✓ 守った" : "守った"}
        </button>
        <button
          onClick={() => toggle(0)}
          aria-pressed={broken}
          className={`h-8 rounded-full border px-2.5 text-xs transition-colors ${broken ? "border-amber-300 bg-amber-50 font-bold text-amber-700" : "border-stone-200 bg-white text-stone-400 active:bg-stone-50"}`}
        >
          破った
        </button>
      </div>
    );
  }

  if (habit.trackType === "check") {
    const checked = todayValue !== undefined && todayValue >= 1;
    return (
      <button
        onClick={() => record(checked ? null : 1)}
        aria-label={checked ? `${dayLabel}の達成を取り消す` : `${dayLabel}できた`}
        aria-pressed={checked}
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors ${checked ? "border-emerald-600 bg-emerald-600 text-white" : "border-stone-300 text-transparent active:bg-emerald-50"}`}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </button>
    );
  }

  if (habit.trackType === "count") {
    const n = todayValue ?? 0;
    return (
      <div className="flex items-center gap-1">
        {n > 0 && (
          <button
            onClick={() => record(n - 1 > 0 ? n - 1 : null)}
            aria-label="1回減らす"
            className="h-9 w-9 rounded-full text-lg text-stone-400 active:bg-stone-100"
          >
            −
          </button>
        )}
        {n > 0 && <span className="w-7 text-center text-sm font-bold text-emerald-700">{n}</span>}
        <button
          onClick={() => record(n + 1)}
          aria-label="1回追加"
          className={`h-11 w-11 rounded-full text-sm font-bold ${n > 0 ? "bg-emerald-600 text-white" : "border-2 border-stone-300 text-stone-500"}`}
        >
          +1
        </button>
      </div>
    );
  }

  const min = todayValue ?? 0;
  return (
    <button
      onClick={onOpenEditor}
      className={`h-11 rounded-full px-3 text-sm font-bold ${min > 0 ? "bg-emerald-600 text-white" : "border-2 border-stone-300 text-stone-500"}`}
    >
      {min > 0 ? `${min}分` : "+ 分"}
    </button>
  );
}
