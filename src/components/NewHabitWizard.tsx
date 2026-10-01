"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getCategory } from "@/lib/categories";
import { goalFormFromTemplate, goalFormToHabitFields, initialGoalForm, isGoalFormValid, type GoalFormState } from "@/lib/habit-form";
import { getPartner, recommendedPartners } from "@/lib/partners";
import { addHabit } from "@/lib/store";
import { templatesFor, type HabitTemplate } from "@/lib/templates";
import type { HabitCategory, HabitKind } from "@/lib/types";
import { BackButton, useReturnTo } from "./BackButton";
import { CategoryChips } from "./form/CategoryPicker";
import { Choice, Field } from "./form/FormParts";
import { HabitGoalFields } from "./form/HabitGoalFields";
import { PartnerPicker } from "./form/PartnerPicker";

const STEP_TITLES = ["どんな習慣？", "記録のしかた", "育てるパートナーを選ぶ"];

type Mode = "entry" | "templates" | "form";

export function NewHabitWizard() {
  const returnTo = useReturnTo();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("entry");
  const [browseCategory, setBrowseCategory] = useState<HabitCategory>("health");
  const [fromTemplate, setFromTemplate] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<HabitKind>(params.get("kind") === "quit" ? "quit" : "build");
  const [category, setCategory] = useState<HabitCategory>("other");
  const [goal, setGoal] = useState<GoalFormState>(initialGoalForm);
  const [partnerId, setPartnerId] = useState("monstera");
  const [partnerTouched, setPartnerTouched] = useState(false);

  const isQuit = kind === "quit";
  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? isQuit || isGoalFormValid(goal) : true;

  /** テンプレートは即登録せず、フォームに初期値として入れる */
  const applyTemplate = (t: HabitTemplate) => {
    setName(t.name);
    setKind(t.kind);
    setCategory(t.category);
    setGoal(goalFormFromTemplate(t.goal));
    setPartnerTouched(false);
    setFromTemplate(t.name);
    setStep(0);
    setMode("form");
  };

  const startBlank = () => {
    setFromTemplate(null);
    setStep(0);
    setMode("form");
  };

  const goNext = () => {
    if (!canNext) return;
    if (step === 1 && !partnerTouched) {
      // カテゴリーに合うパートナーを初期選択（ユーザーが選んだ後は上書きしない）
      setPartnerId(recommendedPartners(category)[0]?.id ?? "monstera");
    }
    if (step < 2) setStep(step + 1);
    else create();
  };

  const create = () => {
    const partner = getPartner(partnerId);
    const base = { name: name.trim(), kind, category, partnerType: partner.type, partnerId: partner.id };
    if (isQuit) addHabit({ ...base, trackType: "check", period: "day", target: 1 });
    else addHabit({ ...base, ...goalFormToHabitFields(goal) });
    // ホームから来ていれば戻る（作成画面を履歴に残さない）
    returnTo(isQuit ? "/?tab=quit" : "/");
  };

  if (mode === "entry") {
    return (
      <main className="flex min-h-dvh flex-col px-4 pt-4">
        <header className="flex items-center justify-between">
          <BackButton fallback="/" label="キャンセル" />
        </header>
        <h1 className="mt-4 text-xl font-bold text-stone-800">新しい習慣を植える</h1>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <EntryCard emoji="🌟" title="おすすめから選ぶ" desc="人気の習慣をもとに作る" onClick={() => setMode("templates")} />
          <EntryCard emoji="✏️" title="自分で作る" desc="名前から自由に作る" onClick={startBlank} />
        </div>
      </main>
    );
  }

  if (mode === "templates") {
    const list = templatesFor(browseCategory);
    return (
      <main className="flex min-h-dvh flex-col px-4 pt-4">
        <header className="flex items-center justify-between">
          <button onClick={() => setMode("entry")} className="py-2 pr-3 text-sm text-stone-500">‹ 戻る</button>
          <button onClick={startBlank} className="py-2 pl-3 text-sm text-emerald-700">自分で作る</button>
        </header>
        <h1 className="mt-3 text-xl font-bold text-stone-800">おすすめから選ぶ</h1>
        <p className="mt-1 text-xs text-stone-500">タップすると初期値が入ります。登録前に自由に変更できます。</p>
        <div className="mt-4">
          <CategoryChips value={browseCategory} onChange={setBrowseCategory} scroll />
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2">
          {list.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => applyTemplate(t)}
                className="flex w-full items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-left active:bg-emerald-50"
              >
                <span className="text-2xl" aria-hidden>{t.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-sm leading-snug font-bold text-stone-800">{t.name}</span>
                  <span className="block text-[11px] text-stone-500">{templateSummary(t)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh flex-col px-4 pt-4">
      <header className="flex items-center justify-between">
        <button onClick={() => (step === 0 ? setMode(fromTemplate ? "templates" : "entry") : setStep(step - 1))} className="py-2 pr-3 text-sm text-stone-500">
          ‹ 戻る
        </button>
        <p className="text-xs text-stone-400">{step + 1} / 3</p>
      </header>
      <div className="mt-2 flex gap-1.5">
        {STEP_TITLES.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-emerald-500" : "bg-stone-200"}`} />
        ))}
      </div>
      <h1 className="mt-5 text-xl font-bold text-stone-800">{STEP_TITLES[step]}</h1>
      {fromTemplate && step === 0 && (
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          「{fromTemplate}」の初期値を入力しました。自由に変更できます。
        </p>
      )}

      <form
        className="mt-5 flex flex-1 flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          goNext();
        }}
      >
        {step === 0 && (
          <>
            <Field label="習慣名">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isQuit ? "例：夜のお菓子" : "例：読書、朝活、ジム"}
                maxLength={30}
                autoFocus={!fromTemplate}
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500"
              />
            </Field>
            <Field label="種類">
              <div className="grid grid-cols-2 gap-2">
                <Choice active={!isQuit} onClick={() => setKind("build")} title="続ける" desc="良い習慣を積み上げる" />
                <Choice active={isQuit} onClick={() => setKind("quit")} title="やらない" desc="悪い習慣を断つ" />
              </div>
            </Field>
            <Field label="カテゴリー">
              <CategoryChips value={category} onChange={setCategory} />
            </Field>
          </>
        )}

        {step === 1 && isQuit && (
          <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
            毎日「<span className="font-bold text-emerald-700">守った</span>」「
            <span className="font-bold text-amber-600">破った</span>」を記録します。
            <br />
            守った日は +10XP。破ってもパートナーは弱りません。
          </div>
        )}

        {step === 1 && !isQuit && <HabitGoalFields value={goal} onChange={setGoal} mode="create" />}

        {step === 2 && (
          <>
            <p className="-mt-3 text-xs text-stone-500">
              {getCategory(category).emoji} {getCategory(category).name} におすすめのパートナーを先頭に表示しています
            </p>
            <PartnerPicker
              category={category}
              value={partnerId}
              onChange={(id) => {
                setPartnerId(id);
                setPartnerTouched(true);
              }}
            />
          </>
        )}

        <div className="mt-auto pb-6">
          <button
            type="submit"
            disabled={!canNext}
            className="w-full rounded-xl bg-emerald-600 py-3.5 font-bold text-white disabled:bg-stone-300"
          >
            {step < 2 ? "次へ" : `${getPartner(partnerId).name}と始める`}
          </button>
        </div>
      </form>
    </main>
  );
}

function EntryCard({ emoji, title, desc, onClick }: { emoji: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center rounded-2xl border-2 border-stone-200 bg-white px-3 py-5 text-center active:border-emerald-500 active:bg-emerald-50"
    >
      <span className="text-3xl" aria-hidden>{emoji}</span>
      <span className="mt-2 font-bold text-stone-800">{title}</span>
      <span className="mt-0.5 text-[11px] text-stone-500">{desc}</span>
    </button>
  );
}

function templateSummary(t: HabitTemplate): string {
  if (t.kind === "quit" || !t.goal) return "やらない・毎日";
  const g = t.goal;
  if (g.trackType === "time") return `1日${g.dailyMinutes}分×週${g.days}日`;
  if (g.period === "day") return g.trackType === "count" ? `毎日${g.target}回` : "毎日チェック";
  return `${g.period === "week" ? "週" : "月"}${g.target}回`;
}
