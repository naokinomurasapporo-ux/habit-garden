"use client";

import { getPartner } from "@/lib/partners";
import { dismissCelebration, useAppState } from "@/lib/store";
import { Partner } from "./partner/Partner";

/** Lv.100 到達時の「伝説形態 解放！」。フルスクリーンにせず、数秒で自然に消える */
export function LegendUnlockToast() {
  const { celebration } = useAppState();
  if (!celebration) return null;
  const def = getPartner(celebration.partnerId);
  return (
    <div
      key={celebration.id}
      role="status"
      onAnimationEnd={dismissCelebration}
      className="hg-legend-pop fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 flex justify-center px-4"
    >
      <button
        type="button"
        onClick={dismissCelebration}
        className="flex w-full max-w-sm items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2 text-left shadow-lg"
      >
        <Partner partnerId={celebration.partnerId} level={100} size={56} />
        <span className="min-w-0">
          <span className="block text-xs font-bold text-amber-600">✨ 伝説形態 解放！</span>
          <span className="block text-base font-black text-stone-800">{def.legendName}</span>
          <span className="block truncate text-[11px] text-stone-500">
            「{celebration.habitName}」の{def.name}が Lv.100 に到達しました
          </span>
        </span>
      </button>
    </div>
  );
}
