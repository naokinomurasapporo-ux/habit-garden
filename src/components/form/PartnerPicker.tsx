"use client";

import { useState } from "react";
import { PARTNERS, partnersForCategory, recommendedPartners } from "@/lib/partners";
import type { HabitCategory } from "@/lib/types";
import { Partner } from "../partner/Partner";

type Tab = "recommended" | "plant" | "animal";

const TABS: { id: Tab; label: string }[] = [
  { id: "recommended", label: "おすすめ" },
  { id: "plant", label: "植物" },
  { id: "animal", label: "動物" },
];

/** 育てるパートナーの選択。「おすすめ」はカテゴリーに合うものを先頭に並べる。作成・編集で共通 */
export function PartnerPicker({
  category,
  value,
  onChange,
}: {
  category: HabitCategory;
  value: string;
  onChange: (partnerId: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("recommended");
  const recIds = new Set(recommendedPartners(category).map((p) => p.id));
  const list =
    tab === "recommended"
      ? partnersForCategory(category)
      : PARTNERS.filter((p) => p.selectable && p.type === tab);

  return (
    <div>
      <div className="grid grid-cols-3 rounded-xl bg-stone-200/70 p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg py-1.5 text-sm font-bold ${tab === t.id ? "bg-white text-emerald-800 shadow-sm" : "text-stone-500"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {list.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              aria-pressed={active}
              className={`relative flex flex-col items-center rounded-2xl border-2 bg-white px-1 pt-2 pb-2.5 ${active ? "border-emerald-500" : "border-transparent"}`}
            >
              {recIds.has(p.id) && tab !== "animal" && tab !== "plant" && (
                <span className="absolute top-1 left-1 rounded-full bg-amber-100 px-1.5 text-[9px] font-bold text-amber-700">おすすめ</span>
              )}
              <Partner partnerId={p.id} level={30} size={64} />
              <span className="mt-0.5 text-sm font-bold text-stone-700">{p.name}</span>
              <span className="mt-0.5 text-[10px] leading-tight text-stone-500">{p.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
