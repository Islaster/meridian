export type QuestKind = "main" | "side" | "bounty";

export type Condition =
  | { kind: "have"; item: string }
  | { kind: "visit"; location: string }
  | { kind: "talk"; npc: string }
  | { kind: "clear"; dungeon: string }
  | { kind: "armed" };

export interface Stage {
  complete: Condition;
  give?: string[];
  take?: string[];
  narration?: string;
  unlock?: string[];
  objective: string;
}

export interface Reward {
  xp?: number;
  gold?: number;
  items?: string[];
}

interface QuestOpts {
  reward?: Reward;
  next?: string;
  epilogue?: string;
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
  stages: Stage[];
  reward: Reward;
  next?: string;
  epilogue?: string;

  constructor(
    id: string,
    kind: QuestKind,
    name: string,
    stages: Stage[],
    opts: QuestOpts = {}
  ) {
    this.id = id;
    this.kind = kind;
    this.name = name;
    this.stages = stages;
    this.reward = opts.reward ?? {};
    this.next = opts.next;
    this.epilogue = opts.epilogue;
    Quest.registry.set(id, this);
  }
}
