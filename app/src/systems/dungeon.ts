import { Dungeon, RANKS } from "../data/land";
import type { GameState } from "../state/types";
import { Monster } from "../data/monsters";
import { City } from "../data/cities";
import { Npc } from "../data/locations";

export const surveyed = (s: GameState, d: Dungeon) =>
  !!d.manager || s.world.surveys.includes(d.id);

export const seen = (s: GameState, d: Dungeon, room: string) =>
  s.done.includes(`seen:${d.id}:${room}`);

export function admission(s: GameState, d: Dungeon): string | null {
  const quiet = s.done.find((f) => f.startsWith(`dormant:${d.id}:`));
  const until = quiet ? Number(quiet.split(":")[2]) : 0;
  if (until > s.time.dayId) return `Nothing stirs. Quiet until day ${until}.`;
  if (!d.manager) return null;
  if (s.player.rank < 1) return "Adventurer's license required.";
  if (s.player.rank < d.posting.rank)
    return `Rank ${RANKS[d.posting.rank]} required.`;
  if (d.manager.fee && s.bag.gold < d.manager.fee)
    return `${d.manager.fee} gold at the gate.`;
  return null;
}

export function findable(d: Dungeon) {
  const drops = new Set<string>(),
    loot = new Set<string>();
  for (const m of d.posting.monsters)
    for (const x of Monster.get(m).drops) drops.add(x.item);
  for (const r of Object.values(d.rooms))
    for (const l of r.loot ?? []) loot.add(l.id);
  return {
    environment: d.posting.materials,
    drops: [...drops],
    loot: [...loot],
  };
}

export const ownerName = (d: Dungeon) =>
  !d.manager
    ? "unclaimed"
    : d.manager.kind === "private"
    ? Npc.get(d.manager.owner).name
    : City.get(d.manager.owner).name;
