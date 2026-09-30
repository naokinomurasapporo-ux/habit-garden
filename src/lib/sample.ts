import { addDays } from "./date";
import type { AppData, DateKey, Habit, LogMap } from "./types";

/** 動作確認用のサンプルデータ（過去 60 日分の記録付き） */
export function buildSampleData(today: DateKey): AppData {
  const start = addDays(today, -60);
  const habits: Habit[] = [
    { id: "sample-read", name: "読書", kind: "build", trackType: "check", period: "day", target: 1, category: "study", partnerType: "plant", partnerId: "monstera", createdAt: start, order: 1 },
    { id: "sample-morning", name: "朝活", kind: "build", trackType: "time", period: "week", target: 300, dailyTargetMinutes: 60, weeklyDays: 5, category: "study", partnerType: "animal", partnerId: "owl", createdAt: start, order: 2 },
    { id: "sample-gym", name: "ジム", kind: "build", trackType: "check", period: "week", target: 2, category: "health", partnerType: "animal", partnerId: "bear", createdAt: start, order: 3 },
    { id: "sample-english", name: "英語の音読", kind: "build", trackType: "check", period: "week", target: 3, category: "study", partnerType: "plant", partnerId: "sunflower", createdAt: start, order: 4 },
    { id: "sample-snack", name: "夜のお菓子", kind: "quit", trackType: "check", period: "day", target: 1, category: "lifestyle", partnerType: "plant", partnerId: "cactus", createdAt: start, order: 5 },
    { id: "sample-sns", name: "寝る前のSNS", kind: "quit", trackType: "check", period: "day", target: 1, category: "sleep", partnerType: "animal", partnerId: "cat", createdAt: start, order: 6 },
  ];

  // 決定的な擬似乱数（毎回同じサンプルになる）
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const logs: LogMap = {};
  for (const h of habits) logs[h.id] = {};
  for (let d = start; d < today; d = addDays(d, 1)) {
    if (rand() < 0.8) logs["sample-read"][d] = 1;
    if (rand() < 0.75) logs["sample-morning"][d] = [30, 45, 60, 60, 75][Math.floor(rand() * 5)];
    if (rand() < 0.3) logs["sample-gym"][d] = 1;
    if (rand() < 0.45) logs["sample-english"][d] = 1;
    if (rand() < 0.9) logs["sample-snack"][d] = rand() < 0.85 ? 1 : 0;
    if (rand() < 0.85) logs["sample-sns"][d] = rand() < 0.7 ? 1 : 0;
  }
  return { habits, logs, completions: [] };
}
