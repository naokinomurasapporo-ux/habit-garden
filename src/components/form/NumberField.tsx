"use client";

import { normalizeNumber, parseNumericInput } from "@/lib/habit-form";

interface Props {
  /** 空欄は null */
  value: number | null;
  onChange: (v: number | null) => void;
  min: number;
  max: number;
  /** −/＋ボタンの増減幅 */
  step: number;
  unit: string;
  prefix?: string;
  /** blur 時に空欄だった場合の値（省略時は min） */
  emptyValue?: number;
  label?: string;
}

/**
 * 数値入力欄。
 * - 入力中は空欄を許容し、最小値で補正しない（全削除できる）
 * - blur 時にだけ min〜max に正規化する
 * - iPhone では type="number" より text + inputMode="numeric" の方が安定するためこちらを使う
 */
export function NumberField({ value, onChange, min, max, step, unit, prefix, emptyValue, label }: Props) {
  const stepBy = (delta: number) => onChange(normalizeNumber((value ?? 0) + delta, min, max));
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => stepBy(-step)}
        className="h-11 w-11 shrink-0 rounded-full bg-stone-100 text-xl text-stone-600 active:bg-stone-200"
        aria-label={`${label ?? ""}を減らす`}
      >
        −
      </button>
      <label className="flex min-w-0 flex-1 items-baseline justify-center gap-1 rounded-xl border border-stone-200 bg-white py-2 focus-within:border-emerald-500">
        {prefix && <span className="shrink-0 text-sm text-stone-500">{prefix}</span>}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          aria-label={label}
          value={value === null ? "" : String(value)}
          onChange={(e) => onChange(parseNumericInput(e.target.value, max))}
          onBlur={() => {
            const normalized = normalizeNumber(value, min, max, emptyValue ?? min);
            if (normalized !== value) onChange(normalized);
          }}
          className="w-20 min-w-0 text-center text-2xl font-bold text-stone-800 outline-none"
        />
        <span className="shrink-0 text-sm text-stone-500">{unit}</span>
      </label>
      <button
        type="button"
        onClick={() => stepBy(step)}
        className="h-11 w-11 shrink-0 rounded-full bg-stone-100 text-xl text-stone-600 active:bg-stone-200"
        aria-label={`${label ?? ""}を増やす`}
      >
        ＋
      </button>
    </div>
  );
}
