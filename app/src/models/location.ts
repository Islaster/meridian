import type { GameState } from "@/state/types";
import type { Requirement } from "./quest";
import type { Plan } from "./plan";
import type { Craft } from "./item";
import { HOP } from "@/systems/time";
import { Registry, Entity } from "@/lib/registry";

export interface Exit {
  to: string;
  hours?: number; // omit for a street hop (HOP)
}
export interface Hours {
  open: number;
  close: number; // 24h clock
}
export interface Loadout {
  id: string;
  name: string;
  blurb: string;
  items: { id: string; qty?: number }[];
}
export interface Shop {
  name?: string; // the pointer's label — "The brass window"
  stock: string[];
  cut: number; // the house's share of a sale
  ranked?: Record<number, string[]>; // more stock at a license rank
}
export interface Board {
  onLocked?: (s: GameState) => { say: string; next?: GameState }; // what happens when someone without a card tries it
}
export interface Roam {
  monsters: string[];
  when: "day" | "night";
  chance: number;
  text: string;
}
export interface Bench {
  craft: Craft;
  label: string; // the pointer — opens the craft panel
}

// A pointer in a scene. Browsing is free; activating costs what it says.
export interface Action {
  id: string;
  label: string;
  text: string;
  quest?: string; // only while this quest is taken
  hours?: number;
  gold?: number;
  fight?: string[]; // monster ids: this pointer starts a battle; the rest fires on a win
  effect?: (s: GameState) => GameState;
  requires?: Requirement; // greys with the first unmet line
  oath?: string; // swearing to a master — swapping while sworn asks first
  repeat?: boolean; // doesn't spend act:<id> — can be done again
}
export type Placed = Action & { at: string }; // declared by a quest or npc, placed in a scene

export interface Shift {
  at: string; // where
  open: number;
  close: number; // 24h clock
  days?: number[]; // weekdays (0 = the first day of the week); absent = every day
}

interface LocationOpts {
  npcs?: string[]; // who is posted here while it's open
  hours?: Hours; // undefined = always open
  requires?: string; // the quest item that opens the door
  canRest?: boolean;
  shop?: Shop;
  board?: Board;
  bench?: Bench;
  deed?: string; // the flag that makes it yours
  actions?: Action[];
  notices?: ((s: GameState) => string | null)[]; // lines shown under the description when they apply
  roam?: Roam;
  plan?: Plan; // the layout, drawn by hand: boxes for its exits and for what's in it (people, "shop", "board", "bench", actions); without one the screen lays it out itself
}

export class Location extends Entity {
  static registry = new Registry<Location>("location");
  id: string;
  name: string;
  describe: string;
  exits: Required<Exit>[];
  npcs: string[];
  hours?: Hours;
  requires?: string;
  canRest: boolean;
  shop?: Shop;
  board?: Board;
  bench?: Bench;
  deed?: string;
  actions: Action[];
  notices: ((s: GameState) => string | null)[];
  roam?: Roam;
  plan?: Plan;
  constructor(
    id: string,
    name: string,
    describe: string,
    exits: Exit[],
    opts: LocationOpts = {}
  ) {
    super();
    this.id = id;
    this.name = name;
    this.describe = describe;
    this.exits = exits.map((e) => ({ to: e.to, hours: e.hours ?? HOP }));
    this.npcs = opts.npcs ?? [];
    this.hours = opts.hours;
    this.requires = opts.requires;
    this.canRest = opts.canRest ?? false;
    this.shop = opts.shop;
    this.board = opts.board;
    this.bench = opts.bench;
    this.deed = opts.deed;
    this.actions = opts.actions ?? [];
    this.notices = opts.notices ?? [];
    this.roam = opts.roam;
    this.plan = opts.plan;
    Location.registry.add(this);
  }
}

interface NpcOpts {
  offers?: string[]; // quests they hand out
  lends?: Loadout[]; // gear they'll lend an unarmed stranger, once
  hours?: Hours; // when they're at their post; undefined = always
  home?: { location: string; when?: string }; // where they are when no shift holds; `when` = only once that flag is set
  week?: Shift[]; // a roaming npc's week, first match wins; outranks the post
  actions?: Placed[]; // pointers they put in the world
}

export class Npc extends Entity {
  static registry = new Registry<Npc>("npc");
  id: string;
  name: string;
  line: string; // what they say when talked to
  offers: string[];
  lends?: Loadout[];
  hours?: Hours;
  home?: { location: string; when?: string };
  week: Shift[];
  actions: Placed[];
  constructor(id: string, name: string, line: string, opts: NpcOpts = {}) {
    super();
    this.id = id;
    this.name = name;
    this.line = line;
    this.offers = opts.offers ?? [];
    this.lends = opts.lends;
    this.hours = opts.hours;
    this.home = opts.home;
    this.week = opts.week ?? [];
    this.actions = opts.actions ?? [];
    Npc.registry.add(this);
  }
}
