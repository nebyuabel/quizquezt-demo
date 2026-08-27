export type Tier = "Stone" | "Bronze" | "Silver" | "Gold" | "Diamond";

export interface LevelConfig {
  level: number;
  tier: Tier;
  xpRequired: number; // XP needed to reach this level
}

export const LEVELS: LevelConfig[] = [
  // Tier 1: Stone
  { level: 1, tier: "Stone", xpRequired: 0 },
  { level: 2, tier: "Stone", xpRequired: 500 },
  { level: 3, tier: "Stone", xpRequired: 1000 },
  { level: 4, tier: "Stone", xpRequired: 1500 },
  { level: 5, tier: "Stone", xpRequired: 2000 },
  // Tier 2: Bronze
  { level: 6, tier: "Bronze", xpRequired: 2000 },
  { level: 7, tier: "Bronze", xpRequired: 2750 },
  { level: 8, tier: "Bronze", xpRequired: 3500 },
  { level: 9, tier: "Bronze", xpRequired: 4250 },
  { level: 10, tier: "Bronze", xpRequired: 5000 },
  // Tier 3: Silver
  { level: 11, tier: "Silver", xpRequired: 6000 },
  { level: 12, tier: "Silver", xpRequired: 7000 },
  { level: 13, tier: "Silver", xpRequired: 8000 },
  { level: 14, tier: "Silver", xpRequired: 9000 },
  { level: 15, tier: "Silver", xpRequired: 10000 },
  // Tier 4: Gold
  { level: 16, tier: "Gold", xpRequired: 12000 },
  { level: 17, tier: "Gold", xpRequired: 14000 },
  { level: 18, tier: "Gold", xpRequired: 16000 },
  { level: 19, tier: "Gold", xpRequired: 18000 },
  { level: 20, tier: "Gold", xpRequired: 20000 },
  // Tier 5: Diamond
  { level: 21, tier: "Diamond", xpRequired: 23000 },
  { level: 22, tier: "Diamond", xpRequired: 26000 },
  { level: 23, tier: "Diamond", xpRequired: 29000 },
  { level: 24, tier: "Diamond", xpRequired: 32000 },
  { level: 25, tier: "Diamond", xpRequired: 35000 },
];

export function getLevelFromXP(xp: number): LevelConfig {
  let result = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) {
      result = level;
    } else {
      break;
    }
  }
  return result;
}

export function getNextLevel(xp: number): LevelConfig | null {
  const current = getLevelFromXP(xp);
  const next = LEVELS.find((l) => l.level === current.level + 1);
  return next || null;
}

export function getXPToNextLevel(xp: number): number {
  const next = getNextLevel(xp);
  if (!next) return 0;
  return next.xpRequired - xp;
}

export function getLevelProgress(xp: number): number {
  const current = getLevelFromXP(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const prevXP = LEVELS[current.level - 2]?.xpRequired ?? 0;
  const needed = next.xpRequired - prevXP;
  const earned = xp - prevXP;
  return Math.min(100, (earned / needed) * 100);
}
