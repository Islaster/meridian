import type { GameState } from "@/state/types";
import { Location } from "@/data/world/locations";
import { Dungeon } from "@/data/world/land";
import { isOpen } from "./time";
import { hasItem } from "./inventory";
import { admission } from "./dungeon";

// What's shut: why a place won't take you right now.

// why you can't walk into a place right now, or null
export function blocked(s: GameState, id: string): string | null {
  if (Dungeon.registry.has(id)) return admission(s, Dungeon.get(id));
  const l = Location.get(id);
  if (!isOpen(l.hours, s.time)) return `closed until ${l.hours!.open}:00`;
  if (l.requires && !hasItem(s.bag, l.requires)) return "the door wants a key";
  return null;
}
