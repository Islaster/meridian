import { type GameState } from "./types";
import { workshopKey, sealedLetter } from "../data/items/quest";
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
};

export const bag: GameState["bag"] = {
  gold: 100,
  equipment: [],
  materials: [],
  consumables: [],
  questItems: [
    { name: workshopKey.name, qty: 1 },
    { name: sealedLetter.name, qty: 1 },
  ],
};

export const location: GameState["world"] = {
  area: "coast-road",
  region: "starterRegion",
  town: "starterTown",
};

export const quests: GameState["quests"] = {
  "the-inheritance": 0,
};

export const done: GameState["done"] = [];
