import { Monster } from "../../models/monster";

new Monster(
  "kiln-wolf",
  "Kiln wolf",
  2,
  "swarmer",
  { hp: 14, attack: 5, defense: 1, agility: 8 },
  {
    xp: 14,
    drops: [
      { item: "wolf-pelt", chance: 0.6 },
      { item: "wolf-fang", chance: 0.5 },
      { item: "potion", chance: 0.08 },
    ],
  },
  "Grey, thin, three of them. The pack comes down at dusk."
);
new Monster(
  "wolf-alpha",
  "Wolf alpha",
  3,
  "near",
  { hp: 30, attack: 7, defense: 2, agility: 7 },
  {
    xp: 35,
    drops: [
      { item: "wolf-pelt", chance: 1 },
      { item: "wolf-fang", chance: 1 },
      { item: "wolf-pelt-cloak", chance: 0.25 },
      { item: "iron-sword", chance: 0.1 },
    ],
  },
  "Bigger, scarred, and last to run.",
  false
);

new Monster(
  "ash-wisp",
  "Ash wisp",
  3,
  "far",
  { hp: 10, attack: 6, defense: 1, agility: 7 },
  { xp: 9, drops: [{ item: "ash-glass", chance: 0.5 }] },
  "A coal that drifts. It burns from where you aren't."
);
