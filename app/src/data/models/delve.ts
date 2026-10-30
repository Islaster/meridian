import { type Room } from "./dungeon";
import { type Grade } from "./item";

export const RANKS = ["—", "F", "E", "D", "C", "B", "A", "S"] as const;

export class Delve {
  id: string;
  name: string;
  entrance: string;
  rooms: Record<string, Room>;
  constructor(id: string, name: string, rooms: Room[]) {
    this.id = id;
    this.name = name;
    this.entrance = rooms[0].id;
    this.rooms = Object.fromEntries(rooms.map((r) => [r.id, r]));
  }
}
export interface Gate {
  to: string;
  inscription: string;
  requires?: string;
} // lives in a Room or a Location
// Room gets:  gate?: Gate;

// data/models/site.ts — the land
export class Site extends Delve {
  static registry = new Map<string, Site>();
  static get(id: string): Site {
    const s = Site.registry.get(id);
    if (!s) throw new Error(`unknown site: ${id}`);
    return s;
  }
  tier: number;
  constructor(id: string, name: string, tier: number, rooms: Room[]) {
    super(id, name, rooms);
    this.tier = tier;
    Site.registry.set(id, this);
  }
}

export interface Posting {
  level: number;
  rank: number;
  party: [number, number];
  environment: string;
  arrival: string;
  monsters: string[];
  materials: string[]; // what the environment itself yields — veins, growths, wreckage, tide pools
}

// environment: shown on entry, never before
export class Dungeon extends Delve {
  static registry = new Map<string, Dungeon>();
  static get(id: string): Dungeon {
    const d = Dungeon.registry.get(id);
    if (!d) throw new Error(`unknown dungeon: ${id}`);
    return d;
  }
  tier: number;
  grade: Grade;
  posting: Posting;
  constructor(
    id: string,
    name: string,
    tier: number,
    grade: Grade,
    posting: Posting,
    rooms: Room[]
  ) {
    super(id, name, rooms);
    this.tier = tier;
    this.grade = grade;
    this.posting = posting;
    Dungeon.registry.set(id, this);
  }
}

export interface Manager {
  kind: "guild" | "crown" | "private";
  owner: string;
  fee?: number;
}
