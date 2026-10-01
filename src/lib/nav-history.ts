// アプリ内の画面遷移の履歴（pathname のみ・メモリ上）。
// 戻るボタンを「ブラウザの1つ前の画面」に合わせるために使う。リロード直後や直接開いた場合は空なので、
// 戻るボタンは親画面へのフォールバックに切り替える。

import { useSyncExternalStore } from "react";

let stack: string[] = [];
let popPending = false;
let replacePending = false;
const listeners = new Set<() => void>();
const EMPTY: string[] = [];

function emit() {
  for (const l of listeners) l();
}

/** ブラウザの戻る/進む（popstate）の直後の遷移は「戻った」とみなす */
export function markPopNavigation() {
  popPending = true;
}

/** router.replace の直前に呼ぶ（履歴の末尾を置き換える） */
export function markReplaceNavigation() {
  replacePending = true;
}

/** pathname が変わるたびに呼ぶ */
export function recordPath(path: string) {
  if (stack[stack.length - 1] === path) {
    popPending = replacePending = false;
    return;
  }
  const backTo = stack.lastIndexOf(path);
  const isBack = (popPending && backTo >= 0) || stack[stack.length - 2] === path;
  const isReplace = replacePending && !isBack;
  popPending = false;
  replacePending = false;
  // 戻った（または replace で1つ前と同じ画面になった）ときはその位置まで巻き戻す
  if (isBack) stack = stack.slice(0, backTo + 1);
  else if (isReplace) stack = [...stack.slice(0, -1), path];
  else stack = [...stack, path];
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** 現在の画面 current の1つ前のアプリ内の画面（無ければ null） */
export function previousPathOf(s: string[], current: string): string | null {
  // 新しい画面の初回描画時はまだ記録前（末尾が前の画面）
  const prev = s[s.length - 1] === current ? s[s.length - 2] : s[s.length - 1];
  return prev ?? null;
}

export function getPreviousPath(current: string): string | null {
  return previousPathOf(stack, current);
}

/**
 * アプリ内の履歴で target まで何画面戻ればよいか（負の数）。履歴に無ければ null。
 * 例：ホーム → カレンダー → 日別 → 習慣詳細 で習慣を削除 → ホームまで -3
 */
export function stepsBackTo(current: string, target: string): number | null {
  const here = stack[stack.length - 1] === current ? stack.length - 1 : stack.length;
  const idx = stack.lastIndexOf(target);
  return idx >= 0 && idx < here ? idx - here : null;
}

export function useNavStack(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => stack,
    () => EMPTY,
  );
}

/** 戻り先の画面名（ボタンの文言用） */
export function pageLabel(path: string): string {
  if (path === "/") return "ホーム";
  if (path === "/calendar") return "カレンダー";
  if (path.startsWith("/calendar/")) return "日別";
  if (path === "/collection") return "コレクション";
  if (path === "/settings") return "設定";
  if (path === "/habits/new") return "戻る";
  if (/^\/habits\/[^/]+$/.test(path)) return "習慣";
  return "戻る";
}
