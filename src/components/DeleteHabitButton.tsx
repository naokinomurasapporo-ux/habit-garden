"use client";

import { useState } from "react";
import { deleteHabit } from "@/lib/store";
import type { Habit } from "@/lib/types";
import { useReturnTo } from "./BackButton";

/** 習慣の削除（2段階確認）。詳細画面・編集画面で共通 */
export function DeleteHabitButton({ habit }: { habit: Habit }) {
  const returnTo = useReturnTo();
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className="mt-8 w-full py-2 text-sm text-stone-400">
        この習慣を削除
      </button>
    );
  }
  return (
    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
      <p className="text-sm text-red-700">「{habit.name}」と記録・植物をすべて削除します。</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setConfirming(false)} className="rounded-xl border border-stone-200 bg-white py-2 text-sm">
          やめる
        </button>
        <button
          type="button"
          onClick={() => {
            deleteHabit(habit.id);
            returnTo(habit.kind === "quit" ? "/?tab=quit" : "/");
          }}
          className="rounded-xl bg-red-600 py-2 text-sm font-bold text-white"
        >
          削除する
        </button>
      </div>
    </div>
  );
}
