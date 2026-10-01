"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getPreviousPath, markReplaceNavigation, pageLabel, previousPathOf, useNavStack } from "@/lib/nav-history";

interface Props {
  /** アプリ内の履歴が無いとき（リロード直後・直接アクセス）の戻り先 */
  fallback: string;
  /** fallback の画面名（省略時は pathname から推定） */
  fallbackLabel?: string;
  /** 戻り先がホーム以外のとき、ホームへの小さなボタンも出す */
  showHome?: boolean;
  /** 文言を固定する（例：キャンセル）。指定時は ‹ を付けない */
  label?: string;
}

/**
 * 画面左上の「‹ 戻る」。アプリ内で1つ前の画面があれば履歴を戻り（ブラウザの戻ると同じ動き）、
 * 無ければ親画面へ移動する。文言は戻り先の画面名にする。
 */
export function BackButton({ fallback, fallbackLabel, showHome = false, label: fixedLabel }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const stack = useNavStack();
  const prev = previousPathOf(stack, pathname);
  const label = fixedLabel ?? (prev ? pageLabel(prev) : (fallbackLabel ?? pageLabel(fallback.split("?")[0])));
  const goesHome = prev ? prev === "/" : fallback.split("?")[0] === "/";

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => (getPreviousPath(pathname) ? router.back() : router.push(fallback))}
        className="-ml-1 flex h-10 items-center rounded-full pr-3 pl-1 text-sm text-stone-500 active:bg-stone-100"
      >
        {!fixedLabel && <span aria-hidden className="mr-1 text-lg leading-none">‹</span>}
        {label}
      </button>
      {showHome && !goesHome && (
        <Link
          href="/"
          aria-label="ホームへ"
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-400 active:bg-stone-100"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
        </Link>
      )}
    </div>
  );
}

/** 保存・作成・削除の後の移動：1つ前の画面が target ならそこへ戻り（履歴を増やさない）、違えば置き換える */
export function useReturnTo() {
  const router = useRouter();
  const pathname = usePathname();
  return (target: string) => {
    if (getPreviousPath(pathname) === target.split("?")[0]) router.back();
    else {
      markReplaceNavigation();
      router.replace(target);
    }
  };
}
