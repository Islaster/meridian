import {
  Quest,
  type QuestKind,
  type Target,
  type Condition,
} from "@/data/quests";
import { Location, Npc } from "@/data/world/locations";
import type { GameState } from "@/state/types";
import { whereIs } from "./presence";
import { placeOf } from "./actions";
import { meets } from "./requirements";

// The marks on the scene: which exit, person, pointer or board the followed quest
// leads through from here, and who here has work to hand out.
export interface Signals {
  exits: Record<string, Set<QuestKind>>;
  npcs: Record<string, Set<QuestKind>>;
  actions: Record<string, Set<QuestKind>>;
  board: Set<QuestKind>;
  available: Set<string>; // npcs with a quest to offer (solid ?)
  pending: Set<string>; // npcs whose offer waits in the journal (hollow ?)
}

// the next street toward a place — breadth-first over the exits
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

// most quests never write `track`: the trail is read off the finish condition
const derived = (c: Condition): Target[] => {
  switch (c.kind) {
    case "talk":
      return [{ npc: c.npc }];
    case "visit":
      return [{ place: c.location }];
    case "clear":
      return [{ dungeon: c.dungeon }];
    case "flag":
      return c.flag.startsWith("act:")
        ? [{ action: c.flag.slice(4) }]
        : c.flag.startsWith("cleared:")
        ? [{ dungeon: c.flag.slice(8) }]
        : [];
    default:
      return [];
  }
};

export function signals(s: GameState): Signals {
  const out: Signals = {
    exits: {},
    npcs: {},
    actions: {},
    board: new Set(),
    available: new Set(),
    pending: new Set(),
  };
  const here = s.world.area;
  const mark = (
    rec: Record<string, Set<QuestKind>>,
    key: string,
    k: QuestKind
  ) => (rec[key] ??= new Set()).add(k);
  // mark the way toward a place; if it's here, mark the thing itself
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
    if ("npc" in t) return point(whereIs(s, t.npc), k, [out.npcs, t.npc]);
    if ("place" in t) return point(t.place, k);
    if ("dungeon" in t) return point(t.dungeon, k);
    if ("action" in t)
      return point(placeOf(s, t.action), k, [out.actions, t.action]);
    if ("board" in t) {
      const hall = Location.find((l) => !!l.board)?.id;
      if (hall === here) out.board.add(k);
      else point(hall, k);
      return;
    }
    if ("quest" in t) {
      if (!Quest.registry.has(t.quest)) return;
      const q = Quest.get(t.quest);
      if (s.quests[t.quest]?.status === "complete") {
        const on = q.next.find((n) => s.quests[n]?.status === "taken");
        if (on) follow({ quest: on }, k); // a finished link hands the ✦ down its chain
        return;
      }
      const next = current(q);
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

  for (const n of Npc.all()) {
    if (whereIs(s, n.id) !== here) continue;
    if (n.offers.some((id) => !s.quests[id] && meets(s, Quest.get(id).visible)))
      out.available.add(n.id);
    else if (n.offers.some((id) => s.quests[id]?.status === "notTaken"))
      out.pending.add(n.id);
  }
  return out;
}
