"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { goalFormFromHabit, goalFormToHabitFields, isGoalFormValid, type GoalFormState } from "@/lib/habit-form";
import { getPartner } from "@/lib/partners";
import { updateHabit, useAppState } from "@/lib/store";
import type { Habit, HabitCategory } from "@/lib/types";
import { DeleteHabitButton } from "./DeleteHabitButton";
import { CategoryChips } from "./form/CategoryPicker";
import { Field } from "./form/FormParts";
import { HabitGoalFields } from "./form/HabitGoalFields";
import { PartnerPicker } from "./form/PartnerPicker";
import { Loading } from "./Loading";

export function HabitEditScreen({ id }: { id: string }) {
  const { ready, data } = useAppState();
  const habit = data.habits.find((h) => h.id === id);

  if (!ready) return <Loading />;
  if (!habit) {
    return (
      <main className="px-4 pt-16 text-center">
        <p className="text-stone-600">習慣が見つかりませんでした</p>
        <Link href="/" className="mt-4 inline-block text-emerald-700 underline">ホームへ戻る</Link>
      </main>
    );
  }
  // 読み込み完了後の習慣でフォームを初期化する（key で習慣ごとに作り直す）
  return <EditForm key={habit.id} habit={habit} />;
}

/**
 * 設定の編集。日々の記録と違い自動保存はせず「変更を保存」で確定する。
 * 記録タイプ（入力方式）は変更不可。過去の記録データは一切書き換えない。
 */
function EditForm({ habit }: { habit: Habit }) {
  const router = useRouter();
  const [name, setName] = useState(habit.name);
  const [goal, setGoal] = useState<GoalFormState>(() => goalFormFromHabit(habit));
  const [category, setCategory] = useState<HabitCategory>(habit.category);
  const [partnerId, setPartnerId] = useState(habit.partnerId);
  const isQuit = habit.kind === "quit";
  const detailHref = `/habits/${habit.id}`;

  const canSave = name.trim().length > 0 && (isQuit || isGoalFormValid(goal));

  const save = () => {
    if (!canSave) return;
    const partner = getPartner(partnerId);
    const common = { name: name.trim(), category, partnerType: partner.type, partnerId: partner.id };
    const next: Habit = isQuit
      ? { ...habit, ...common }
      : // 記録タイプは元の値で固定（フォーム側でもロックしているが念のため）
        { ...habit, ...common, ...goalFormToHabitFields(goal), trackType: habit.trackType };
    updateHabit(next);
    router.replace(detailHref);
  };

  return (
    <main className="flex min-h-dvh flex-col px-4 pt-4">
      <header className="flex items-center justify-between">
        <Link href={detailHref} className="py-2 pr-3 text-sm text-stone-500">キャンセル</Link>
        <h1 className="text-base font-bold text-stone-800">習慣を編集</h1>
        <span className="w-16" aria-hidden />
      </header>

      <form
        className="mt-4 flex flex-1 flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <Field label="習慣名">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500"
          />
        </Field>

        {isQuit ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
            やらない習慣は毎日「守った」「破った」を記録します。
            <p className="mt-1 text-xs text-stone-500">記録タイプは作成後変更できません</p>
          </div>
        ) : (
          <HabitGoalFields value={goal} onChange={setGoal} mode="edit" />
        )}

        <Field label="カテゴリー">
          <CategoryChips value={category} onChange={setCategory} />
        </Field>

        <Field label="育成パートナー">
          <PartnerPicker category={category} value={partnerId} onChange={setPartnerId} />
          <p className="mt-1.5 text-xs text-stone-500">パートナーを変えてもレベル・XPは習慣の記録から計算されるため引き継がれます</p>
        </Field>

        <p className="text-[11px] leading-relaxed text-stone-400">
          変更は現在の設定として保存されます。過去の記録（チェック・時間・回数）はそのまま残ります。
        </p>

        <DeleteHabitButton habit={habit} />

        {/* 画面下部に固定の保存ボタン */}
        <div className="sticky bottom-0 -mx-4 mt-auto border-t border-stone-200 bg-[var(--background)]/95 px-4 pt-3 pb-[calc(0.75rem+var(--safe-bottom))] backdrop-blur">
          <button
            type="submit"
            disabled={!canSave}
            className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white active:bg-emerald-700 disabled:bg-stone-300"
          >
            変更を保存
          </button>
        </div>
      </form>
    </main>
  );
}
