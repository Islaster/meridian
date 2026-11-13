import { Registry, Entity } from "@/lib/registry";

// A condition: something on the player that changes them for a while — a debuff like weary,
// later a buff from a draught. Every condition is declared in data/conditions.ts, the one
// place, so each can carry its own words (and, later, its icon). What's on the player is an
// Active: the condition's id plus the numbers that instance was dealt.
export interface Active {
  id: string;
  stat?: string; // the stat it touches, if one
  amount?: number; // by how much
}
export type Kind = "buff" | "debuff";
interface ConditionOpts {
  describe: string; // what it does — the tooltip
  ends: string; // how it lifts
  stats?: (a: Active) => Record<string, number>; // stat changes while it's on: { lck: -5 }
  icon?: string; // later
}
export class Condition extends Entity {
  static registry = new Registry<Condition>("condition");
  id: string;
  name: string;
  kind: Kind;
  describe: string;
  ends: string;
  stats: (a: Active) => Record<string, number>;
  icon?: string;
  constructor(id: string, name: string, kind: Kind, opts: ConditionOpts) {
    super();
    this.id = id;
    this.name = name;
    this.kind = kind;
    this.describe = opts.describe;
    this.ends = opts.ends;
    this.stats = opts.stats ?? (() => ({}));
    this.icon = opts.icon;
    Condition.registry.add(this);
  }
}
