"use client";

import { useState } from "react";
import { formatMonthDay } from "@/lib/date";
import { setLog } from "@/lib/store";
import type { DateKey, Habit } from "@/lib/types";
import { Sheet } from "./Sheet";

interface Props {
  habit: Habit;
  date: DateKey | null;
  value: number | undefined;
  onClose: () => void;
}

/** 任意の日の記録を入力・修正するシート（時間型の入力にも使う） */
export function LogEditorSheet({ habit, date, value, onClose }: Props) {
  return (
    <Sheet
      open={date !== null}
      onClose={onClose}
      title={habit.name}
      subtitle={date ? `${formatMonthDay(date)}の記録` : undefined}
    >
      {date && (
        <EditorBody key={`${habit.id}-${date}`} habit={habit} date={date} value={value} onClose={onClose} />
      )}
    </Sheet>
  );
}

function EditorBody({ habit, date, value, onClose }: Props & { date: DateKey }) {
  const save = (v: number | null) => {
    setLog(habit.id, date, v);
    onClose();
  };

  if (habit.kind === "quit") {
    return (
      <div className="grid grid-cols-3 gap-2">
        <ChoiceButton active={value === 1} onClick={() => save(1)} tone="green">守った</ChoiceButton>
        <ChoiceButton active={value === 0} onClick={() => save(0)} tone="amber">破った</ChoiceButton>
        <ChoiceButton active={value === undefined} onClick={() => save(null)} tone="stone">未入力</ChoiceButton>
      </div>
    );
  }

  if (habit.trackType === "check") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <ChoiceButton active={value !== undefined && value >= 1} onClick={() => save(1)} tone="green">できた</ChoiceButton>
        <ChoiceButton active={!value} onClick={() => save(null)} tone="stone">記録なし</ChoiceButton>
      </div>
    );
  }

  return <AmountEditor habit={habit} initial={value ?? 0} onSave={(v) => save(v > 0 ? v : null)} />;
}

function AmountEditor({ habit, initial, onSave }: { habit: Habit; initial: number; onSave: (v: number) => void }) {
  const [amount, setAmount] = useState(initial);
  const isTime = habit.trackType === "time";
  const unit = isTime ? "分" : "回";
  const steps = isTime ? [5, 15, 30, 60] : [1];
  const clamp = (n: number) => Math.max(0, Math.min(isTime ? 1440 : 999, Math.round(n)));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(amount);
      }}
    >
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setAmount((a) => clamp(a - (isTime ? 5 : 1)))}
          className="h-11 w-11 rounded-full bg-stone-100 text-xl text-stone-600 active:bg-stone-200"
          aria-label="減らす"
        >
          −
        </button>
        <label className="flex items-baseline gap-1">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={amount === 0 ? "" : amount}
            placeholder="0"
            onChange={(e) => setAmount(clamp(Number(e.target.value) || 0))}
            className="w-24 rounded-xl border border-stone-200 py-2 text-center text-3xl font-bold text-stone-800 outline-none focus:border-emerald-500"
            autoFocus={isTime}
          />
          <span className="text-stone-500">{unit}</span>
        </label>
        <button
          type="button"
          onClick={() => setAmount((a) => clamp(a + (isTime ? 5 : 1)))}
          className="h-11 w-11 rounded-full bg-stone-100 text-xl text-stone-600 active:bg-stone-200"
          aria-label="増やす"
        >
          ＋
        </button>
      </div>
      {isTime && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {steps.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setAmount((a) => clamp(a + s))}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700 active:bg-emerald-100"
            >
              +{s}分
            </button>
          ))}
          {habit.dailyTargetMinutes ? (
            <button
              type="button"
              onClick={() => setAmount(habit.dailyTargetMinutes ?? 0)}
              className="rounded-full border border-stone-200 px-3 py-1 text-sm text-stone-600"
            >
              目安 {habit.dailyTargetMinutes}分
            </button>
          ) : null}
        </div>
      )}
      <button type="submit" className="mt-5 w-full rounded-xl bg-emerald-600 py-3 font-bold text-white active:bg-emerald-700">
        保存
      </button>
    </form>
  );
}

function ChoiceButton({
  active,
  tone,
  onClick,
  children,
}: {
  active: boolean;
  tone: "green" | "amber" | "stone";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const activeCls = {
    green: "border-emerald-600 bg-emerald-600 text-white",
    amber: "border-amber-500 bg-amber-500 text-white",
    stone: "border-stone-400 bg-stone-400 text-white",
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border py-3 font-bold ${active ? activeCls : "border-stone-200 bg-white text-stone-600"}`}
    >
      {children}
    </button>
  );
}
