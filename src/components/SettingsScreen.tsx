"use client";

import { useRef, useState, type ReactNode } from "react";
import { GRADE_XP, XP } from "@/lib/habit-logic";
import { fromStored, emptyData, serialize } from "@/lib/repository/local-storage";
import { buildSampleData } from "@/lib/sample";
import { replaceAllData, useAppState, useToday } from "@/lib/store";

export function SettingsScreen() {
  const { ready, data } = useAppState();
  const today = useToday();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const exportJson = () => {
    const blob = new Blob([serialize(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habit-garden-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const imported = fromStored(JSON.parse(await file.text()));
      replaceAllData(imported);
      setMessage(`${imported.habits.length}件の習慣を読み込みました`);
    } catch {
      setMessage("ファイルを読み込めませんでした");
    }
  };

  return (
    <main className="px-4 pt-5">
      <h1 className="text-xl font-bold text-emerald-900">設定</h1>

      <Section title="データ">
        <Row label="エクスポート（JSON）" onClick={exportJson} disabled={!ready} />
        <Row label="インポート" onClick={() => fileRef.current?.click()} disabled={!ready} />
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = "";
          }}
        />
        <Row
          label="サンプルデータを読み込む"
          onClick={() => {
            replaceAllData(buildSampleData(today));
            setMessage("サンプルデータを読み込みました");
          }}
          disabled={!ready || !today}
        />
        {!confirmReset ? (
          <Row label="すべてのデータを削除" danger onClick={() => setConfirmReset(true)} disabled={!ready} />
        ) : (
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <span className="text-sm text-red-700">本当に削除しますか？</span>
            <span className="flex gap-2">
              <button onClick={() => setConfirmReset(false)} className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm">
                やめる
              </button>
              <button
                onClick={() => {
                  replaceAllData(emptyData());
                  setConfirmReset(false);
                  setMessage("すべてのデータを削除しました");
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-bold text-white"
              >
                削除
              </button>
            </span>
          </div>
        )}
      </Section>
      {message && <p className="mt-2 text-center text-xs text-emerald-700">{message}</p>}
      <p className="mt-2 px-1 text-[11px] text-stone-400">データはこの端末のブラウザ（localStorage）に保存されています。</p>

      <Section title="XPのルール">
        <ul className="space-y-1 px-4 py-3 text-sm text-stone-600">
          <li>チェック達成 +{XP.check}XP</li>
          <li>やらない習慣を守る +{XP.quitKept}XP</li>
          <li>週・月の回数目標達成 +{XP.periodGoal}XP</li>
          <li>
            時間型の週間評価{" "}
            {Object.entries(GRADE_XP)
              .map(([g, xp]) => `${g}+${xp}`)
              .join(" ")}
          </li>
          <li className="text-xs text-stone-400">失敗してもXPは減りません</li>
        </ul>
      </Section>

      <p className="mt-6 text-center text-[11px] text-stone-400">Habit Garden v0.1</p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 px-1 text-sm font-bold text-stone-600">{title}</h2>
      <div className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">{children}</div>
    </section>
  );
}

function Row({ label, onClick, danger, disabled }: { label: string; onClick: () => void; danger?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm active:bg-stone-50 disabled:opacity-40 ${danger ? "text-red-600" : "text-stone-700"}`}
    >
      {label}
      <span className="text-stone-300">›</span>
    </button>
  );
}
