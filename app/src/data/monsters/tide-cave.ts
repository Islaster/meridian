import { Monster } from "../models/monster";

new Monster(
  "tide-crab",
  "Tide crab",
  1,
  "heavy",
  { hp: 16, attack: 3, defense: 3, agility: 3 },
  {
    xp: 8,
    drops: [
      { item: "salt-crystal", chance: 0.4 },
      { item: "crab-shell", chance: 0.5 },
      { item: "crab-shell-shield", chance: 0.12 },
      { item: "minor-potion", chance: 0.1 },
    ],
  },
  "Armored, patient, wrong-sized. It waits for the water."
);
new Monster(
  "cave-goblin",
  "Cave goblin",
  1,
  "near",
  { hp: 12, attack: 4, defense: 1, agility: 6 },
  {
    xp: 9,
    gold: [1, 10],
    drops: [
      { item: "goblin-ear", chance: 0.5 },
      { item: "goblin-tooth", chance: 0.3 },
      { item: "oil-flask", chance: 0.2 },
      { item: "rusty-blade", chance: 0.1 },
    ],
  },
  "Came in with the dark and stayed. Fights close, runs when it's losing."
);
new Monster(
  "goblin-slinger",
  "Goblin slinger",
  1,
  "far",
  { hp: 9, attack: 5, defense: 0, agility: 6 },
  {
    xp: 10,
    gold: [1, 4],
    drops: [
      { item: "goblin-ear", chance: 0.5 },
      { item: "iron-ore", chance: 0.2 },
      { item: "goblin-sling", chance: 0.15 },
      { item: "leather-cap", chance: 0.08 },
    ],
  },
  "Stays back. Hits from the dark. Kill it first or it kills you slowly."
);
