import type { Grade } from "./item";
import { TIER_COLORS, gateSize } from "../portals";

export type LandKind = "dungeon" | "place"; // a dungeon is a gate; a place is just land
export type RoomType =
  | "combat"
  | "boss"
  | "treasure"
  | "trap"
  | "empty"
  | "encounter"
  | "stat";
export interface Room {
  id: string;
  name: string;
  type: RoomType;
  describe: string;
  exits: string[];
  floor?: number;
  monsters?: string[];
  loot?: { id: string; qty?: number }[];
  trap?: {
    stat: string;
    dc: number;
    damage: number;
    pass: string;
    fail: string;
  };
  harvest?: { id: string; qty?: number; hours?: number; text: string }; // what the room itself gives, once a day
}

export const RANKS = [
  "—",
  "F",
  "E",
  "D",
  "C",
  "B",
  "A",
  "S",
  "SS",
  "SSS",
  "UR",
  "LR",
  "GR",
  "EX",
] as const;
export type Guard = 0 | 1 | 2 | 3 | 4 | 5;

export interface Posting {
  level: number;
  rank: number;
  party: [number, number];
  environment: string;
  arrival: string;
  monsters: string[];
  materials: string[];
}
export interface Manager {
  kind: "guild" | "crown" | "private";
  owner: string;
  fee?: number;
  guard?: Guard;
}
interface DungeonOpts {
  manager?: Manager;
  grade?: Grade;
  dormancy?: number;
  kind?: LandKind;
}

export class Dungeon {
  static registry = new Map<string, Dungeon>();
  static get(id: string): Dungeon {
    const d = Dungeon.registry.get(id);
    if (!d) throw new Error(`unknown dungeon: ${id}`);
    return d;
  }

  id: string;
  name: string;
  tier: number;
  grade: Grade;
  posting: Posting;
  manager?: Manager;
  entrance: string;
  rooms: Record<string, Room>;
  dormancy: number;
  kind: LandKind;

  constructor(
    id: string,
    name: string,
    tier: number,
    posting: Posting,
    rooms: Room[],
    opts: DungeonOpts = {}
  ) {
    this.id = id;
    this.name = name;
    this.tier = tier;
    this.grade = opts.grade ?? "normal";
    this.posting = posting;
    this.manager = opts.manager;
    this.entrance = rooms[0].id;
    this.rooms = Object.fromEntries(rooms.map((r) => [r.id, r]));
    this.dormancy = opts.dormancy ?? 3;
    this.kind = opts.kind ?? "place";
    Dungeon.registry.set(id, this);
  }
  get known(): boolean {
    return !!this.manager;
  }

  get color() {
    return TIER_COLORS[this.tier];
  }

  get gate() {
    const { h, w } = gateSize(this.tier);
    return `${this.color} gate, ${h} feet tall and ${w} wide, thin as a blade`;
  }
}
