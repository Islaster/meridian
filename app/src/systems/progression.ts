import type { GameState } from "../state/types";
type Player = GameState["player"];

export const xpToNext = (level: number) =>
  Math.round(20 * Math.pow(level, 1.5)); // placeholder curve — tune on the sheet

export function levelUp(p: Player): Player {
  let { level, xp, statPoints, skillPoints } = p;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level++;
    statPoints += 3;
    skillPoints += 1;
  }
  return { ...p, level, xp, statPoints, skillPoints };
}
