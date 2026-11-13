import type { Player } from "@/state/types";
import { Condition, type Active } from "@/data/conditions";

// What's on the player, and what it does to their numbers. Base stats stay what they are;
// a condition's change is applied when a stat is read, so lifting it is just taking it off.

// stat changes from everything active, summed: { lck: -5 }
export const modifiers = (p: Player): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const a of p.conditions)
    for (const [k, n] of Object.entries(Condition.get(a.id).stats(a)))
      out[k] = (out[k] ?? 0) + n;
  return out;
};
// the stats as they stand right now: base plus modifiers
export const effective = (p: Player): Record<string, number> => {
  const m = modifiers(p);
  return Object.fromEntries(
    Object.entries(p.stats).map(([k, v]) => [k, v + (m[k] ?? 0)])
  );
};
// put a condition on (one of each id at a time) / take it off
export const afflict = (p: Player, a: Active): Player => ({
  ...p,
  conditions: [...p.conditions.filter((x) => x.id !== a.id), a],
});
export const relieve = (p: Player, id: string): Player => ({
  ...p,
  conditions: p.conditions.filter((x) => x.id !== id),
});
