import type { GameState, Player } from "./types";

// The first morning. Everything a run starts with lives here and nowhere else.
export const basePlayer: Player = {
  name: "",
  level: 1,
  xp: 0,
  stats: { str: 5, end: 5, agi: 5, dex: 5, int: 5, wis: 5, lck: 5, cha: 5 },
  statPoints: 0,
  skillPoints: 0,
  skills: {},
  hp: 20,
  maxHp: 20,
  mp: 0,
  maxMp: 0,
  rank: 0,
  equipment: {},
  proficiency: {},
  conditions: [],
};

export const newGame: GameState = {
  time: { day: "monday", hour: 8, block: "day", dayId: 1 },
  player: basePlayer,
  bag: { gold: 100, items: { "hall-key": 1, "sealed-letter": 1 } },
  standing: { "charter-guild": 0 },
  world: { area: "coast-road", surveys: [] },
  quests: { "find-the-hall": { status: "taken", tracked: true } },
  done: [],
  counters: {},
  notices: [],
};
