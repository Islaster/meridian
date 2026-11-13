import type { Grade } from "./item";
import { TIER_COLORS } from "@/data/world/portals";
import { HOP } from "@/systems/time";
import { Registry, Entity } from "@/lib/registry";
import type { Plan } from "./plan";

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
  exits: string[]; // room ids, or a location id for the way out
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

// license ranks, lowest first — index 0 is "no license"
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
  owner: string; // a city, or an npc for a private claim
  fee?: number;
}
interface DungeonOpts {
  manager?: Manager;
  grade?: Grade;
  dormancy?: number; // days quiet after the boss falls
  kind?: LandKind;
  tempo?: number; // town hours per hour inside — a gate's reality keeps its own time; land is 1
  pace?: number; // hours from one room to the next — a quarter-hour unless the rooms are far apart
  plan?: Plan; // the rooms drawn as boxes; you see the ones you've stood in, and the doorways out of yours
}

export class Dungeon extends Entity {
  static registry = new Registry<Dungeon>("dungeon");
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
  tempo: number;
  pace: number;
  plan?: Plan;
  constructor(
    id: string,
    name: string,
    tier: number,
    posting: Posting,
    rooms: Room[],
    opts: DungeonOpts = {}
  ) {
    super();
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
    this.tempo = opts.tempo ?? 1;
    this.pace = opts.pace ?? HOP;
    this.plan = opts.plan;
    Dungeon.registry.add(this);
  }
  get known(): boolean {
    return !!this.manager; // on the Guild's books
  }
  get color() {
    return TIER_COLORS[this.tier];
  }
}
