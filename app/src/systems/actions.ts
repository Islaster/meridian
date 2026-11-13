import type { GameState } from "@/state/types";
import { Npc, Location, type Action, type Placed } from "@/models/location";
import { Quest } from "@/data/quests";
import { SPOTS } from "@/data/gather";
import { spotActions, dealt } from "./gather";
import { meets } from "./requirements";
import { progress } from "./quests";
import { advance } from "./time";
import { add } from "@/lib/flags";

// Pointers declared by quests, indexed by the place they stand in.
// Built once, on first use; rebuilt if the registry grows (hot reload).
let index: { size: number; byPlace: Map<string, Placed[]> } | null = null;
const placed = () => {
  if (index?.size !== Quest.registry.size) {
    const byPlace = new Map<string, Placed[]>();
    for (const a of Quest.all().flatMap((q) => q.actions))
      (byPlace.get(a.at) ?? byPlace.set(a.at, []).get(a.at)!).push(a);
    index = { size: Quest.registry.size, byPlace };
  }
  return index.byPlace;
};

// a pointer shows when its quest is taken (if it has one), it isn't done, and its terms are met
const open = (a: Action, s: GameState) =>
  (!a.quest || s.quests[a.quest]?.status === "taken") &&
  !s.done.includes(`act:${a.id}`) &&
  meets(s, a.requires);
// what's in a scene to act on: the place's own pointers, what quests placed here, today's spots
export const available = (loc: Location, s: GameState): Action[] =>
  [
    ...loc.actions,
    ...(placed().get(loc.id) ?? []),
    ...spotActions(loc.id, s),
  ].filter((a) => open(a, s));
// what someone will talk about here: their pointers, posted in this scene, that are open
export const topics = (n: Npc, loc: Location, s: GameState): Action[] =>
  n.actions.filter((a) => a.at === loc.id && open(a, s));

// where a pointer stands today — for the ✦
export const placeOf = (s: GameState, id: string): string | undefined => {
  if (id.startsWith("roam-") && Location.registry.has(id.slice(5)))
    return id.slice(5);
  const sp = SPOTS.find((x) => x.id === id);
  if (sp) return dealt(s, sp);
  for (const [at, list] of placed())
    if (list.some((a) => a.id === id)) return at;
  for (const n of Npc.all())
    for (const a of n.actions) if (a.id === id) return a.at;
  return Location.find((l) => l.actions.some((a) => a.id === id))?.id;
};

// what a pointer does once it's earned — directly, or after its fight is won
export function perform(s: GameState, a: Action): GameState {
  const flag = `act:${a.id}`;
  const base: GameState = {
    ...s,
    done: a.repeat ? s.done : add(s.done, flag),
    bag: a.gold ? { ...s.bag, gold: s.bag.gold - a.gold } : s.bag,
    time: a.hours ? advance(s.time, a.hours) : s.time,
  };
  return progress(a.effect ? a.effect(base) : base, { kind: "flag", flag });
}
