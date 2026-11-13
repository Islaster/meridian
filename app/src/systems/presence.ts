import { Location, Npc } from "@/data/world/locations";
import { isOpen } from "./time";
import { seed } from "@/lib/seed";
import type { GameState } from "@/state/types";

// Is this place's roam out today? Dealt by the day, so it's the same answer on every replay.
export const roaming = (s: GameState, loc: Location) =>
  !!loc.roam && seed(`${s.time.dayId}:roam:${loc.id}`) < loc.roam.chance;

// where an npc is posted — indexed once
let posts: Map<string, string> | null = null;
const postOf = (npc: string) => {
  if (!posts || posts.size === 0)
    posts = new Map(
      Location.all().flatMap((l) => l.npcs.map((n) => [n, l.id] as const))
    );
  return posts.get(npc);
};

// Where someone is: their week if they keep one, else their post while it's open, else home.
export function whereIs(s: GameState, id: string): string | undefined {
  const n = Npc.get(id);
  const shift = n.week.find(
    (w) =>
      (!w.days || w.days.includes(s.time.dayId % 7)) &&
      isOpen({ open: w.open, close: w.close }, s.time)
  );
  if (shift) return shift.at;
  const post = postOf(id);
  if (
    post &&
    isOpen(Location.get(post).hours, s.time) &&
    isOpen(n.hours, s.time)
  )
    return post;
  const home = n.home && (!n.home.when || s.done.includes(n.home.when));
  return home ? n.home!.location : undefined;
}

export const present = (s: GameState, loc: Location) =>
  Npc.all()
    .filter((n) => whereIs(s, n.id) === loc.id)
    .map((n) => n.id);
