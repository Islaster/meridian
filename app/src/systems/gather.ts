import { notify } from "./notices";
import { giveItem } from "./inventory";
import { SPOTS, spot, type Spot } from "../data/gather";
import type { Action } from "../models/location";
import { type GameState } from "../state/types";
import { seed } from "./seed";
import { canCraft } from "./craft";
import type { Craft } from "../models/item";

const key = (s: GameState, sp: Spot) => `gather:${sp.id}:${s.time.dayId}`;
const skill = (sp: Spot) => `gather:${sp.kind}`;

export const richness = (s: GameState, sp: Spot) =>
  sp.rich[Math.floor(seed(`${s.time.dayId}:rich:${sp.id}`) * sp.rich.length)];
export const left = (s: GameState, sp: Spot) =>
  sp.cap - (s.counters[key(s, sp)] ?? 0);
const CRAFT_OF: Record<Spot["kind"], Craft | null> = {
  ore: "smith",
  wood: "fletch",
  herb: "alchemy",
  fuel: null,
};
const rare = (sp: Spot) => !!sp.grade && sp.grade !== "normal";

export const gather =
  (id: string) =>
  (s: GameState): GameState => {
    const sp = spot(id);
    const at = dealt(s, sp);
    if (!at) return notify(s, "Nothing here today.");
    if (s.done.some((f) => f.startsWith(`dormant:${at}`)))
      return notify(s, "Nothing stirs. The ground's gone quiet.");
    if (left(s, sp) <= 0) return notify(s, "Worked out for today.");
    const p = s.player.proficiency[skill(sp)] ?? 0;
    const qty = richness(s, sp) + Math.floor(p / 5);
    return {
      ...s,
      bag: giveItem(s.bag, sp.material, qty), // the bag's own notice says what came up, in its color
      counters: {
        ...s.counters,
        [key(s, sp)]: (s.counters[key(s, sp)] ?? 0) + 1,
      },
      player: {
        ...s.player,
        proficiency: { ...s.player.proficiency, [skill(sp)]: p + 1 },
      },
    };
  };

export const spotActions = (place: string, s: GameState): Action[] =>
  SPOTS.filter((sp) => dealt(s, sp) === place).map((sp) => ({
    id: sp.id,
    label: `${sp.label} · ${Math.max(0, left(s, sp))}h left`,
    text: sp.text,
    hours: 1,
    repeat: true,
    requires:
      rare(sp) && CRAFT_OF[sp.kind]
        ? { ...sp.requires, craft: CRAFT_OF[sp.kind]! }
        : sp.requires,
    effect: gather(sp.id),
  }));

// the ledger — the whole list of what moves a rare spot's odds, in one place
export const odds = (s: GameState, sp: Spot) => {
  let p = sp.odds ?? 0.15;
  p += 0.05 * Math.floor((s.player.proficiency[`gather:${sp.kind}`] ?? 0) / 10); // you know the ground
  if (CRAFT_OF[sp.kind] && canCraft(s, CRAFT_OF[sp.kind]!)) p += 0.1; // you know what you're looking at
  if (s.counters[`gather:${sp.id}:${s.time.dayId - 1}`]) p -= 0.1; // worked yesterday — the ground rests
  return Math.min(0.6, Math.max(0, p));
};

// where a spot is today — fixed spots are where they are; rare ones only if the day dealt them
export const dealt = (s: GameState, sp: Spot): string | undefined => {
  const places = [sp.at].flat();
  if (!rare(sp)) return places[0];
  if (seed(`${s.time.dayId}:spot:${sp.id}`) >= odds(s, sp)) return undefined;
  return places[
    Math.floor(seed(`${s.time.dayId}:where:${sp.id}`) * places.length)
  ];
};
