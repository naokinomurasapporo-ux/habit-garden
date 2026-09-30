"use client";

import { useEffect, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** 画面下からのボトムシート */
export function Sheet({ open, onClose, title, subtitle, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button aria-label="閉じる" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-2xl bg-white px-5 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-200" />
        <h2 className="text-base font-bold text-stone-800">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
