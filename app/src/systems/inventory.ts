import { Item, Consumable, isGear, type Kind } from "@/data/items";
import { Npc, type Loadout } from "@/data/world/locations";
import type { Bag, Equipment, GameState, Player } from "@/state/types";
import { notify } from "./notices";
import { add } from "@/lib/flags";

// ── the bag: item id → count ──────────────────────────────────────────────
export const count = (bag: Bag, id: string) => bag.items[id] ?? 0;
export const hasItem = (bag: Bag, id: string) => count(bag, id) > 0;
export const giveItem = (bag: Bag, id: string, qty = 1): Bag => {
  Item.get(id); // an unknown id is a data bug — fail here, with the id, not in a render
  return { ...bag, items: { ...bag.items, [id]: count(bag, id) + qty } };
};
export const takeItem = (bag: Bag, id: string, qty = 1): Bag => {
  const left = count(bag, id) - qty;
  const items = { ...bag.items };
  if (left > 0) items[id] = left;
  else delete items[id];
  return { ...bag, items };
};
// what's carried, as items with their counts — the shelves read `kind` off these
export const carried = (bag: Bag) =>
  Object.entries(bag.items).map(([id, qty]) => ({ item: Item.get(id), qty }));
export type Shelf = "gear" | "supplies" | "materials" | "papers";
export const SHELF_OF: Record<Kind, Shelf> = {
  weapon: "gear",
  armor: "gear",
  tool: "gear",
  consumable: "supplies",
  throwable: "supplies",
  material: "materials",
  quest: "papers",
};

// ── what's worn: slot → item id ───────────────────────────────────────────
export const wornIn = (eq: Equipment, id: string) =>
  (Object.keys(eq) as (keyof Equipment)[]).find((k) => eq[k] === id);
export function equip(p: Player, id: string): Player {
  const it = Item.get(id);
  if (!it.slot) return p;
  const slot = it.slot === "ring" && p.equipment.ring ? "ring2" : it.slot;
  return { ...p, equipment: { ...p.equipment, [slot]: id } };
}
export function unequip(p: Player, slot: keyof Equipment): Player {
  const equipment = { ...p.equipment };
  delete equipment[slot];
  return { ...p, equipment };
}
// the piece a new one would replace
export const wornFor = (eq: Equipment, it: Item) =>
  it.slot ? eq[it.slot] : undefined;
export const wearable = (p: Player, id: string) => {
  const it = Item.get(id);
  return (
    isGear(it) &&
    p.level >= it.reqLevel &&
    Object.entries(it.reqStats).every(([k, n]) => (p.stats[k] ?? 0) >= n)
  );
};

// ── trade ─────────────────────────────────────────────────────────────────
export function buy(s: GameState, id: string): GameState {
  const it = Item.get(id);
  if (s.bag.gold < it.price) return s;
  return { ...s, bag: giveItem({ ...s.bag, gold: s.bag.gold - it.price }, id) };
}
export const sellPrice = (it: Item, cut: number) =>
  Math.floor(it.price * (1 - cut));
export function sell(s: GameState, id: string, cut: number): GameState {
  const it = Item.get(id);
  if (it.kind === "quest" || !hasItem(s.bag, id)) return s;
  return {
    ...s,
    bag: { ...takeItem(s.bag, id), gold: s.bag.gold + sellPrice(it, cut) },
  };
}
export function consume(s: GameState, id: string): GameState {
  const it = Item.get(id);
  if (!(it instanceof Consumable) || !hasItem(s.bag, id)) return s;
  return {
    ...s,
    bag: takeItem(s.bag, id),
    player: {
      ...s.player,
      hp: Math.min(s.player.maxHp, s.player.hp + it.heal),
    },
  };
}

// ── loans: gear an npc lends a stranger, and takes back ───────────────────
export function lend(s: GameState, npcId: string, lo: Loadout): GameState {
  let bag = s.bag;
  for (const { id, qty } of lo.items) bag = giveItem(bag, id, qty ?? 1);
  return { ...s, bag, done: add(s.done, `loan:${npcId}:${lo.id}`) };
}
export function returnLoan(s: GameState, npcId: string): GameState {
  const flag = s.done.find((f) => f.startsWith(`loan:${npcId}:`));
  const lo = Npc.get(npcId).lends?.find((l) => l.id === flag?.split(":")[2]);
  if (!lo) return s;
  let player = s.player,
    bag = s.bag;
  for (const it of lo.items) {
    const slot = wornIn(player.equipment, it.id);
    if (slot) player = unequip(player, slot);
    const n = Math.min(it.qty ?? 1, count(bag, it.id));
    if (n) bag = takeItem(bag, it.id, n);
  }
  return notify(
    { ...s, player, bag },
    `《Returned》 ${Npc.get(npcId).name}'s loaner`
  );
}
