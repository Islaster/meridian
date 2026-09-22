import { Quest, type Condition, type QuestKind } from "../data/quests";
import { Location, Npc } from "../data/locations";
import type { GameState } from "../state/types";
import { giveItem, takeItem, hasItem } from "./inventory";
import { Item } from "../data/items";
import { type Note } from "./types";
import { levelUp } from "./progression";

const names = (ids?: string[]) =>
  (ids ?? []).map((id) => Item.get(id).name).join(", ");

export type Event =
  | { kind: "visit"; location: string }
  | { kind: "talk"; npc: string }
  | { kind: "clear"; dungeon: string };
export const GLYPH: Record<QuestKind, string> = {
  main: "✦",
  side: "◇",
  bounty: "⚔",
};

const met = (c: Condition, e: Event | null, s: GameState): boolean =>
  c.kind === "have"
    ? hasItem(s.bag, c.item)
    : c.kind === "armed"
    ? !!s.player.equipment?.mainWeapon
    : c.kind === "visit"
    ? e?.kind === "visit" && e.location === c.location
    : c.kind === "talk"
    ? e?.kind === "talk" && e.npc === c.npc
    : e?.kind === "clear" && e.dungeon === c.dungeon;

export const start = (s: GameState, id: string): GameState =>
  id in s.quests || s.done.includes(id)
    ? s
    : { ...s, quests: { ...s.quests, [id]: 0 } };

export function progress(s: GameState, e: Event | null): GameState {
  let next = s;
  for (const [id, idx] of Object.entries(s.quests)) {
    const q = Quest.get(id),
      st = q.stages[idx];
    if (!st || !met(st.complete, e, next)) continue;
    let bag = next.bag,
      player = next.player,
      done = next.done;
    const quests = { ...next.quests };
    for (const it of st.take ?? []) bag = takeItem(bag, it);
    for (const it of st.give ?? []) bag = giveItem(bag, it);
    if (idx + 1 >= q.stages.length) {
      delete quests[id];
      done = [...done, id];
      player = { ...player, xp: player.xp + (q.reward.xp ?? 0) };
      player = levelUp({ ...player, xp: player.xp + (q.reward.xp ?? 0) });

      bag = { ...bag, gold: bag.gold + (q.reward.gold ?? 0) };
      for (const it of q.reward.items ?? []) bag = giveItem(bag, it);
      if (q.next) quests[q.next] = 0;
    } else quests[id] = idx + 1;
    next = { ...next, bag, player, done, quests };
  }
  return next === s ? s : progress(next, null); // items just moved — re-check "have" stages
}

const locationOfNpc = (npc: string) =>
  [...Location.registry.values()].find((l) => l.npcs.includes(npc))?.id;

function nextHop(from: string, to: string): string | undefined {
  if (!Location.registry.has(to)) return;
  const prev = new Map<string, string>(),
    seen = new Set([from]),
    queue = [from];
  while (queue.length) {
    const cur = queue.shift()!;
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

export interface Signals {
  exits: Record<string, Set<QuestKind>>;
  npcs: Record<string, Set<QuestKind>>;
}

export function signals(s: GameState): Signals {
  const out: Signals = { exits: {}, npcs: {} };
  const mark = (
    rec: Record<string, Set<QuestKind>>,
    key: string,
    k: QuestKind
  ) => (rec[key] ??= new Set()).add(k);
  const here = s.world.area;
  const point = (target: string | undefined, k: QuestKind, npc?: string) => {
    if (!target) return;
    if (target === here) {
      if (npc) mark(out.npcs, npc, k);
      return;
    }
    const hop = nextHop(here, target);
    if (hop) mark(out.exits, hop, k);
  };
  for (const [id, idx] of Object.entries(s.quests)) {
    const q = Quest.get(id),
      c = q.stages[idx]?.complete;
    if (!c || c.kind === "have" || c.kind === "armed") continue;
    if (c.kind === "talk") point(locationOfNpc(c.npc), q.kind, c.npc);
    else point(c.kind === "visit" ? c.location : c.dungeon, q.kind);
  }
  for (const n of Npc.registry.values()) {
    if (!n.offers || n.offers in s.quests || s.done.includes(n.offers))
      continue;
    if (locationOfNpc(n.id) === here)
      mark(out.npcs, n.id, Quest.get(n.offers).kind);
  }

  return out;
}

export function narrate(before: GameState, after: GameState): Note[] {
  const out: Note[] = [];
  for (const [id, idx] of Object.entries(after.quests)) {
    const q = Quest.get(id),
      was = before.quests[id];
    if (was === undefined) {
      out.push({
        kind: "reward",
        text: `${GLYPH[q.kind]} ${q.name} begins. ${q.stages[0].objective}`,
      });
    } else if (idx > was) {
      const got = names(q.stages[was].give);
      if (got) out.push({ kind: "reward", text: `Received: ${got}.` });
      const n = q.stages[idx]?.narration;
      if (n) out.push({ kind: "story", text: n });
      const o = q.stages[idx]?.objective;
      if (o) out.push({ kind: "reward", text: `Next: ${o}` });
    }
  }
  for (const id of after.done) {
    if (before.done.includes(id) || !Quest.registry.has(id)) continue;
    const q = Quest.get(id),
      got = names(q.stages[q.stages.length - 1].give);
    if (got) out.push({ kind: "reward", text: `Received: ${got}.` });
    out.push({
      kind: "complete",
      id,
      text: `${GLYPH[q.kind]} ${q.name} complete.`,
    });
  }

  if (after.player.level > before.player.level)
    out.push({
      kind: "levelup",
      level: after.player.level,
      text: `Level ${after.player.level}.`,
    });

  return out;
}
