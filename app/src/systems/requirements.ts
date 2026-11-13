import { Quest, type Requirement } from "@/models/quest";
import { Npc } from "@/data/world/locations";
import { Item } from "@/data/items";
import { RANKS } from "@/data/world/land";
import { hasItem } from "./inventory";
import { canCraft } from "./craft";
import { effective } from "./conditions";
import type { GameState } from "@/state/types";

// The first unmet requirement, as a readable line; null when everything holds.
// Pointers grey with this line — the world's rules render as dead options with stated causes.
export function unmet(s: GameState, r?: Requirement): string | null {
  if (!r) return null;
  for (const id of r.complete ?? [])
    if (s.quests[id]?.status !== "complete")
      return `${Quest.get(id).name} isn't finished.`;
  for (const id of r.items ?? [])
    if (!hasItem(s.bag, id)) return `You don't have ${Item.get(id).name}.`;
  if (r.rank !== undefined && s.player.rank < r.rank)
    return s.player.rank < 1
      ? "Adventurer's license required."
      : `Rank ${RANKS[r.rank]} required.`;
  for (const [f, n] of Object.entries(r.standing ?? {}))
    if ((s.standing[f] ?? 0) < n) return "They don't know you well enough yet.";
  for (const f of r.flags ?? []) if (!s.done.includes(f)) return "Not yet.";
  for (const f of r.not ?? [])
    if (s.done.includes(f)) return "That door is closed.";
  // the road first, then what's asked on top of it
  if (r.level && s.player.level < r.level) return `Needs level ${r.level}.`;
  if (r.proved && !s.done.includes(`proved:${r.proved}`))
    return `Prove yourself to ${Npc.get(r.proved).name} first.`;
  const stats = effective(s.player);
  for (const [k, n] of Object.entries(r.stats ?? {}))
    if ((stats[k] ?? 0) < n) return `Needs ${k.toUpperCase()} ${n}.`;
  for (const [k, n] of Object.entries(r.counters ?? {}))
    if ((s.counters[k] ?? 0) < n) return "Not yet.";
  if (r.craft && !canCraft(s, r.craft)) return `Needs a ${r.craft}'s eye.`;
  if (r.day?.from !== undefined && s.time.dayId < r.day.from) return "Not yet.";
  if (r.day?.until !== undefined && s.time.dayId > r.day.until)
    return "Too late.";
  if (r.hour?.from !== undefined && s.time.hour < r.hour.from)
    return `Not before ${r.hour.from}:00.`;
  if (r.hour?.until !== undefined && s.time.hour > r.hour.until)
    return `Not after ${r.hour.until}:00.`;
  return null;
}

export const meets = (s: GameState, r?: Requirement) => unmet(s, r) === null;
