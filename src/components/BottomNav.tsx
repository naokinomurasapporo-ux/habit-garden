"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "ホーム", icon: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/collection", label: "コレクション", icon: "M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10zM12 7v8M9 11l3 3 3-3" },
  { href: "/settings", label: "設定", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 1.2 14H1a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 7a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 1.2V1a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 22.8 10H23a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" },
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/habits/")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 pb-(--safe-bottom) backdrop-blur">
      <ul className="mx-auto flex h-(--nav-h) max-w-md items-stretch">
        {ITEMS.map((item) => {
          // カレンダーはホームから開く画面なので「ホーム」を選択状態にする
          const active =
            item.href === "/" ? pathname === "/" || pathname.startsWith("/calendar") : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[11px] ${active ? "text-emerald-700" : "text-stone-400"}`}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
