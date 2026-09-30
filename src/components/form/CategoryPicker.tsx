"use client";

import { CATEGORIES } from "@/lib/categories";
import type { HabitCategory } from "@/lib/types";

/** カテゴリーのチップ（アイコン＋短い名称）。作成・編集・おすすめで共通 */
export function CategoryChips({
  value,
  onChange,
  scroll,
}: {
  value: HabitCategory | null;
  onChange: (c: HabitCategory) => void;
  /** true なら1行の横スクロール（おすすめ画面用） */
  scroll?: boolean;
}) {
  return (
    <div className={scroll ? "-mx-4 overflow-x-auto px-4 pb-1" : ""}>
      <div className={`flex gap-2 ${scroll ? "w-max" : "flex-wrap"}`}>
        {CATEGORIES.map((c) => {
          const active = value === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              aria-pressed={active}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap ${active ? "border-emerald-500 bg-emerald-50 font-bold text-emerald-800" : "border-stone-200 bg-white text-stone-600"}`}
            >
              <span aria-hidden>{c.emoji}</span>
              {c.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
