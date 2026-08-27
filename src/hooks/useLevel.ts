import {
  getLevelFromXP,
  getTierFromLevel,
  getNextLevel,
  getLevelProgress,
} from "@/lib/config/levels";

export function useLevel(xp: number) {
  const levelData = getLevelFromXP(xp);
  const nextLevel = getNextLevel(xp);
  const progress = getLevelProgress(xp);

  return {
    level: levelData.level,
    tier: levelData.tier,
    nextLevelXP: nextLevel?.xpRequired || null,
    progress,
  };
}
