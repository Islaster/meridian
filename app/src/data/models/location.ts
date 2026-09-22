export interface Exit {
  to: string;
  hours: number;
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
  exits: Exit[];
  npcs: string[];
  hours?: Hours; // undefined = always open
  requires?: string; // quest item that opens it — the door declares its want
  canRest: boolean;
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
    } = {}
  ) {
    this.id = id;
    this.name = name;
    this.describe = describe;
    this.exits = exits;
    this.npcs = opts.npcs ?? [];
    this.hours = opts.hours;
    this.requires = opts.requires;
    this.canRest = opts.canRest ?? false;
    Location.registry.set(id, this);
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
  offers?: string;
  sells?: string[];
  lends?: Loadout[];
  constructor(
    id: string,
    name: string,
    line: string,
    offers?: string,
    sells?: string[],
    lends?: Loadout[]
  ) {
    if (id === "wenna-tarrow")
      console.log("register wenna:", arguments.length, "lends:", lends);
    this.id = id;
    this.name = name;
    this.line = line;
    this.offers = offers;
    this.sells = sells;
    this.lends = lends;
    Npc.registry.set(id, this);
  }
}
