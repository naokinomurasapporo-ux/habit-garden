"use client";

import { addDays, formatMonthDay, weekStart } from "@/lib/date";
import { heatLevel } from "@/lib/habit-logic";
import type { DateKey, Habit } from "@/lib/types";
import { HEAT_CLASS } from "./heat";

interface Props {
  habit: Habit;
  logs: Record<DateKey, number>;
  today: DateKey;
  weeks?: number;
  onSelect: (date: DateKey) => void;
}

const DAY_LABELS = ["月", "", "水", "", "金", "", "日"];

/** 列 = 週（月〜日）、行 = 曜日 のヒートマップ */
export function Heatmap({ habit, logs, today, weeks = 18, onSelect }: Props) {
  const first = addDays(weekStart(today), -7 * (weeks - 1));
  const days: DateKey[] = Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i));

  return (
    <div>
      <div className="flex gap-1.5">
        <div className="grid grid-rows-7 gap-[3px] text-[9px] leading-none text-stone-400">
          {DAY_LABELS.map((l, i) => (
            <span key={i} className="flex h-3.5 items-center">{l}</span>
          ))}
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-[3px]">
          {days.map((d) => {
            const future = d > today;
            return (
              <button
                key={d}
                type="button"
                disabled={future}
                onClick={() => onSelect(d)}
                title={formatMonthDay(d)}
                aria-label={formatMonthDay(d)}
                className={`aspect-square w-full max-w-3.5 rounded-[3px] ${future ? "bg-transparent" : HEAT_CLASS[heatLevel(habit, logs[d])]} ${d === today ? "ring-1 ring-emerald-900" : ""}`}
              />
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
        <span>{formatMonthDay(first)}〜</span>
        <span className="flex items-center gap-1">
          少
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className={`inline-block h-2.5 w-2.5 rounded-[2px] ${HEAT_CLASS[l]}`} />
          ))}
          多
        </span>
      </div>
    </div>
  );
}
