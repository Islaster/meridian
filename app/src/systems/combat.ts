import { Weapon, Armor, Item } from "@/data/items";
import { Monster } from "@/data/monsters";
import type { Player } from "@/state/types";
import { effective } from "./conditions";
import { bonus } from "./perks";

export const strBonus = (stats: Record<string, number>) =>
  Math.floor((stats.str ?? 5) / 3); // what the arm adds, whatever the blade

export const weaponDamage = (w: Weapon, stats: Record<string, number>) =>
  w.perks.reduce((d, p) => d + bonus(p, stats), w.damage);

export function playerAttack(p: Player): number {
  const w = p.equipment.weapon ? Item.get(p.equipment.weapon) : undefined;
  const stats = effective(p);
  const base = w instanceof Weapon ? weaponDamage(w, stats) : 1;
  return base + strBonus(stats);
}

export const playerDefense = (p: Player) =>
  Object.values(p.equipment).reduce((d, id) => {
    const it = id ? Item.get(id) : undefined;
    return d + (it instanceof Armor ? it.defense : 0);
  }, 0);

export const hit = (attack: number, defense: number) =>
  Math.max(1, attack - defense);

// The one place dice exist: loot. Seeded per day and fight, so a replayed fight drops the same.
function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++)
    h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h |= 0;
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Spoils {
  xp: number;
  gold: number;
  items: string[];
}
// what the fallen leave: xp always, gold and drops by the day's roll
export function spoils(fallen: string[], seed: string, loot = true): Spoils {
  const r = rng(seed),
    out: Spoils = { xp: 0, gold: 0, items: [] };
  for (const id of fallen) {
    const m = Monster.get(id);
    out.xp += m.xp;
    if (!loot) continue;
    out.gold += m.gold[0] + Math.floor(r() * (m.gold[1] - m.gold[0] + 1));
    for (const d of m.drops) if (r() < d.chance) out.items.push(d.item);
  }
  return out;
}

// a new day: the daily flags lift, and a dormant dungeon wakes on its day
export const refresh = (done: string[], day: number) =>
  done.filter(
    (f) =>
      !/^(room|chest|trap|gather|stat):|^act:roam-/.test(f) &&
      !(f.startsWith("dormant:") && Number(f.split(":")[2]) <= day)
  );
