"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { markPopNavigation, recordPath } from "@/lib/nav-history";

/** アプリ内の遷移履歴を記録する（表示なし）。layout に1つだけ置く */
export function NavTracker() {
  const pathname = usePathname();

  useEffect(() => {
    window.addEventListener("popstate", markPopNavigation);
    return () => window.removeEventListener("popstate", markPopNavigation);
  }, []);

  useEffect(() => {
    recordPath(pathname);
  }, [pathname]);

  return null;
}
