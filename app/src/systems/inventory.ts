import { Item, Weapon, Armor } from "../data/items";
import type { GameState } from "../state/types";
import type { Loadout } from "../data/locations";

type Bag = GameState["bag"];
type Cat = "equipment" | "materials" | "consumables" | "questItems";
type Player = GameState["player"];
const CATS: Cat[] = ["equipment", "materials", "consumables", "questItems"];
const catOf = (kind: Item["kind"]): Cat =>
  kind === "quest"
    ? "questItems"
    : kind === "material"
    ? "materials"
    : kind === "consumable"
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
    eq = { ...(p.equipment ?? {}) };
  if (it instanceof Weapon) eq.mainWeapon = it.name;
  else if (it instanceof Armor)
    eq[it.slot === "ring" ? (eq.ringOne ? "ringTwo" : "ringOne") : it.slot] =
      it.name;
  return { ...p, equipment: eq };
}

export function lend(s: GameState, lo: Loadout): GameState {
  let bag = s.bag,
    player = s.player;
  for (const { id, qty } of lo.items) {
    bag = giveItem(bag, id, qty ?? 1);
    if (Item.get(id) instanceof Weapon && !player.equipment?.mainWeapon)
      player = equip(player, id);
  }
  return { ...s, bag, player };
}

//HELPER Functions
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
