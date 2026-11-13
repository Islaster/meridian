import { Monster } from "@/models/monster";

new Monster(
  "cellar-rat",
  "Cellar rat",
  0,
  "swarmer",
  { hp: 6, attack: 2, defense: 0, agility: 7 },
  {
    gold: [5, 10],
    xp: 3,
    drops: [
      { item: "kelp-fiber", chance: 0.2 },
      { item: "rat-tail", chance: 0.5 },
      { item: "dried-fish", chance: 0.15 },
    ],
  },
  "Fat on Osric's stores. Alone, a nuisance. They are never alone."
);
new Monster(
  "rat-king",
  "Rat king",
  1,
  "heavy",
  { hp: 18, attack: 4, defense: 1, agility: 4 },
  {
    xp: 12,
    gold: [50, 100],
    drops: [
      { item: "rat-tail", chance: 1 },
      { item: "rat-hide-gloves", chance: 0.3 },
      { item: "minor-potion", chance: 0.35 },
      { item: "copper-ring", chance: 0.15 },
    ],
  },
  "The one the others feed. Slow, and does not care that you're there.",
  false
);
