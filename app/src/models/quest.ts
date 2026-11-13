import type { GameState } from "@/state/types";
import type { Placed } from "./location";
import type { Craft } from "./item";
import { Registry, Entity } from "@/lib/registry";

export type QuestKind = "main" | "side" | "bounty" | "mission";
// what finishes a quest
export type Condition =
  | { kind: "have"; item: string }
  | { kind: "visit"; location: string }
  | { kind: "talk"; npc: string }
  | { kind: "clear"; dungeon: string }
  | { kind: "flag"; flag: string }
  | { kind: "armed" };
// where the ✦ points while a quest is followed
export type Target =
  | { npc: string } // wherever they are right now
  | { place: string }
  | { dungeon: string } // done once cleared:<id> is set
  | { action: string } // done once act:<id> is set
  | { board: string } // the posting — done once it's taken
  | { quest: string } // leads wherever that quest leads — done once it's taken
  | { any: Target[] }; // fan out: all of them, until one is done

// A gate, readable: the first thing not met is the reason a pointer greys.
export interface Requirement {
  complete?: string[]; // quests
  items?: string[];
  day?: { from?: number; until?: number };
  hour?: { from?: number; until?: number };
  flags?: string[];
  not?: string[]; // flags that close it
  rank?: number; // license rank
  standing?: Record<string, number>; // faction → minimum
  stats?: Record<string, number>;
  level?: number;
  proved?: string; // an npc id — you've passed their trial (the rarer road)
  counters?: Record<string, number>; // counter → minimum (nights slept straight, kills, days…)
  craft?: Craft;
}
export interface Reward {
  xp?: number;
  gold?: number;
  items?: string[];
}
interface QuestOpts {
  chain?: string; // the line it belongs to — the journal shows this name over the quest's
  narration?: string; // said when it completes
  epilogue?: string; // the card after, when there's a reward worth one
  give?: string[]; // items handed over on completion
  take?: string[]; // items taken on completion
  reward?: Reward;
  set?: string[]; // flags written on completion
  next?: string | string[]; // what it opens
  onComplete?: (s: GameState) => GameState;
  visible?: Requirement; // when it can be offered at all
  acceptable?: Requirement; // when an offered quest can be taken
  track?: Target[]; // where the ✦ goes; absent = read off `complete`
  repeat?: number; // a posting: days until it's up again
  via?: string; // who hands it out when no npc does: "ledger"
  actions?: Placed[]; // pointers this quest puts in the world while it's taken
}

export class Quest extends Entity {
  static registry = new Registry<Quest>("quest");
  id: string;
  kind: QuestKind;
  name: string;
  objective: string;
  complete: Condition;
  chain?: string;
  narration?: string;
  epilogue?: string;
  give: string[];
  take: string[];
  reward: Reward;
  set: string[];
  next: string[];
  onComplete?: (s: GameState) => GameState;
  visible?: Requirement;
  acceptable?: Requirement;
  track?: Target[];
  repeat?: number;
  via?: string;
  actions: Placed[];
  constructor(
    id: string,
    kind: QuestKind,
    name: string,
    objective: string,
    complete: Condition,
    o: QuestOpts = {}
  ) {
    super();
    if (complete.kind === "flag" && /\s/.test(complete.flag))
      throw new Error(`${id}: flag "${complete.flag}" has whitespace`);
    this.id = id;
    this.kind = kind;
    this.name = name;
    this.objective = objective;
    this.complete = complete;
    this.chain = o.chain;
    this.narration = o.narration;
    this.epilogue = o.epilogue;
    this.give = o.give ?? [];
    this.take = o.take ?? [];
    this.reward = o.reward ?? {};
    this.set = o.set ?? [];
    this.next = [o.next ?? []].flat();
    this.onComplete = o.onComplete;
    this.visible = o.visible;
    this.acceptable = o.acceptable;
    this.track = o.track;
    this.repeat = o.repeat;
    this.via = o.via;
    this.actions = (o.actions ?? []).map((a) => ({ quest: this.id, ...a }));
    Quest.registry.add(this);
  }
}
