import { Weapon, Armor, Item } from "../data/items";
import { Monster } from "../data/monsters";
import type { GameState } from "../state/types";
import { itemByName } from "./inventory";

type Player = GameState["player"];

export function weaponDamage(w: Weapon, stats: Record<string, number>): number {
  if (!w.scaling) return w.damage;
  return (
    w.damage +
    Math.floor(
      Math.max(0, (stats[w.scaling.stat] ?? 0) - w.scaling.from) * w.scaling.per
    )
  );
}

export function playerAttack(p: Player): number {
  const w = p.equipment?.mainWeapon
    ? itemByName(p.equipment.mainWeapon)
    : undefined;
  const base = w instanceof Weapon ? weaponDamage(w, p.stats) : 1;
  return base + Math.floor((p.stats.str ?? 5) / 3);
}

export function playerDefense(p: Player): number {
  return Object.values(p.equipment ?? {}).reduce((d, name) => {
    const it = name ? itemByName(name) : undefined;
    return d + (it instanceof Armor ? it.defense : 0);
  }, 0);
}

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

export function spoils(monsterIds: string[], seed: string): Spoils {
  const r = rng(seed),
    out: Spoils = { xp: 0, gold: 0, items: [] };
  for (const id of monsterIds) {
    const m = Monster.get(id);
    out.xp += m.xp;
    out.gold += m.gold[0] + Math.floor(r() * (m.gold[1] - m.gold[0] + 1));
    for (const d of m.drops) if (r() < d.chance) out.items.push(d.item);
  }
  return out;
}

export const refresh = (done: string[], day: number) =>
  done.filter(
    (f) =>
      !/^(room|chest|trap):/.test(f) &&
      !(f.startsWith("dormant:") && Number(f.split(":")[2]) <= day)
  );

export const itemName = (id: string) => Item.get(id).name;
