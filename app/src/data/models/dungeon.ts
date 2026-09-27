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
  monsters?: string[];
  loot?: { id: string; qty?: number }[];
  trap?: {
    stat: string;
    dc: number;
    damage: number;
    pass: string;
    fail: string;
  };
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
  entrance: string;
  rooms: Record<string, Room>;
  constructor(id: string, name: string, tier: number, rooms: Room[]) {
    this.id = id;
    this.name = name;
    this.tier = tier;
    this.entrance = rooms[0].id;
    this.rooms = Object.fromEntries(rooms.map((r) => [r.id, r]));
    Dungeon.registry.set(id, this);
  }
}
