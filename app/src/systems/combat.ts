import { type Weapon } from "../data/items";
export function weaponDamage(w: Weapon, stats: Record<string, number>): number {
  if (!w.scaling) return w.damage;
  const above = Math.max(0, (stats[w.scaling.stat] ?? 0) - w.scaling.from);
  return w.damage + Math.floor(above * w.scaling.per);
}
