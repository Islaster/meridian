import { Material } from "../models/item";

export const kelpFiber = new Material("kelp-fiber", "Kelp fiber", "plant", 4);
export const saltCrystal = new Material(
  "salt-crystal",
  "Salt crystal",
  "ore",
  6
);
export const charcoal = new Material("charcoal", "Charcoal", "fuel", 1);
export const ironOre = new Material("iron-ore", "Iron ore", "ore", 10);
export const cinderOre = new Material("cinder-ore", "Cinder ore", "ore", 22);
export const ashGlass = new Material("ash-glass", "Ash glass", "ore", 30);
export const wolfPelt = new Material("wolf-pelt", "Wolf pelt", "hide", 12);
export const ratTail = new Material("rat-tail", "Rat tail", "part", 3);
export const crabShell = new Material("crab-shell", "Crab shell", "shell", 14);
export const goblinTooth = new Material(
  "goblin-tooth",
  "Goblin tooth",
  "part",
  5
);
export const goblinEar = new Material("goblin-ear", "Goblin ear", "part", 6);
export const wolfFang = new Material("wolf-fang", "Wolf fang", "part", 9);
export const rimeGlass = new Material("rime-glass", "Rime glass", "ore", 12);
export const bearHide = new Material("bear-hide", "Bear hide", "hide", 15);
export const pineResin = new Material("pine-resin", "Pine resin", "plant", 6);
export const frostCore = new Material(
  "frost-core",
  "Frost core",
  "part",
  60,
  "rare"
);

if (import.meta.hot) import.meta.hot.accept();
