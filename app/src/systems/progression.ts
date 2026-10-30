import type { GameState } from "../state/types";

export const xpToNext = (level: number) =>
  Math.round(20 * Math.pow(level, 1.5)); // placeholder curve — tune on the sheet

export function levelUp(p: GameState["player"]): GameState["player"] {
  let out = p;
  while (out.xp >= xpToNext(out.level))
    out = {
      ...out,
      xp: out.xp - xpToNext(out.level),
      level: out.level + 1,
      statPoints: out.statPoints + 3,
      skillPoints: out.skillPoints + 1,
      hp: out.maxHp,
      mp: out.maxMp,
    };
  return out;
}
