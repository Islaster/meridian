import { Quest, type Condition, type QuestKind } from "@/data/quests";
import { Location, Npc } from "@/data/world/locations";
import { Item } from "@/data/items";
import type { GameState, QuestProgress } from "@/state/types";
import { giveItem, takeItem, hasItem } from "./inventory";
import { gainXp } from "./progression";
import { whereIs } from "./presence";
import { notify } from "./notices";
import { meets } from "./requirements";
import { ledger } from "./ledger";
import { add } from "@/lib/flags";

// What a quest's journey looks like: offered (by someone, or by itself) → taken → complete.
// `progress` is the engine: after anything happens, every taken quest whose condition
// now holds completes, and what that opens is offered in turn.

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

// does the condition hold — on its own, or because of what just happened
const met = (c: Condition, e: Event | null, s: GameState): boolean => {
  switch (c.kind) {
    case "have":
      return hasItem(s.bag, c.item);
    case "armed":
      return !!s.player.equipment.weapon;
    case "flag":
      return s.done.includes(c.flag);
    case "visit":
      return e?.kind === "visit" && e.location === c.location;
    case "talk":
      return e?.kind === "talk" && e.npc === c.npc;
    case "clear":
      return e?.kind === "clear" && e.dungeon === c.dungeon;
  }
};

const set = (s: GameState, id: string, p: QuestProgress): GameState => ({
  ...s,
  quests: { ...s.quests, [id]: p },
});
const taken = (s: GameState) =>
  Object.entries(s.quests).filter(([, p]) => p.status === "taken");

// Nothing tracked → track something: a main quest first, else the first taken.
const autoTrack = (s: GameState): GameState => {
  if (Object.values(s.quests).some((p) => p.tracked)) return s;
  const pick =
    taken(s).find(([id]) => Quest.get(id).kind === "main") ?? taken(s)[0];
  return pick ? set(s, pick[0], { ...pick[1], tracked: true }) : s;
};
// only this one followed
const focus = (s: GameState, id: string): GameState => ({
  ...s,
  quests: Object.fromEntries(
    Object.entries(s.quests).map(([k, p]) => [k, { ...p, tracked: k === id }])
  ),
});

// Offer a quest if it can be seen: main quests are taken on sight, the rest wait in the journal.
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
// follow this one — or stop following it
export const track = (s: GameState, id: string): GameState =>
  autoTrack(focus(s, s.quests[id]?.tracked ? "" : id));

function complete(s: GameState, id: string): GameState {
  const q = Quest.get(id);
  let bag = s.bag;
  for (const it of q.take) bag = takeItem(bag, it);
  for (const it of [...q.give, ...(q.reward.items ?? [])])
    bag = giveItem(bag, it);
  bag = { ...bag, gold: bag.gold + (q.reward.gold ?? 0) };
  let next = set(
    {
      ...s,
      bag,
      player: gainXp(s.player, q.reward.xp ?? 0),
      done: add(s.done, ...q.set),
    },
    id,
    { status: "complete", tracked: false, day: s.time.dayId }
  );
  if (q.onComplete) next = q.onComplete(next);
  // the line continues whether or not you were watching it; the ✦ follows only if it was on this one
  const inherit = s.quests[id].tracked;
  let passed = false;
  for (const n of q.next) {
    next = accept(offer(next, n), n);
    if (inherit && !passed && next.quests[n]?.status === "taken") {
      next = focus(next, n);
      passed = true;
    }
  }
  return notify(
    autoTrack(next),
    ...q.take.map((it) => `《Handed over》 ${Item.get(it).name}`)
  );
}

// The engine. Runs after every action, talk, visit and win; chains re-check on a null event.
export function progress(s: GameState, e: Event | null): GameState {
  let next = s;
  for (const [id] of taken(s))
    if (met(Quest.get(id).complete, e, next)) next = complete(next, id);
  next = ledger(next); // a Phantasm's trigger met opens its line
  for (const q of Quest.all())
    if (q.via === "ledger" && !next.quests[q.id])
      next = accept(offer(next, q.id), q.id); // what the Ledger hands out, it hands out itself
  return next === s ? s : progress(next, null);
}

// An NPC hands out whatever they carry that the player qualifies to see.
export function dispense(s: GameState, npcId: string): GameState {
  let next = s;
  for (const id of Npc.get(npcId).offers) next = offer(next, id);
  return next;
}

// who offered it, and where they are — the journal's line under an offered quest
export const whereOffered = (s: GameState, id: string): string => {
  const npc = Npc.find((n) => n.offers.includes(id));
  if (npc) {
    const at = whereIs(s, npc.id);
    return at ? `${npc.name}, ${Location.get(at).name}` : npc.name;
  }
  const kind = Quest.get(id).kind;
  const hall = Location.find((l) => !!l.board);
  return (kind === "bounty" || kind === "mission") && hall
    ? `the board, ${hall.name}`
    : "";
};
