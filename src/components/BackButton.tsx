"use client";

import { usePathname, useRouter } from "next/navigation";
import { getPreviousPath, markReplaceNavigation, pageLabel, previousPathOf, stepsBackTo, useNavStack } from "@/lib/nav-history";

const pathOf = (href: string) => href.split("?")[0];

interface Props {
  /**
   * 戻り先を固定する（作成 → ホーム、編集 → 習慣詳細）。
   * 1つ前の画面が to なら履歴を戻り、違えば to に置き換える（同じ画面を履歴に二重に積まない）
   */
  to?: string;
  /** to が無いとき：アプリ内の履歴が無い場合（リロード直後・URL を直接開いた場合）の親画面 */
  fallback?: string;
}

/**
 * 階層画面の左上の「‹ 戻り先」。文言は実際に戻る画面の名前にする。
 * トップレベル画面（ホーム / カレンダー / コレクション / 設定）には置かず、下部ナビで移動する。
 */
export function BackButton({ to, fallback = "/" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const stack = useNavStack();
  const returnTo = useReturnTo();
  const prev = previousPathOf(stack, pathname);
  const target = to ? pathOf(to) : (prev ?? pathOf(fallback));

  const onClick = () => {
    if (to) returnTo(to);
    else if (getPreviousPath(pathname)) router.back();
    else router.push(fallback);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-1 flex h-10 items-center rounded-full pr-3 pl-1 text-sm text-stone-500 active:bg-stone-100"
    >
      <span aria-hidden className="mr-1 text-lg leading-none">‹</span>
      {pageLabel(target)}
    </button>
  );
}

/**
 * 保存・作成・削除・キャンセルの後の移動：アプリ内の履歴に target があればそこまで戻り（履歴を増やさない）、
 * 無ければ target に置き換える。
 */
export function useReturnTo() {
  const router = useRouter();
  const pathname = usePathname();
  return (target: string) => {
    const steps = stepsBackTo(pathname, pathOf(target));
    if (steps === -1) router.back();
    else if (steps !== null) window.history.go(steps);
    else {
      markReplaceNavigation();
      router.replace(target);
    }
  };
}
