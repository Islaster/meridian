import type { Perk } from "@/models/item";

const STAT = (k: string) => k.toUpperCase();

// what a perk adds to damage, with these stats
export const bonus = (p: Perk, stats: Record<string, number>): number =>
  p.kind === "scaling"
    ? Math.floor(Math.max(0, (stats[p.stat] ?? 0) - p.from) * p.per)
    : 0;

// the rule in words, then what it comes to with these stats
export const explain = (p: Perk, stats: Record<string, number>): string => {
  if (p.kind !== "scaling") return "";
  const rule =
    p.per >= 1
      ? `+${p.per} damage for every point of ${STAT(p.stat)} above ${p.from}`
      : `+1 damage for every ${Math.round(1 / p.per)} ${STAT(p.stat)} above ${
          p.from
        }`;
  return `${rule}. At your ${STAT(p.stat)} ${stats[p.stat] ?? 0}: +${bonus(
    p,
    stats
  )}.`;
};
