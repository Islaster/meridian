import type { Player } from "@/state/types";

export const xpToNext = (level: number) =>
  Math.round(20 * Math.pow(level, 1.5)); // placeholder curve — tune on the sheet

// xp in, levels out; a level mends you and hands out points
function levelUp(p: Player): Player {
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
export const gainXp = (p: Player, xp: number) =>
  xp > 0 ? levelUp({ ...p, xp: p.xp + xp }) : p;
