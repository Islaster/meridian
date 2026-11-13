import { Dungeon, RANKS, type Room } from "@/data/world/land";
import { Monster } from "@/data/monsters";
import { City } from "@/data/world/cities";
import { Npc } from "@/data/world/locations";
import type { GameState } from "@/state/types";
import { giveItem } from "./inventory";
import { progress } from "./quests";
import { advance } from "./time";
import { add } from "@/lib/flags";
import type { Note } from "./narrate";
import type { Spoils } from "./combat";

// ── the gate ──────────────────────────────────────────────────────────────
export const surveyed = (s: GameState, d: Dungeon) =>
  !!d.manager || s.world.surveys.includes(d.id);

// why the gate won't take you, or null
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

// ── inside ────────────────────────────────────────────────────────────────
// daily room flags: room (fought), chest, trap, gather, stat — refresh() lifts them each morning, stat excepted below
const flag = (d: Dungeon, room: Room, k: string) => `${k}:${d.id}:${room.id}`;
export const roomDone = (s: GameState, d: Dungeon, room: Room, k: string) =>
  s.done.includes(flag(d, room, k));
export const here = (s: GameState, d: Dungeon) =>
  d.rooms[s.world.room ?? d.entrance];
export const hostile = (s: GameState, d: Dungeon, room: Room) =>
  (room.type === "combat" || room.type === "boss") &&
  !roomDone(s, d, room, "room");
export const packed = (s: GameState, d: Dungeon) =>
  d.kind === "dungeon" && (s.bag.items["camp-pack"] ?? 0) > 0; // beyond a gate a camp pack is a bed

// the dungeon's own hours, and the town's at the gate's tempo
const spend = (s: GameState, d: Dungeon, h: number): GameState => ({
  ...s,
  time: advance(s.time, h * d.tempo),
  world: { ...s.world, delve: (s.world.delve ?? 0) + h },
});

// the rooms you've stood in — for the map; a survey shows the rest
const seenFlag = (d: Dungeon, room: string) => `seen:${d.id}:${room}`;
export const seen = (s: GameState, d: Dungeon, room: string) =>
  s.done.includes(seenFlag(d, room));

export const enter = (s: GameState, d: Dungeon): GameState => ({
  ...s,
  world: { ...s.world, dungeon: d.id, room: d.entrance, delve: 0 },
  done: add(s.done, seenFlag(d, d.entrance)),
});
// the way out is a step like any other
export const leave = (s: GameState, d: Dungeon, to: string): GameState => {
  const out = spend(s, d, d.pace);
  return {
    ...out,
    world: {
      ...out.world,
      area: to,
      dungeon: undefined,
      room: undefined,
      delve: undefined,
    },
  };
};
// a step to the next room; a trap fires the first time through
export function step(
  s: GameState,
  d: Dungeon,
  to: string
): { state: GameState; notes: Note[] } {
  const room = d.rooms[to];
  let state = spend(
    {
      ...s,
      world: { ...s.world, room: to },
      done: add(s.done, seenFlag(d, to)),
    },
    d,
    d.pace
  );
  const notes: Note[] = [];
  if (room.type === "trap" && room.trap && !roomDone(state, d, room, "trap")) {
    const t = room.trap,
      ok = (state.player.stats[t.stat] ?? 0) >= t.dc;
    notes.push({ kind: "story", text: ok ? t.pass : t.fail });
    state = {
      ...state,
      done: add(state.done, flag(d, room, "trap")),
      player: ok
        ? state.player
        : { ...state.player, hp: Math.max(1, state.player.hp - t.damage) },
    };
  }
  return { state, notes };
}
export function openChest(s: GameState, d: Dungeon, room: Room): GameState {
  let bag = s.bag;
  for (const l of room.loot ?? []) bag = giveItem(bag, l.id, l.qty ?? 1);
  return { ...s, bag, done: add(s.done, flag(d, room, "chest")) };
}
export function harvest(s: GameState, d: Dungeon, room: Room): GameState {
  const h = room.harvest!;
  const out = spend(s, d, h.hours ?? 0);
  return {
    ...out,
    bag: giveItem(out.bag, h.id, h.qty ?? 1),
    done: add(out.done, flag(d, room, "gather")),
  };
}
// a stat room: once, ever — the flag is permanent (refresh() leaves `stat:` alone)
export const sit = (s: GameState, d: Dungeon, room: Room): GameState => ({
  ...s,
  player: { ...s.player, statPoints: s.player.statPoints + 1 },
  done: add(s.done, flag(d, room, "stat")),
});
// the room is won: spoils in, the room marked; a boss clears the place and a gate goes dormant
export function winRoom(
  s: GameState,
  d: Dungeon,
  room: Room,
  sp: Spoils
): GameState {
  let bag = { ...s.bag, gold: s.bag.gold + sp.gold };
  for (const id of sp.items) bag = giveItem(bag, id);
  let next: GameState = { ...s, bag, done: add(s.done, flag(d, room, "room")) };
  if (room.type !== "boss") return next;
  const flags = [`cleared:${d.id}`];
  if (d.kind === "dungeon")
    flags.push(`dormant:${d.id}:${s.time.dayId + d.dormancy}`);
  next = { ...next, done: add(next.done, ...flags) };
  return progress(next, { kind: "clear", dungeon: d.id });
}
