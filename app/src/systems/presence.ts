import { Location, Npc } from "../data/world/locations";
import { isOpen } from "./time";
import { seed } from "./seed";
import type { GameState } from "../state/types";

// Is this place's roam out today? Dealt by the day, so it's the same answer on every replay.
export const roaming = (s: GameState, loc: Location) =>
  !!loc.roam && seed(`${s.time.dayId}:roam:${loc.id}`) < loc.roam.chance;

export const locationOfNpc = (npc: string) =>
  [...Location.registry.values()].find((l) => l.npcs.includes(npc))?.id;

// A resident works their post while it's open and is home when it isn't.
export function whereIs(s: GameState, id: string): string | undefined {
  const n = Npc.get(id),
    post = locationOfNpc(id);
  const working =
    !!post &&
    isOpen(Location.get(post).hours, s.time) &&
    isOpen(n.hours, s.time);
  if (working) return post;
  return n.home && s.done.includes(n.home.when) ? n.home.location : undefined;
}

export const present = (s: GameState, loc: Location) =>
  [...Npc.registry.values()]
    .filter((n) => whereIs(s, n.id) === loc.id)
    .map((n) => n.id);

export function describeNow(s: GameState, loc: Location) {
  let text = loc.describe;
  for (const a of loc.after) if (s.done.includes(a.when)) text = a.describe;
  return text;
}
