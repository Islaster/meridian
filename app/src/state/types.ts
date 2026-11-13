import type { Slot } from "@/models/item";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface Time {
  day: Weekday;
  hour: number; // 0–24, quarter-hours
  block: "day" | "night";
  dayId: number; // days since the first morning, from 1
}

export type QuestStatus = "notTaken" | "taken" | "complete";
export interface QuestProgress {
  status: QuestStatus;
  tracked: boolean; // the one the ✦ follows
  day?: number; // completed on — a posting counts its repeat from here
}

export type Equipment = Partial<Record<Slot | "ring2", string>>; // slot → item id

export interface Player {
  name: string;
  level: number;
  xp: number;
  stats: Record<string, number>;
  statPoints: number;
  skillPoints: number;
  skills: Record<string, number>; // skill id → rank
  hp: number;
  maxHp: number;
  mp: number; // the class pool — ki or mana; 0 until a class opens one
  maxMp: number;
  rank: number; // license rank — index into RANKS
  class?: string; // the name on top of the Ledger
  equipment: Equipment;
  weary?: { stat: string; amount: number }; // last night's debt — restored at the next proper sleep
  proficiency: Record<string, number>; // by medium — sword, bow, tide, ember, smith, alchemy, gather:ore…
}

// What's carried: one map, item id → count. Shelves are read off the item's kind.
export interface Bag {
  gold: number;
  items: Record<string, number>;
}

export interface GameState {
  time: Time;
  player: Player;
  bag: Bag;
  standing: Record<string, number>; // faction → standing
  world: {
    area: string; // the location you stand in (or came from, inside a dungeon)
    dungeon?: string;
    room?: string;
    delve?: number; // hours spent inside this delve, in the dungeon's time
    surveys: string[]; // dungeons you've surveyed yourself
  };
  quests: Record<string, QuestProgress>;
  done: string[]; // the record — every flag ever set (see lib/flags)
  counters: Record<string, number>;
  notices: string[]; // what the systems said, for the toasts
}
