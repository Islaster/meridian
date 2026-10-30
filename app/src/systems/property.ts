import { Item } from "../data/items";
import type { Location, Upgrade } from "../data/world/locations";
import { countItem, takeItem } from "./inventory";
import { advance } from "./time";
import type { GameState } from "../state/types";

export const owned = (s: GameState, loc: Location) =>
  !!loc.deed && s.done.includes(loc.deed);
const built = (s: GameState, id: string) => s.done.includes(`built:${id}`);

export const buildable = (s: GameState, loc: Location) =>
  loc.upgrades.filter(
    (u) => !built(s, u.id) && (!u.after || built(s, u.after))
  );

// First thing you're short of, as a reason; null when you can pay.
export function shortfall(s: GameState, u: Upgrade): string | null {
  if (u.gold && s.bag.gold < u.gold) return `${u.gold} gold`;
  for (const it of u.items ?? []) {
    const have = countItem(s.bag, it.id);
    if (have < it.qty) return `${it.qty - have} more ${Item.get(it.id).name}`;
  }
  return null;
}

export const costText = (u: Upgrade) =>
  [
    u.gold && `${u.gold} gold`,
    ...(u.items ?? []).map((it) => `${it.qty} ${Item.get(it.id).name}`),
  ]
    .filter(Boolean)
    .join(" · ");

export function build(s: GameState, u: Upgrade): GameState {
  let bag = { ...s.bag, gold: s.bag.gold - (u.gold ?? 0) };
  for (const it of u.items ?? []) bag = takeItem(bag, it.id, it.qty);
  return {
    ...s,
    bag,
    done: [...s.done, `built:${u.id}`],
    time: u.hours ? advance(s.time, u.hours) : s.time,
  };
}
