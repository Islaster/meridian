import type { GameState } from "@/state/types";
import { Npc, Location, type Action, type Placed } from "@/models/location";
import { Quest } from "@/data/quests";
import { SPOTS } from "@/data/gather";
import { spotActions, dealt } from "./gather";
import { meets } from "./requirements";
import { progress } from "./quests";
import { advance } from "./time";
import { add } from "@/lib/flags";

// Pointers declared by quests and npcs, indexed by the place they stand in.
// Built once, on first use; rebuilt if the registries grow (hot reload).
let index: { size: number; byPlace: Map<string, Placed[]> } | null = null;
const placed = () => {
  const size = Quest.registry.size + Npc.registry.size;
  if (index?.size !== size) {
    const byPlace = new Map<string, Placed[]>();
    const all = [
      ...Quest.all().flatMap((q) => q.actions),
      ...Npc.all().flatMap((n) => n.actions),
    ];
    for (const a of all)
      (byPlace.get(a.at) ?? byPlace.set(a.at, []).get(a.at)!).push(a);
    index = { size, byPlace };
  }
  return index.byPlace;
};

// every pointer in a scene: the place's own, the placed ones, today's gather spots
const actionsAt = (loc: Location, s: GameState): Action[] => [
  ...loc.actions,
  ...(placed().get(loc.id) ?? []),
  ...spotActions(loc.id, s),
];
// the ones that show: their quest is taken (if they have one), not already done, and open
export const available = (loc: Location, s: GameState) =>
  actionsAt(loc, s).filter(
    (a) =>
      (!a.quest || s.quests[a.quest]?.status === "taken") &&
      !s.done.includes(`act:${a.id}`) &&
      meets(s, a.requires)
  );

// where a pointer stands today — for the ✦
export const placeOf = (s: GameState, id: string): string | undefined => {
  if (id.startsWith("roam-") && Location.registry.has(id.slice(5)))
    return id.slice(5);
  const sp = SPOTS.find((x) => x.id === id);
  if (sp) return dealt(s, sp);
  for (const [at, list] of placed())
    if (list.some((a) => a.id === id)) return at;
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
