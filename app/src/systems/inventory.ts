import { Item, Consumable } from "../data/items";
import type { GameState } from "../state/types";
import type { Loadout } from "../data/locations";
import { Npc } from "../data/locations";
import { notify } from "./notices";

type Bag = GameState["bag"];
type Cat = "equipment" | "materials" | "consumables" | "questItems";
type Player = GameState["player"];
const CATS: Cat[] = ["equipment", "materials", "consumables", "questItems"];
const catOf = (kind: Item["kind"]): Cat =>
  kind === "quest"
    ? "questItems"
    : kind === "material"
    ? "materials"
    : kind === "consumable" || kind === "throwable"
    ? "consumables"
    : "equipment";

export const hasItem = (bag: Bag, id: string) => {
  const name = Item.get(id).name;
  return CATS.some((c) => bag[c]?.some((i) => i.name === name));
};
export function giveItem(bag: Bag, id: string, qty = 1): Bag {
  const it = Item.get(id),
    c = catOf(it.kind),
    list = bag[c] ?? [],
    i = list.findIndex((x) => x.name === it.name);
  return {
    ...bag,
    [c]:
      i >= 0
        ? list.map((x, k) => (k === i ? { ...x, qty: x.qty + qty } : x))
        : [...list, { name: it.name, qty }],
  };
}
export function takeItem(bag: Bag, id: string, qty = 1): Bag {
  const it = Item.get(id),
    c = catOf(it.kind);
  return {
    ...bag,
    [c]: (bag[c] ?? [])
      .map((x) => (x.name === it.name ? { ...x, qty: x.qty - qty } : x))
      .filter((x) => x.qty > 0),
  };
}

export function equip(p: Player, id: string): Player {
  const it = Item.get(id),
    eq = { ...(p.equipment ?? {}) },
    slot = it.slot;
  if (!slot) return p;
  if (slot === "ring") eq[eq.ringOne ? "ringTwo" : "ringOne"] = it.name;
  else if (slot === "weapon") eq.mainWeapon = it.name;
  else if (slot === "offhand") eq.altWeapon = it.name;
  else eq[slot] = it.name;
  return { ...p, equipment: eq };
}

export function lend(s: GameState, npcId: string, lo: Loadout): GameState {
  let bag = s.bag,
    player = s.player;
  for (const { id, qty } of lo.items) bag = giveItem(bag, id, qty ?? 1);
  return { ...s, bag, player, done: [...s.done, `loan:${npcId}:${lo.id}`] };
}

export function buy(s: GameState, id: string): GameState | null {
  const it = Item.get(id);
  return s.bag.gold < it.price
    ? null
    : { ...s, bag: giveItem({ ...s.bag, gold: s.bag.gold - it.price }, id) };
}

export function sell(s: GameState, name: string, cut: number): GameState {
  const it = itemByName(name);
  if (!it || it.kind === "quest") return s;
  const gold = Math.floor(it.price * (1 - cut));
  return { ...s, bag: { ...takeItem(s.bag, it.id), gold: s.bag.gold + gold } };
}

export const itemByName = (name: string) =>
  [...Item.registry.values()].find((i) => i.name === name);
export function unequip(
  p: Player,
  slot: keyof NonNullable<Player["equipment"]>
): Player {
  const eq = { ...(p.equipment ?? {}) };
  delete eq[slot];
  return { ...p, equipment: eq };
}

export function consume(s: GameState, id: string): GameState {
  const it = Item.get(id);
  if (!(it instanceof Consumable)) return s;
  return {
    ...s,
    bag: takeItem(s.bag, id),
    player: {
      ...s.player,
      hp: Math.min(s.player.maxHp, s.player.hp + it.heal),
    },
  };
}

export const countItem = (bag: GameState["bag"], id: string) => {
  const it = Item.get(id);
  return (bag[catOf(it.kind)] ?? []).find((x) => x.name === it.name)?.qty ?? 0;
};

export function returnLoan(s: GameState, npcId: string): GameState {
  const flag = s.done.find((f) => f.startsWith(`loan:${npcId}:`));
  const lo = Npc.get(npcId).lends?.find((l) => l.id === flag?.split(":")[2]);
  if (!lo) return s;
  let player = s.player,
    bag = s.bag;
  for (const it of lo.items) {
    const name = Item.get(it.id).name;
    for (const [slot, worn] of Object.entries(player.equipment ?? {}))
      if (worn === name)
        player = unequip(
          player,
          slot as keyof NonNullable<typeof player.equipment>
        );
    const n = Math.min(it.qty ?? 1, countItem(bag, it.id));
    if (n) bag = takeItem(bag, it.id, n);
  }
  return notify(
    { ...s, player, bag },
    `《Returned》 ${Npc.get(npcId).name}'s loaner`
  );
}

export function handOver(s: GameState, id: string, qty = 1): GameState {
  const it = Item.get(id);
  return notify(
    { ...s, bag: takeItem(s.bag, id, qty) },
    `《Handed over》 ${qty > 1 ? `${qty} × ` : ""}${it.name}`
  );
}
