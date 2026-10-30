import {
  Quest,
  type Condition,
  type QuestKind,
  type Requirement,
  type Target,
} from "../data/quests";
import { Location, Npc } from "../data/locations";
import { Item } from "../data/items";
import type { GameState } from "../state/types";
import type { Note } from "./types";
import { giveItem, takeItem, hasItem } from "./inventory";
import { levelUp } from "./progression";
import { whereIs, locationOfNpc } from "./presence";
import { RANKS } from "../data/land";
import { notify } from "./notices";
import { placed } from "./actions";
import { SPOTS } from "../data/gather";

export type Event =
  | { kind: "visit"; location: string }
  | { kind: "talk"; npc: string }
  | { kind: "clear"; dungeon: string }
  | { kind: "flag"; flag: string };

export const GLYPH: Record<QuestKind, string> = {
  main: "✦",
  side: "◇",
  bounty: "⚔",
  mission: "⚑",
};

export const marks = (set?: Set<QuestKind>) =>
  set?.size ? " " + [...set].map((k) => GLYPH[k]).join(" ") : "";

const names = (ids?: string[]) =>
  (ids ?? []).map((id) => Item.get(id).name).join(", ");

const met = (c: Condition, e: Event | null, s: GameState): boolean =>
  c.kind === "have"
    ? hasItem(s.bag, c.item)
    : c.kind === "armed"
    ? !!s.player.equipment?.mainWeapon
    : c.kind === "flag"
    ? s.done.includes(c.flag)
    : c.kind === "visit"
    ? e?.kind === "visit" && e.location === c.location
    : c.kind === "talk"
    ? e?.kind === "talk" && e.npc === c.npc
    : e?.kind === "clear" && e.dungeon === c.dungeon;
// The first unmet requirement, as a readable line; null when everything holds.
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
  for (const [k, n] of Object.entries(r.stats ?? {}))
    if ((s.player.stats[k] ?? 0) < n) return `Needs ${k.toUpperCase()} ${n}.`;
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

const set = (
  s: GameState,
  id: string,
  p: GameState["quests"][string]
): GameState => ({ ...s, quests: { ...s.quests, [id]: p } });

// Nothing tracked → track something: a main quest first, else the first taken.
const autoTrack = (s: GameState): GameState => {
  if (Object.values(s.quests).some((p) => p.tracked)) return s;
  const taken = Object.entries(s.quests).filter(
    ([, p]) => p.status === "taken"
  );
  const pick = taken.find(([id]) => Quest.get(id).kind === "main") ?? taken[0];
  return pick ? set(s, pick[0], { ...pick[1], tracked: true }) : s;
};

export const offer = (s: GameState, id: string): GameState => {
  const q = Quest.get(id),
    p = s.quests[id];
  const again =
    p?.status === "complete" &&
    !!q.repeat &&
    (p.day ?? 0) + q.repeat <= s.time.dayId;
  if ((p && !again) || !meets(s, q.visible)) return s;
  return q.kind === "main"
    ? autoTrack(set(s, id, { status: "taken", tracked: false }))
    : set(s, id, { status: "notTaken", tracked: false });
};

export const accept = (s: GameState, id: string): GameState =>
  s.quests[id]?.status !== "notTaken" || !meets(s, Quest.get(id).acceptable)
    ? s
    : autoTrack(set(s, id, { status: "taken", tracked: false }));

export const deny = (s: GameState): GameState => s; // postponed, not refused — it stays in the journal
export const track = (s: GameState, id: string): GameState =>
  autoTrack({
    ...s,
    quests: Object.fromEntries(
      Object.entries(s.quests).map(([k, p]) => [
        k,
        { ...p, tracked: k === id ? !p.tracked : false },
      ])
    ),
  });
const focus = (s: GameState, id: string): GameState => ({
  ...s,
  quests: Object.fromEntries(
    Object.entries(s.quests).map(([k, p]) => [k, { ...p, tracked: k === id }])
  ),
});

export function complete(s: GameState, id: string): GameState {
  const q = Quest.get(id);
  let bag = s.bag,
    player = s.player;
  for (const it of q.take ?? []) bag = takeItem(bag, it);
  const handed = (q.take ?? []).map(
    (id) => `《Handed over》 ${Item.get(id).name}`
  );
  for (const it of q.give ?? []) bag = giveItem(bag, it);
  for (const it of q.reward.items ?? []) bag = giveItem(bag, it);
  bag = { ...bag, gold: bag.gold + (q.reward.gold ?? 0) };
  player = levelUp({ ...player, xp: player.xp + (q.reward.xp ?? 0) });
  let next = set(
    { ...s, bag, player, done: [...s.done, ...(q.set ?? [])] },
    id,
    {
      status: "complete",
      tracked: false,
      day: s.time.dayId,
    }
  );
  if (q.onComplete) next = q.onComplete(next);
  const inherit = s.quests[id].tracked;
  let passed = false;
  for (const n of [q.next ?? []].flat()) {
    next = offer(next, n);
    if (!next.quests[n]) continue; // not visible yet — it'll be offered when it is
    next = accept(next, n); // the line continues whether or not you were watching it
    if (inherit && !passed && next.quests[n].status === "taken") {
      next = focus(next, n); // the ✦ follows only if it was on this line
      passed = true;
    }
  }
  return notify(autoTrack(next), ...handed);
}

// The engine: every taken quest whose condition the event satisfies completes. Chains that auto-accept re-check on a null event.
export function progress(s: GameState, e: Event | null): GameState {
  let next = s;
  for (const [id, p] of Object.entries(s.quests))
    if (p.status === "taken" && met(Quest.get(id).complete, e, next))
      next = complete(next, id);
  return next === s ? s : progress(next, null);
}

// An NPC hands out whatever they carry that the player qualifies to see.
export function dispense(s: GameState, npcId: string): GameState {
  let next = s;
  for (const id of Npc.get(npcId).offers ?? []) next = offer(next, id);
  return next;
}

function nextHop(from: string, to: string): string | undefined {
  const prev = new Map<string, string>(),
    seen = new Set([from]),
    queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
    if (!Location.registry.has(cur)) continue;
    for (const ex of Location.get(cur).exits) {
      if (seen.has(ex.to)) continue;
      seen.add(ex.to);
      prev.set(ex.to, cur);
      if (ex.to === to) {
        let hop = to;
        while (prev.get(hop) !== from) hop = prev.get(hop)!;
        return hop;
      }
      queue.push(ex.to);
    }
  }
}
const actionAt = (id: string) =>
  id.startsWith("roam-") && Location.registry.has(id.slice(5))
    ? id.slice(5)
    : placed().find((a) => a.id === id)?.at ??
      SPOTS.find((sp) => sp.id === id)?.at ??
      [...Location.registry.values()].find((l) =>
        l.actions.some((a) => a.id === id)
      )?.id;

const boardLocation = () =>
  [...Location.registry.values()].find((l) => l.board)?.id;

// most quests never write `track`: the trail is read off the finish condition
const derived = (c: Condition): Target[] =>
  c.kind === "talk"
    ? [{ npc: c.npc }]
    : c.kind === "visit"
    ? [{ place: c.location }]
    : c.kind === "clear"
    ? [{ dungeon: c.dungeon }]
    : c.kind === "flag" && c.flag.startsWith("act:")
    ? [{ action: c.flag.slice(4) }]
    : c.kind === "flag" && c.flag.startsWith("cleared:")
    ? [{ dungeon: c.flag.slice(8) }]
    : [];

export interface Signals {
  exits: Record<string, Set<QuestKind>>;
  npcs: Record<string, Set<QuestKind>>;
  actions: Record<string, Set<QuestKind>>;
  board: Set<QuestKind>;
  available: Set<string>;
  pending: Set<string>;
}

export function signals(s: GameState): Signals {
  const out: Signals = {
    exits: {},
    npcs: {},
    actions: {},
    board: new Set(),
    available: new Set(),
    pending: new Set(),
  };
  const mark = (
    rec: Record<string, Set<QuestKind>>,
    key: string,
    k: QuestKind
  ) => (rec[key] ??= new Set()).add(k);
  const here = s.world.area;

  const point = (
    target: string | undefined,
    k: QuestKind,
    on?: [Record<string, Set<QuestKind>>, string]
  ) => {
    if (!target) return;
    if (target === here) {
      if (on) mark(on[0], on[1], k);
      return;
    }
    const hop = nextHop(here, target);
    if (hop) mark(out.exits, hop, k);
  };

  const finished = (t: Target): boolean =>
    "dungeon" in t
      ? s.done.includes(`cleared:${t.dungeon}`)
      : "action" in t
      ? s.done.includes(`act:${t.action}`)
      : "board" in t
      ? ["taken", "complete"].includes(s.quests[t.board]?.status ?? "")
      : "quest" in t
      ? s.quests[t.quest]?.status === "complete"
      : "any" in t
      ? t.any.some(finished)
      : false; // npc / place: the end of a trail, never finished on its own

  const current = (q: Quest): Target | undefined =>
    (q.track ?? derived(q.complete)).find((t) => !finished(t));

  // walk a target down to a place and a pointer, marking as it goes
  const follow = (t: Target, k: QuestKind): void => {
    if ("npc" in t)
      return point(whereIs(s, t.npc) ?? locationOfNpc(t.npc), k, [
        out.npcs,
        t.npc,
      ]);
    if ("place" in t) return point(t.place, k);
    if ("dungeon" in t) return point(t.dungeon, k);
    if ("action" in t)
      return point(actionAt(t.action), k, [out.actions, t.action]);
    if ("board" in t) {
      const hall = boardLocation();
      if (hall === here) out.board.add(k);
      else point(hall, k);
      return;
    }
    if ("quest" in t) {
      const next = current(Quest.get(t.quest));
      if (next) follow(next, k);
      return;
    }
    const started = t.any.filter(
      (x) => "quest" in x && s.quests[x.quest]?.status === "taken"
    );
    for (const x of started.length ? started : t.any) follow(x, k);
  };

  const tracked = Object.entries(s.quests).find(
    ([, p]) => p.tracked && p.status === "taken"
  );
  if (tracked) {
    const q = Quest.get(tracked[0]);
    const t = current(q);
    if (t) follow(t, q.kind);
  }

  // ? — someone here has a quest to hand out · hollow ? — they did, and it's waiting in the journal
  for (const n of Npc.registry.values()) {
    if (whereIs(s, n.id) !== here) continue;
    const offers = n.offers ?? [];
    if (offers.some((id) => !s.quests[id] && meets(s, Quest.get(id).visible)))
      out.available.add(n.id);
    else if (offers.some((id) => s.quests[id]?.status === "notTaken"))
      out.pending.add(n.id);
  }
  return out;
}

export function narrate(before: GameState, after: GameState): Note[] {
  const out: Note[] = [];
  for (const [id, a] of Object.entries(after.quests)) {
    const b = before.quests[id],
      q = Quest.get(id);
    if (!b && a.status === "notTaken")
      out.push({
        kind: "reward",
        text: `${GLYPH[q.kind]} ${q.name} — offered.`,
      });
    else if (b?.status !== "taken" && a.status === "taken")
      out.push({
        kind: "reward",
        text: `${GLYPH[q.kind]} ${q.name}. ${q.objective}`,
      });
    else if (b?.status === "taken" && a.status === "complete") {
      const got = names(q.give);
      if (got) out.push({ kind: "reward", text: `Received: ${got}.` });
      if (q.narration) out.push({ kind: "story", text: q.narration });
      if (q.epilogue || q.reward.xp || q.reward.gold || q.reward.items?.length)
        out.push({
          kind: "complete",
          id,
          text: `${GLYPH[q.kind]} ${q.name} complete.`,
        });
      else
        out.push({
          kind: "reward",
          text: `${GLYPH[q.kind]} ${q.name} — done.`,
        });
    }
  }
  if (after.player.level > before.player.level)
    out.push({
      kind: "levelup",
      level: after.player.level,
      text: `Level ${after.player.level}.`,
    });
  return out;
}

export const sourceOf = (
  id: string
): { npc?: string; location?: string } | null => {
  const npc = [...Npc.registry.values()].find((n) => n.offers?.includes(id));
  if (npc) return { npc: npc.id };
  const kind = Quest.get(id).kind;
  if (kind === "bounty" || kind === "mission") {
    const hall = [...Location.registry.values()].find((l) => l.board);
    return hall ? { location: hall.id } : null;
  }
  return null;
};
export const sourceLocation = (s: GameState, id: string) => {
  const src = sourceOf(id);
  return src?.npc
    ? whereIs(s, src.npc) ?? locationOfNpc(src.npc)
    : src?.location;
};
export const whereOffered = (s: GameState, id: string) => {
  const src = sourceOf(id),
    at = sourceLocation(s, id);
  if (!src || !at) return "";
  const name = Location.get(at).name;
  return src.npc ? `${Npc.get(src.npc).name}, ${name}` : `the board, ${name}`;
};
