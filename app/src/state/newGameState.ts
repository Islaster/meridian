import { type GameState } from "./types";
import { hallKey, sealedLetter } from "../data/items/quest";

export const time: GameState["time"] = {
  day: "monday",
  hour: 8,
  block: "day",
  dayId: 1,
};

export const player: GameState["player"] = {
  name: "",
  level: 1,
  xp: 0,
  stats: {
    str: 5,
    end: 5,
    agi: 5,
    dex: 5,
    int: 5,
    wis: 5,
    lck: 5,
    cha: 5,
  },
  statPoints: 0,
  skillPoints: 0,
  skills: {},
  hp: 20,
  maxHp: 20,
  mp: 0,
  maxMp: 0,
  rank: 0,
  proficiency: {},
  uses: {},
};

export const bag: GameState["bag"] = {
  gold: 100,
  equipment: [],
  materials: [],
  consumables: [],
  questItems: [
    { name: hallKey.name, qty: 1 },
    { name: sealedLetter.name, qty: 1 },
  ],
};

export const quests: GameState["quests"] = {
  "find-the-hall": { status: "taken", tracked: true },
};

export const done: GameState["done"] = [];

export const location: GameState["world"] = {
  area: "coast-road",
  town: "caldermouth",
  region: "meridian-coast",
  surveys: [],
};

export const standing: GameState["standing"] = { "charter-guild": 0 };

export const counters: GameState["counters"] = {};
export const notices: GameState["notices"] = [];

export const newGameState: GameState = {
  time,
  player,
  bag,
  quests,
  done,
  world: location,
  standing,
  counters,
  notices,
};
