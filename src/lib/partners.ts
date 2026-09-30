// 育成パートナー（植物・動物）の定義。
// 見た目は components/partner/ の art キーで描き分ける。新しいパートナー（神獣・神木など）は
// ここに定義を1件足し、対応する art を追加すれば選択肢・図鑑・コレクションに自動で並ぶ。

import { MAX_LEVEL } from "./level";
import type { Habit, HabitCategory, PartnerType, PlantType } from "./types";

export type PartnerRarity = "standard" | "mythic";

export interface PartnerDef {
  id: string;
  type: PartnerType;
  name: string;
  /** Lv.100 で解放される伝説形態の名称 */
  legendName: string;
  description: string;
  /** おすすめ表示でこのパートナーを先頭に出すカテゴリー */
  categoryRecommendations: HabitCategory[];
  rarity: PartnerRarity;
  /** false のものは選択肢に出さない（将来の追加・期間限定用） */
  selectable: boolean;
}

export const PARTNERS: PartnerDef[] = [
  // ---- 植物 ----
  { id: "monstera", type: "plant", name: "モンステラ", legendName: "世界樹", description: "大きな葉がどんどん増える", categoryRecommendations: ["study", "home", "other"], rarity: "standard", selectable: true },
  { id: "cactus", type: "plant", name: "サボテン", legendName: "砂漠王樹", description: "ゆっくり着実に背を伸ばす", categoryRecommendations: ["health"], rarity: "standard", selectable: true },
  { id: "sakura", type: "plant", name: "桜", legendName: "天桜", description: "育ちきると満開の花を咲かせる", categoryRecommendations: ["relationships", "beauty"], rarity: "standard", selectable: true },
  { id: "pachira", type: "plant", name: "パキラ", legendName: "黄金樹", description: "編み込みの幹がたくましく育つ", categoryRecommendations: ["money", "career"], rarity: "standard", selectable: true },
  { id: "lavender", type: "plant", name: "ラベンダー", legendName: "月光花", description: "穏やかな香りの紫の穂", categoryRecommendations: ["mental", "sleep"], rarity: "standard", selectable: true },
  { id: "sunflower", type: "plant", name: "ひまわり", legendName: "太陽花", description: "太陽に向かってまっすぐ伸びる", categoryRecommendations: ["hobby", "lifestyle"], rarity: "standard", selectable: true },
  // ---- 動物 ----
  { id: "dog", type: "animal", name: "犬", legendName: "神狼", description: "いつもそばで応援してくれる", categoryRecommendations: ["health", "relationships", "lifestyle"], rarity: "standard", selectable: true },
  { id: "cat", type: "animal", name: "猫", legendName: "霊猫", description: "マイペースに寄り添う", categoryRecommendations: ["relationships", "sleep", "beauty", "other"], rarity: "standard", selectable: true },
  { id: "owl", type: "animal", name: "フクロウ", legendName: "賢者梟", description: "知恵を少しずつ蓄える", categoryRecommendations: ["study", "career"], rarity: "standard", selectable: true },
  { id: "bear", type: "animal", name: "クマ", legendName: "神熊", description: "どっしり力強く育つ", categoryRecommendations: ["health", "home"], rarity: "standard", selectable: true },
  { id: "fox", type: "animal", name: "キツネ", legendName: "九尾", description: "好奇心で尻尾が増えていく", categoryRecommendations: ["hobby", "money"], rarity: "standard", selectable: true },
  { id: "penguin", type: "animal", name: "ペンギン", legendName: "氷帝鳥", description: "一歩ずつ前へ進む", categoryRecommendations: ["mental", "home"], rarity: "standard", selectable: true },
];

const BY_ID = new Map(PARTNERS.map((p) => [p.id, p]));

export function getPartner(id: string): PartnerDef {
  return BY_ID.get(id) ?? BY_ID.get("monstera")!;
}

export function isKnownPartnerId(id: unknown): id is string {
  return typeof id === "string" && BY_ID.has(id);
}

/** 旧データ（plant のみ）も含めて、習慣のパートナーを返す */
export function habitPartner(habit: Pick<Habit, "partnerId">): PartnerDef {
  return getPartner(habit.partnerId);
}

export function legacyPlantToPartnerId(plant: PlantType | undefined): string {
  return plant && BY_ID.has(plant) ? plant : "monstera";
}

/** カテゴリーに合うパートナーを先頭に、選択可能なものを並べる */
export function partnersForCategory(category: HabitCategory, type?: PartnerType): PartnerDef[] {
  const list = PARTNERS.filter((p) => p.selectable && (!type || p.type === type));
  const rec = list.filter((p) => p.categoryRecommendations.includes(category));
  return [...rec, ...list.filter((p) => !rec.includes(p))];
}

export function recommendedPartners(category: HabitCategory): PartnerDef[] {
  return PARTNERS.filter((p) => p.selectable && p.categoryRecommendations.includes(category));
}

// ---- 成長段階（植物・動物共通のレベル区切り） ----

/** 0: Lv.1〜9 / 1: 10〜24 / 2: 25〜49 / 3: 50〜74 / 4: 75〜99 / 5: 100（伝説形態） */
export function growthStage(level: number): number {
  if (level >= MAX_LEVEL) return 5;
  if (level >= 75) return 4;
  if (level >= 50) return 3;
  if (level >= 25) return 2;
  if (level >= 10) return 1;
  return 0;
}

export const LEGEND_STAGE = 5;

const STAGE_NAMES: Record<PartnerType, string[]> = {
  plant: ["芽", "若葉", "成長期", "立派な株", "満開", "伝説形態"],
  animal: ["赤ちゃん", "こども", "わかもの", "おとな", "熟練", "伝説形態"],
};

export function stageName(type: PartnerType, level: number): string {
  return STAGE_NAMES[type][growthStage(level)];
}

export const STAGE_LEVELS = [1, 10, 25, 50, 75, 100];

/** 表示名（Lv.100 なら伝説形態名） */
export function partnerDisplayName(def: PartnerDef, level: number): string {
  return level >= MAX_LEVEL ? def.legendName : def.name;
}
