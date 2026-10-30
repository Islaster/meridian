import { Dungeon, type Guard } from "../data/land";
import { City } from "../models/city";

const MATRIX: Guard[][] = [
  // cent: 1  2  3  4  5
  /* size 1 */ [0, 1, 1, 2, 2],
  /* size 2 */ [1, 1, 2, 2, 3],
  /* size 3 */ [1, 2, 3, 3, 4],
  /* size 4 */ [2, 3, 3, 4, 5],
  /* size 5 */ [3, 4, 4, 5, 5],
];
export const GUARD: Record<
  Guard,
  { name: string; strength: number; describe: string }
> = {
  0: {
    name: "none",
    strength: 0,
    describe: "No one at the gate. Whoever's inside got there first.",
  },
  1: {
    name: "keeper",
    strength: 1,
    describe: "A keeper with a ledger and a dog.",
  },
  2: {
    name: "militia",
    strength: 2,
    describe: "A militia post: four men, a bell, a road they can see down.",
  },
  3: {
    name: "guild",
    strength: 3,
    describe:
      "Guild guards in charter grey, a checkpoint, a manifest for what comes out.",
  },
  4: {
    name: "watch",
    strength: 4,
    describe:
      "Guild and crown watch together — a gatehouse with a portcullis, inspections both ways.",
  },
  5: {
    name: "garrison",
    strength: 5,
    describe:
      "A garrison. Walls, a company, and nothing enters or leaves unrecorded.",
  },
};

export function guardOf(d: Dungeon): Guard {
  if (!d.manager) return 0; // unfound / unclaimed
  if (d.manager.kind === "private") return d.manager.guard ?? 1; // the owner's own camp — economy doc
  const c = City.get(d.manager.owner); // guild/crown dungeons are owned by a city
  return MATRIX[c.size - 1][c.centrality - 1];
}
