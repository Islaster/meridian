import type { GameState } from "../state/types";
import { type Placed } from "./location";

export type QuestKind = "main" | "side" | "bounty" | "mission";
export type Condition =
  | { kind: "have"; item: string }
  | { kind: "visit"; location: string }
  | { kind: "talk"; npc: string }
  | { kind: "clear"; dungeon: string }
  | { kind: "flag"; flag: string }
  | { kind: "armed" };
export type Target =
  | { npc: string } // wherever they are right now
  | { place: string }
  | { dungeon: string } // done once cleared:<id> is set
  | { action: string } // done once act:<id> is set
  | { board: string } // the posting — done once it's taken
  | { quest: string } // leads wherever that quest leads — done once it's taken
  | { any: Target[] }; // fan out: all of them, until one is done

export interface Requirement {
  complete?: string[];
  items?: string[];
  day?: { from?: number; until?: number };
  hour?: { from?: number; until?: number };
  flags?: string[];
  rank?: number; // license rank
  standing?: Record<string, number>; // faction → minimum
  not?: string[];
  stats?: Record<string, number>;
}
export interface Reward {
  xp?: number;
  gold?: number;
  items?: string[];
}
interface QuestOpts {
  narration?: string;
  give?: string[];
  take?: string[];
  reward?: Reward;
  next?: string | string[];
  onComplete?: (s: GameState) => GameState;
  visible?: Requirement;
  acceptable?: Requirement;
  epilogue?: string;
  chain?: string;
  track?: Target[];
  set?: string[];
  repeat?: number;
  via?: string;
  actions?: Placed[];
}

export class Quest {
  static registry = new Map<string, Quest>();
  static get(id: string): Quest {
    const q = Quest.registry.get(id);
    if (!q) throw new Error(`unknown quest: ${id}`);
    return q;
  }
  id: string;
  kind: QuestKind;
  name: string;
  objective: string;
  complete: Condition;
  narration?: string;
  give?: string[];
  take?: string[];
  chain?: string;
  actions: Placed[];
  reward: Reward;
  next?: string | string[];
  visible?: Requirement;
  acceptable?: Requirement;
  epilogue?: string;
  set?: string[];
  track?: Target[];
  via?: string;
  repeat?: number;
  onComplete?: (s: GameState) => GameState;
  constructor(
    id: string,
    kind: QuestKind,
    name: string,
    objective: string,
    complete: Condition,
    o: QuestOpts = {}
  ) {
    if (complete.kind === "flag" && /\s/.test(complete.flag))
      throw new Error(`${id}: flag "${complete.flag}" has whitespace`);
    this.id = id;
    this.kind = kind;
    this.name = name;
    this.objective = objective;
    this.complete = complete;
    this.narration = o.narration;
    this.give = o.give ?? [];
    this.take = o.take;
    this.reward = o.reward ?? {};
    this.next = o.next;
    this.visible = o.visible;
    this.acceptable = o.acceptable;
    this.epilogue = o.epilogue;
    this.chain = o.chain;
    this.set = o.set;
    this.repeat = o.repeat;
    this.track = o.track;
    this.onComplete = o.onComplete;
    this.via = o.via;
    this.actions = o.actions ?? [];
    Quest.registry.set(id, this);
  }
}
