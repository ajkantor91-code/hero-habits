export type Difficulty = "easy" | "medium" | "hard";

export function xpForDifficulty(d: Difficulty): number {
  if (d === "easy") return 10;
  if (d === "medium") return 20;
  return 35;
}

export function xpToNextLevel(level: number): number {
  return 100 + Math.max(0, level - 1) * 25;
}

export function levelFromTotalXp(totalXp: number): {
  level: number;
  progress: number;
  next: number;
} {
  let level = 1;
  let remaining = Math.max(0, totalXp);

  while (remaining >= xpToNextLevel(level)) {
    remaining -= xpToNextLevel(level);
    level += 1;
    if (level > 200) break;
  }

  const next = xpToNextLevel(level);
  const progress = remaining;
  return { level, progress, next };
}
