export const MAX_LEVEL = 100;

/** Lv.n → Lv.n+1 に必要な XP。レベルが上がるほど増える */
export function xpToNext(level: number): number {
  return 30 + (level - 1) * 10;
}

export interface LevelInfo {
  level: number;
  /** 現在レベル内で獲得済みの XP */
  current: number;
  /** 次のレベルまでに必要な XP（最大レベルでは 0） */
  needed: number;
  progress: number;
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  let rest = Math.max(0, totalXp);
  while (level < MAX_LEVEL && rest >= xpToNext(level)) {
    rest -= xpToNext(level);
    level++;
  }
  if (level >= MAX_LEVEL) {
    return { level: MAX_LEVEL, current: rest, needed: 0, progress: 1 };
  }
  const needed = xpToNext(level);
  return { level, current: rest, needed, progress: rest / needed };
}

/** Lv.1 から指定レベルに到達するまでに必要な累計XP */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < Math.min(level, MAX_LEVEL); l++) total += xpToNext(l);
  return total;
}
