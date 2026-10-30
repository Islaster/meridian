import { notify } from "./notices";
import { SPOTS, spot, type Spot } from "../data/gather";
import type { Action } from "../models/location";
import { type GameState } from "../state/types";

const hash = (t: string) =>
  [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
const key = (s: GameState, sp: Spot) => `gather:${sp.id}:${s.time.dayId}`;
const skill = (sp: Spot) => `gather:${sp.kind}`;

export const richness = (s: GameState, sp: Spot) =>
  sp.rich[Math.abs(hash(sp.id) + s.time.dayId) % sp.rich.length];
export const left = (s: GameState, sp: Spot) =>
  sp.cap - (s.counters[key(s, sp)] ?? 0);

export const gather =
  (id: string) =>
  (s: GameState): GameState => {
    const sp = spot(id);
    if (s.done.some((f) => f.startsWith(`dormant:${sp.at}`)))
      return notify(s, "Nothing stirs. The ground's gone quiet.");
    if (left(s, sp) <= 0) return notify(s, "Worked out for today.");
    const p = s.player.proficiency[skill(sp)] ?? 0;
    const qty = richness(s, sp) + Math.floor(p / 5);
    const materials = s.bag.materials.some((m) => m.name === sp.material)
      ? s.bag.materials.map((m) =>
          m.name === sp.material ? { ...m, qty: m.qty + qty } : m
        )
      : [...s.bag.materials, { name: sp.material, qty }];
    return notify(
      {
        ...s,
        bag: { ...s.bag, materials },
        counters: {
          ...s.counters,
          [key(s, sp)]: (s.counters[key(s, sp)] ?? 0) + 1,
        },
        player: {
          ...s.player,
          proficiency: { ...s.player.proficiency, [skill(sp)]: p + 1 },
        },
      },
      `《Gathered》 ${qty} ${sp.material}`
    );
  };

export const spotActions = (place: string, s: GameState): Action[] =>
  SPOTS.filter((sp) => sp.at === place).map((sp) => ({
    id: sp.id,
    label: `${sp.label} · ${Math.max(0, left(s, sp))}h left`,
    text: sp.text,
    hours: 1,
    repeat: true,
    requires: sp.requires,
    effect: gather(sp.id),
  }));
