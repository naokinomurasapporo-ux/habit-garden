"use client";

import { useState } from "react";
import { shortDayLabel } from "@/lib/date";
import { setLog } from "@/lib/store";
import type { DateKey, Habit } from "@/lib/types";
import { Sheet } from "./Sheet";

interface Props {
  habit: Habit;
  date: DateKey;
  today: DateKey;
  value: number | undefined;
  onClose: () => void;
}

const MAX_MINUTES = 1440;

/** ホーム用の時間入力。保存ボタンは無く、変更した瞬間に自動保存する */
export function QuickTimeSheet({ habit, date, today, value, onClose }: Props) {
  return (
    <Sheet
      open
      onClose={onClose}
      title={habit.name}
      subtitle={`${shortDayLabel(date, today)}の時間・入力すると自動で保存されます`}
    >
      <Body key={`${habit.id}-${date}`} habit={habit} date={date} initial={value ?? 0} onClose={onClose} />
    </Sheet>
  );
}

function Body({ habit, date, initial, onClose }: { habit: Habit; date: DateKey; initial: number; onClose: () => void }) {
  const [minutes, setMinutes] = useState(initial);
  const [savedAt, setSavedAt] = useState(0);

  const update = (next: number) => {
    const v = Math.max(0, Math.min(MAX_MINUTES, Math.round(next)));
    setMinutes(v);
    setLog(habit.id, date, v > 0 ? v : null);
    setSavedAt((n) => n + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => update(minutes - 5)}
          className="h-11 w-11 rounded-full bg-stone-100 text-xl text-stone-600 active:bg-stone-200"
          aria-label="5分減らす"
        >
          −
        </button>
        <label className="flex items-baseline gap-1">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={minutes === 0 ? "" : minutes}
            placeholder="0"
            onChange={(e) => update(Number(e.target.value) || 0)}
            className="w-24 rounded-xl border border-stone-200 py-2 text-center text-3xl font-bold text-stone-800 outline-none focus:border-emerald-500"
          />
          <span className="text-stone-500">分</span>
        </label>
        <button
          type="button"
          onClick={() => update(minutes + 5)}
          className="h-11 w-11 rounded-full bg-stone-100 text-xl text-stone-600 active:bg-stone-200"
          aria-label="5分増やす"
        >
          ＋
        </button>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {[15, 30, 60].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => update(minutes + s)}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 active:bg-emerald-100"
          >
            +{s}分
          </button>
        ))}
        {habit.dailyTargetMinutes ? (
          <button
            type="button"
            onClick={() => update(habit.dailyTargetMinutes ?? 0)}
            className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600"
          >
            目安 {habit.dailyTargetMinutes}分
          </button>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        {/* key を変えて毎回フェードを再生する控えめな保存表示 */}
        <p key={savedAt} className={`text-xs text-emerald-700 ${savedAt ? "hg-fade-out" : "invisible"}`} aria-live="polite">
          ✓ 保存しました
        </p>
        <button type="button" onClick={onClose} className="rounded-xl border border-stone-200 px-5 py-2 text-sm text-stone-600">
          閉じる
        </button>
      </div>
    </div>
  );
}
