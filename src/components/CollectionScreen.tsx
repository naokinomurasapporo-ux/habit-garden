"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { summarize } from "@/lib/habit-logic";
import { MAX_LEVEL } from "@/lib/level";
import { PARTNERS, getPartner, stageName, type PartnerDef } from "@/lib/partners";
import { useAppState, useToday } from "@/lib/store";
import type { PartnerType } from "@/lib/types";
import { Loading } from "./Loading";
import { Partner } from "./partner/Partner";

export function CollectionScreen() {
  const { ready, data } = useAppState();
  const today = useToday();
  const [dexType, setDexType] = useState<PartnerType>("plant");

  const summaries = useMemo(
    () =>
      today
        ? data.habits.map((h) => summarize(h, data.logs[h.id], today)).sort((a, b) => b.totalXp - a.totalXp)
        : [],
    [data, today],
  );

  if (!ready || !today) return <Loading />;

  const totalXp = summaries.reduce((s, x) => s + x.totalXp, 0);
  // 新しい育成完了から順に
  const completions = [...data.completions].sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));

  return (
    <main className="px-4 pt-5">
      <h1 className="text-xl font-bold text-emerald-900">コレクション</h1>
      <p className="mt-1 text-xs text-stone-500">
        育成中 {summaries.length}・育成完了 {completions.length}・庭の合計 {totalXp} XP
      </p>

      <section className="mt-4">
        <h2 className="mb-2 text-sm font-bold text-stone-600">育成中のパートナー</h2>
        {summaries.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-stone-500">まだパートナーがいません</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {summaries.map((s) => {
              const def = getPartner(s.habit.partnerId);
              const legend = s.level.level >= MAX_LEVEL;
              return (
                <li key={s.habit.id}>
                  <Link
                    href={`/habits/${s.habit.id}`}
                    className={`flex flex-col items-center rounded-2xl border bg-white px-1 pt-2 pb-2.5 ${legend ? "border-amber-300" : "border-stone-200"}`}
                  >
                    <Partner partnerId={s.habit.partnerId} level={s.level.level} size={72} />
                    <span className="mt-1 w-full truncate text-center text-xs font-bold text-stone-700">{s.habit.name}</span>
                    <span className={`text-[10px] ${legend ? "font-bold text-amber-600" : "text-emerald-700"}`}>
                      {legend ? def.legendName : `Lv.${s.level.level}・${stageName(def.type, s.level.level)}`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-bold text-stone-600">育成完了（Lv.100）</h2>
        {completions.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-center text-xs leading-relaxed text-stone-500">
            Lv.100 まで育てたパートナーは伝説形態になり、ここに記録されます。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {completions.map((c) => {
              const def = getPartner(c.partnerId);
              return (
                <li key={c.id} className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-3">
                  <Partner partnerId={c.partnerId} level={1} stage={3} size={44} />
                  <span className="text-stone-300" aria-hidden>→</span>
                  <Partner partnerId={c.partnerId} level={MAX_LEVEL} size={60} />
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-amber-700">{def.legendName}</p>
                    <p className="text-[11px] text-stone-500">元：{def.name}</p>
                    <p className="truncate text-xs text-stone-700">「{c.habitName}」</p>
                  </div>
                  <div className="shrink-0 text-right text-[10px] leading-relaxed text-stone-500">
                    <p>{c.completedAt.replace(/-/g, "/")}</p>
                    <p className="font-bold text-stone-700">{c.totalXp} XP</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-600">パートナー図鑑</h2>
          <div className="flex rounded-lg bg-stone-200/70 p-0.5 text-xs">
            {(["plant", "animal"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setDexType(t)}
                className={`rounded-md px-3 py-1 font-bold ${dexType === t ? "bg-white text-emerald-800 shadow-sm" : "text-stone-500"}`}
              >
                {t === "plant" ? "植物" : "動物"}
              </button>
            ))}
          </div>
        </div>
        <ul className="flex flex-col gap-2">
          {PARTNERS.filter((p) => p.type === dexType).map((p) => (
            <DexRow
              key={p.id}
              def={p}
              best={summaries.filter((s) => s.habit.partnerId === p.id).reduce((m, s) => Math.max(m, s.level.level), 0)}
              raising={summaries.filter((s) => s.habit.partnerId === p.id).length}
              completed={data.completions.filter((c) => c.partnerId === p.id).length}
            />
          ))}
        </ul>
        <p className="mt-3 text-center text-[11px] text-stone-400">
          成長段階：Lv.1 → Lv.10 → Lv.25 → Lv.50 → Lv.75 → Lv.100 伝説形態
        </p>
      </section>
    </main>
  );
}

function DexRow({ def, best, raising, completed }: { def: PartnerDef; best: number; raising: number; completed: number }) {
  const met = best > 0 || completed > 0;
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
      <Partner partnerId={def.id} level={best || 1} size={52} silhouette={!met} />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-stone-700">{def.name}</p>
        <p className="text-xs text-stone-500">{def.description}</p>
        <p className="mt-0.5 text-[11px] text-amber-600">伝説形態：{completed > 0 ? def.legendName : "？？？"}</p>
      </div>
      <div className="shrink-0 text-right text-xs text-stone-500">
        {met ? (
          <>
            {raising > 0 && <p>育成中 {raising}</p>}
            {best > 0 && <p className="font-bold text-emerald-700">最高 Lv.{best}</p>}
            {completed > 0 && <p className="font-bold text-amber-600">完了 {completed}回</p>}
          </>
        ) : (
          <p>未育成</p>
        )}
      </div>
    </li>
  );
}
