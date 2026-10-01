"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { diffDays, formatMonthDay } from "@/lib/date";
import {
  PERIOD_WORD,
  TRACK_LABEL,
  UNIT_LABEL,
  achievementRate30,
  formatMinutes,
  frequencyLabel,
  habitStartDate,
  summarize,
  totalAmount,
  type HabitSummary,
  type PeriodResult,
} from "@/lib/habit-logic";
import { getCategory } from "@/lib/categories";
import { MAX_LEVEL } from "@/lib/level";
import { STAGE_LEVELS, habitPartner, stageName } from "@/lib/partners";
import { useAppState, useToday } from "@/lib/store";
import type { DateKey, Habit, PartnerCompletion } from "@/lib/types";
import { BackButton } from "./BackButton";
import { DeleteHabitButton } from "./DeleteHabitButton";
import { Heatmap } from "./Heatmap";
import { Loading } from "./Loading";
import { LogEditorSheet } from "./LogEditorSheet";
import { MonthCalendar } from "./MonthCalendar";
import { Partner } from "./partner/Partner";

type Tab = "streak" | "stack";

export function HabitDetail({ id }: { id: string }) {
  const { ready, data } = useAppState();
  const today = useToday();
  const [tab, setTab] = useState<Tab>("streak");
  const [editDate, setEditDate] = useState<DateKey | null>(null);

  const habit = data.habits.find((h) => h.id === id);
  const logs = useMemo(() => data.logs[id] ?? {}, [data.logs, id]);
  const summary = useMemo(
    () => (habit && today ? summarize(habit, logs, today) : null),
    [habit, logs, today],
  );

  if (!ready || !today) return <Loading />;
  if (!habit || !summary) {
    return (
      <main className="px-4 pt-16 text-center">
        <p className="text-stone-600">習慣が見つかりませんでした</p>
        <Link href="/" className="mt-4 inline-block text-emerald-700 underline">ホームへ戻る</Link>
      </main>
    );
  }

  return (
    <main className="px-4 pt-3 pb-8">
      <header className="flex items-center justify-between">
        <BackButton fallback="/" />
        <div className="flex min-w-0 items-center gap-2">
          <p className="min-w-0 text-right text-xs text-stone-400">
            {habit.kind === "quit" ? "やらない" : "続ける"}・{habit.kind === "quit" ? "守った/破った" : TRACK_LABEL[habit.trackType]}・{frequencyLabel(habit)}
          </p>
          <Link
            href={`/habits/${habit.id}/edit`}
            className="shrink-0 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-bold text-emerald-700 active:bg-stone-50"
          >
            編集
          </Link>
        </div>
      </header>

      <PartnerHero
        summary={summary}
        completion={data.completions.find((c) => c.habitId === habit.id && c.partnerId === habit.partnerId)}
      />

      <div className="mt-4 grid grid-cols-2 rounded-xl bg-stone-200/70 p-1" role="tablist">
        {(
          [
            ["streak", "継続"],
            ["stack", "積み上げ"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-lg py-2 text-sm font-bold ${tab === key ? "bg-white text-emerald-800 shadow-sm" : "text-stone-500"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "streak" ? (
        <StreakTab summary={summary} logs={logs} today={today} onSelect={setEditDate} />
      ) : (
        <StackTab summary={summary} logs={logs} today={today} onSelect={setEditDate} />
      )}

      <DeleteHabitButton habit={habit} />

      <LogEditorSheet habit={habit} date={editDate} value={editDate ? logs[editDate] : undefined} onClose={() => setEditDate(null)} />
    </main>
  );
}

function PartnerHero({ summary, completion }: { summary: HabitSummary; completion?: PartnerCompletion }) {
  const { habit, level, totalXp } = summary;
  const def = habitPartner(habit);
  const category = getCategory(habit.category);
  const legend = level.level >= MAX_LEVEL;
  const nextStage = STAGE_LEVELS.find((l) => l > level.level);

  if (legend) {
    return (
      <section className="mt-1 rounded-3xl bg-gradient-to-b from-amber-50 via-yellow-50 to-lime-50 px-4 pt-4 pb-5 text-center ring-1 ring-amber-200">
        <p className="text-[11px] text-stone-500">
          {category.emoji} {category.name}
        </p>
        <h1 className="text-lg font-bold text-stone-800">{habit.name}</h1>
        <div className="mt-1 flex justify-center">
          <Partner partnerId={habit.partnerId} level={level.level} size={180} />
        </div>
        <p className="mt-1 inline-block rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-0.5 text-xs font-bold text-white">
          伝説形態
        </p>
        <p className="mt-1 text-2xl font-black text-amber-700">{def.legendName}</p>
        <p className="text-[11px] text-stone-500">{def.name}が育ちきった姿</p>
        <dl className="mx-auto mt-3 grid max-w-72 grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/80 py-2">
            <dt className="text-[10px] text-stone-500">レベル</dt>
            <dd className="font-black text-amber-700">Lv.100</dd>
          </div>
          <div className="rounded-xl bg-white/80 py-2">
            <dt className="text-[10px] text-stone-500">累計XP</dt>
            <dd className="font-black text-stone-700">{totalXp}</dd>
          </div>
          <div className="rounded-xl bg-white/80 py-2">
            <dt className="text-[10px] text-stone-500">育成完了日</dt>
            <dd className="text-sm font-bold text-stone-700">{completion ? formatFullDate(completion.completedAt) : "—"}</dd>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <section className="mt-1 rounded-3xl bg-gradient-to-b from-emerald-50 to-lime-50 px-4 pt-4 pb-5 text-center">
      <p className="text-[11px] text-stone-500">
        {category.emoji} {category.name}
      </p>
      <h1 className="text-lg font-bold text-stone-800">{habit.name}</h1>
      <div className="mt-1 flex justify-center">
        <Partner partnerId={habit.partnerId} level={level.level} size={140} />
      </div>
      <p className="mt-1 text-xs text-emerald-800">
        {def.name}・{stageName(def.type, level.level)}
      </p>
      <div className="mx-auto mt-2 max-w-64">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-black text-emerald-800">Lv.{level.level}</span>
          <span className="text-xs text-stone-500">{`${level.current} / ${level.needed} XP`}</span>
        </div>
        <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500"
            style={{ width: `${Math.round(level.progress * 100)}%` }}
          />
        </div>
        <p className="mt-1 flex justify-between text-[10px] text-stone-400">
          <span>{nextStage === MAX_LEVEL ? "Lv.100で伝説形態" : nextStage ? `次の成長 Lv.${nextStage}` : ""}</span>
          <span>累計 {totalXp} XP</span>
        </p>
      </div>
    </section>
  );
}

function formatFullDate(key: DateKey): string {
  const [y, m, d] = key.split("-").map(Number);
  return `${y}/${m}/${d}`;
}

function Card({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white p-4 ${className}`}>
      {title && <h2 className="mb-3 text-sm font-bold text-stone-600">{title}</h2>}
      {children}
    </section>
  );
}

function amountText(habit: Habit, n: number): string {
  if (habit.trackType === "time" && habit.kind === "build") return `${n}分`;
  return `${n}回`;
}

function currentStatus(summary: HabitSummary): { label: string; tone: string } {
  const { habit, current } = summary;
  if (habit.kind === "quit") {
    if (current.state === "success") return { label: "今日は守れています", tone: "text-emerald-700" };
    if (current.state === "fail") return { label: "明日からまた積み上げよう", tone: "text-amber-600" };
    return { label: "今日はまだ未入力", tone: "text-stone-500" };
  }
  // 現在の期間は終了していないので、時間型も最終評価（★◎○△×）は出さない
  if (habit.trackType === "time") {
    return { label: `${Math.round(current.ratio * 100)}%・進行中`, tone: "text-stone-500" };
  }
  if (current.state === "success") return { label: "達成！", tone: "text-emerald-700" };
  const rest = Math.max(0, current.target - current.progress);
  return { label: `あと${amountText(habit, rest)}`, tone: "text-stone-500" };
}

function StreakTab({
  summary,
  logs,
  today,
  onSelect,
}: {
  summary: HabitSummary;
  logs: Record<DateKey, number>;
  today: DateKey;
  onSelect: (d: DateKey) => void;
}) {
  const { habit, streak, current } = summary;
  const unit = UNIT_LABEL[habit.period];
  const status = currentStatus(summary);
  const pct = Math.min(100, Math.round(current.ratio * 100));

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-stone-500">現在の連続</p>
          <p className="mt-1 text-3xl font-black text-orange-600">
            {streak.current}
            <span className="ml-0.5 text-sm font-bold">{unit}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-stone-500">最長記録</p>
          <p className="mt-1 text-3xl font-black text-stone-700">
            {streak.longest}
            <span className="ml-0.5 text-sm font-bold">{unit}</span>
          </p>
        </Card>
      </div>

      {habit.kind === "build" && (
        <Card>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-bold text-stone-700">
              {PERIOD_WORD[habit.period]} {current.progress}/{amountText(habit, current.target)}
            </p>
            <p className={`text-sm font-bold ${status.tone}`}>{status.label}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
          </div>
          {habit.period !== "day" && current.state === "pending" && (
            <p className="mt-2 text-[11px] text-stone-400">期間が終わるまでは失敗扱いになりません</p>
          )}
        </Card>
      )}
      {habit.kind === "quit" && (
        <Card>
          <p className={`text-sm font-bold ${status.tone}`}>{status.label}</p>
        </Card>
      )}

      <Card title={habit.period === "day" ? "直近14日" : habit.period === "week" ? "直近の週" : "直近の月"}>
        <RecentPeriods habit={habit} periods={summary.periods} />
      </Card>

      <Card title="記録の修正">
        <MonthCalendar habit={habit} logs={logs} today={today} onSelect={onSelect} />
        <p className="mt-2 text-[11px] text-stone-400">日付をタップして記録を修正できます（未来日は入力できません）</p>
      </Card>
    </div>
  );
}

const STATE_DOT: Record<PeriodResult["state"], string> = {
  success: "bg-emerald-500",
  fail: "bg-amber-300",
  missing: "bg-stone-200",
  pending: "border-2 border-dashed border-stone-300",
};

function RecentPeriods({ habit, periods }: { habit: Habit; periods: PeriodResult[] }) {
  if (habit.period === "day") {
    const recent = periods.slice(-14);
    return (
      <div className="flex flex-wrap gap-1.5">
        {recent.map((p) => (
          <div key={p.start} className="flex flex-col items-center gap-1">
            <span className={`h-5 w-5 rounded-full ${STATE_DOT[p.state]}`} title={formatMonthDay(p.start)} />
            <span className="text-[9px] text-stone-400">{Number(p.start.slice(8))}</span>
          </div>
        ))}
      </div>
    );
  }
  const recent = periods.slice(-6).reverse();
  return (
    <ul className="divide-y divide-stone-100">
      {recent.map((p) => (
        <li key={p.start} className="flex items-center justify-between py-2 text-sm">
          <span className="text-stone-500">
            {habit.period === "week" ? `${formatMonthDay(p.start)}〜` : `${Number(p.start.slice(5, 7))}月`}
            {p.isCurrent && <span className="ml-1 text-[10px] text-emerald-600">進行中</span>}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-stone-700">
              {p.progress}/{amountText(habit, p.target)}
            </span>
            <span
              className={`w-6 text-center font-bold ${p.isCurrent ? "text-stone-400" : p.state === "success" ? "text-emerald-600" : "text-amber-500"}`}
            >
              {/* 進行中の期間は評価を確定させない */}
              {p.isCurrent ? "…" : (p.grade ?? (p.state === "success" ? "○" : "−"))}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function StackTab({
  summary,
  logs,
  today,
  onSelect,
}: {
  summary: HabitSummary;
  logs: Record<DateKey, number>;
  today: DateKey;
  onSelect: (d: DateKey) => void;
}) {
  const { habit } = summary;
  const total = totalAmount(habit, logs);
  const rate = achievementRate30(habit, logs, today);
  const sinceDays = diffDays(habitStartDate(habit, logs), today) + 1;
  const totalLabel =
    habit.kind === "quit"
      ? { value: `${total}`, unit: "日", caption: "守った日数" }
      : habit.trackType === "time"
        ? { value: formatMinutes(total), unit: "", caption: "累計時間" }
        : habit.trackType === "count"
          ? { value: `${total}`, unit: "回", caption: "累計回数" }
          : { value: `${total}`, unit: "日", caption: "達成日数" };

  return (
    <div className="mt-3 flex flex-col gap-3">
      <Card className="text-center">
        <p className="text-xs text-stone-500">{totalLabel.caption}</p>
        <p className="mt-1 text-4xl font-black text-emerald-800">
          {totalLabel.value}
          <span className="ml-1 text-base font-bold">{totalLabel.unit}</span>
        </p>
        <p className="mt-1 text-xs text-stone-500">
          {sinceDays}日間でこれだけ積み上げました
        </p>
      </Card>

      <Card title="直近30日の達成率">
        {rate === null ? (
          <p className="text-sm text-stone-400">まだ記録がありません</p>
        ) : (
          <div className="flex items-center gap-3">
            <p className="w-16 text-2xl font-black text-stone-700">{Math.round(rate * 100)}%</p>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(rate * 100)}%` }} />
            </div>
          </div>
        )}
      </Card>

      <Card title="ヒートマップ">
        <Heatmap habit={habit} logs={logs} today={today} onSelect={onSelect} />
      </Card>
    </div>
  );
}
