"use client";

import { useState } from "react";
import { addDays, addMonths, daysInMonth, formatYearMonth, monthStart, weekdayIndex } from "@/lib/date";
import { heatLevel } from "@/lib/habit-logic";
import type { DateKey, Habit } from "@/lib/types";
import { HEAT_CLASS } from "./heat";

interface Props {
  habit: Habit;
  logs: Record<DateKey, number>;
  today: DateKey;
  onSelect: (date: DateKey) => void;
}

const WEEK_HEAD = ["月", "火", "水", "木", "金", "土", "日"];

/** 過去の記録を修正するための月カレンダー（未来日は選択不可） */
export function MonthCalendar({ habit, logs, today, onSelect }: Props) {
  const [month, setMonth] = useState(() => monthStart(today));
  const isCurrentMonth = month === monthStart(today);
  const lead = weekdayIndex(month);
  const days = Array.from({ length: daysInMonth(month) }, (_, i) => addDays(month, i));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => setMonth(addMonths(month, -1))} className="px-3 py-1 text-stone-500" aria-label="前の月">‹</button>
        <p className="text-sm font-bold text-stone-700">{formatYearMonth(month)}</p>
        <button
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={isCurrentMonth}
          className="px-3 py-1 text-stone-500 disabled:opacity-20"
          aria-label="次の月"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEK_HEAD.map((w) => (
          <span key={w} className="text-[10px] text-stone-400">{w}</span>
        ))}
        {Array.from({ length: lead }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {days.map((d) => {
          const future = d > today;
          const level = heatLevel(habit, logs[d]);
          const v = logs[d];
          const filled = level > 0 || level === -1;
          const label =
            v === undefined || habit.kind === "quit" || habit.trackType === "check" ? "" : String(v);
          return (
            <button
              key={d}
              disabled={future}
              onClick={() => onSelect(d)}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs ${future ? "text-stone-300" : filled ? `${HEAT_CLASS[level]} ${level >= 3 ? "text-white" : "text-stone-700"}` : "bg-white text-stone-600 active:bg-stone-100"} ${d === today ? "ring-2 ring-emerald-600" : ""}`}
            >
              <span className="leading-none">{Number(d.slice(8))}</span>
              {label && <span className="mt-0.5 text-[9px] leading-none opacity-80">{label}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
