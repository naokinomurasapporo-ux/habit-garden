import type { ReactNode } from "react";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-stone-600">{label}</p>
      {children}
    </div>
  );
}

export function Choice({
  active,
  onClick,
  title,
  desc,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-xl border-2 px-2 py-3 text-center disabled:opacity-40 ${active ? "border-emerald-500 bg-emerald-50" : "border-stone-200 bg-white"}`}
    >
      <span className={`block font-bold ${active ? "text-emerald-800" : "text-stone-700"}`}>{title}</span>
      {desc && <span className="mt-0.5 block text-[11px] text-stone-500">{desc}</span>}
    </button>
  );
}
