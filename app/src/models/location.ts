import { type GameState } from "../state/types";
import type { Requirement } from "./quest";
import { HOP } from "../systems/time";
import { type Craft } from "./item";
import { register } from "./registry";

export interface Exit {
  to: string;
  hours?: number; // omit for a street hop (HOP)
}
export interface Hours {
  open: number;
  close: number;
} // 24h clock

export interface Loadout {
  id: string;
  name: string;
  blurb: string;
  items: { id: string; qty?: number }[];
}

export interface Shop {
  name?: string; // the pointer's label — "The brass window"
  stock: string[];
  cut: number;
  ranked?: Record<number, string[]>;
}

export interface Action {
  id: string;
  label: string;
  text: string;
  quest?: string;
  stat?: { name: string; reqLvl: number };
  hours?: number;
  gold?: number;
  fight?: string[]; // monster ids: this pointer starts a battle; the rest of the action fires on a win
  effect?: (s: GameState) => GameState;
  requires?: Requirement; // general gate; `quest` stays for the "while this quest is taken" case
  oath?: string; // swearing to a master — swapping while sworn asks first
  repeat?: boolean; // doesn't spend act:<id> — can be done again
}

export type Placed = Action & { at: string }; // a pointer declared by a quest or npc, placed in a scene

export interface After {
  when: string;
  describe: string;
} // once `when` is in done, the place reads like this

export interface Upgrade {
  id: string; // sets built:${id}
  name: string;
  opens: string; // the system it unlocks — shown on the pointer
  gold?: number;
  items?: { id: string; qty: number }[];
  after?: string; // rung it builds on
  hours?: number;
  text: string;
}

export interface Board {
  onLocked?: (s: GameState) => { say: string; next?: GameState };
}

export interface Shift {
  at: string; // where
  open: number;
  close: number; // 24h clock
  days?: number[]; // weekdays (0 = the first day of the week); absent = every day
}

export interface NpcOpts {
  offers?: string[];
  sells?: string[];
  lends?: Loadout[];
  home?: { location: string; when: string };
  hours?: Hours; // when they're at their post; undefined = always
  actions?: Placed[];
}

export class Location {
  static registry = new Map<string, Location>();
  static get(id: string): Location {
    const l = Location.registry.get(id);
    if (!l) throw new Error(`unknown location: ${id}`);
    return l;
  }
  id: string;
  name: string;
  describe: string;
  exits: Required<Exit>[];
  npcs: string[];
  hours?: Hours; // undefined = always open
  requires?: string; // quest item that opens it — the door declares its want
  canRest: boolean;
  shop?: Shop;
  actions: Action[];
  after: After[];
  deed?: string;
  upgrades: Upgrade[];
  bench?: { craft: Craft; label: string };
  notices: ((s: GameState) => string | null)[];
  board?: Board;
  roam?: {
    monsters: string[];
    when: "day" | "night";
    chance: number;
    text: string;
  };
  constructor(
    id: string,
    name: string,
    describe: string,
    exits: Exit[],

    opts: {
      npcs?: string[];
      hours?: Hours;
      requires?: string;
      canRest?: boolean;
      shop?: Shop;
      actions?: Action[];
      after?: After[];
      deed?: string;
      upgrades?: Upgrade[];
      notices?: ((s: GameState) => string | null)[];
      board?: Board;
      bench?: { craft: Craft; label: string }; // somewhere to make things — the pointer opens the craft panel
      roam?: {
        monsters: string[];
        when: "day" | "night";
        chance: number;
        text: string;
      };
    } = {}
  ) {
    this.id = id;
    this.name = name;
    this.describe = describe;
    this.exits = exits.map((e) => ({ to: e.to, hours: e.hours || HOP }));
    this.npcs = opts.npcs ?? [];
    this.hours = opts.hours;
    this.requires = opts.requires;
    this.canRest = opts.canRest ?? false;
    this.shop = opts.shop;
    this.actions = opts.actions ?? [];
    this.after = opts.after ?? [];
    this.deed = opts.deed;
    this.upgrades = opts.upgrades ?? [];
    this.notices = opts.notices ?? [];
    this.board = opts.board;
    this.roam = opts.roam;
    this.bench = opts.bench;
    register(Location.registry, "location", id, this);
  }
}

export class Npc {
  static registry = new Map<string, Npc>();
  static get(id: string): Npc {
    const n = Npc.registry.get(id);
    if (!n) throw new Error(`unknown npc: ${id}`);
    return n;
  }
  id: string;
  name: string;
  line: string;
  offers?: string[];
  sells?: string[];
  lends?: Loadout[];
  actions: Placed[];
  home?: { location: string; when: string };
  hours?: Hours;
  constructor(id: string, name: string, line: string, opts: NpcOpts = {}) {
    this.id = id;
    this.name = name;
    this.line = line;
    this.offers = opts.offers;
    this.sells = opts.sells;
    this.lends = opts.lends;
    this.home = opts.home;
    this.hours = opts.hours;
    this.actions = opts.actions ?? [];
    Npc.registry.set(id, this);
  }
}
