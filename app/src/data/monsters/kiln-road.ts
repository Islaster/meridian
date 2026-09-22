import { Monster } from "../models/monster";

new Monster(
  "kiln-wolf",
  "Kiln wolf",
  2,
  "swarmer",
  { hp: 14, attack: 5, defense: 1, agility: 8 },
  { xp: 14, drops: [{ item: "wolf-pelt", chance: 0.6 }] },
  "Grey, thin, three of them. The pack comes down at dusk."
);
new Monster(
  "wolf-alpha",
  "Wolf alpha",
  3,
  "near",
  { hp: 30, attack: 7, defense: 2, agility: 7 },
  { xp: 35, drops: [{ item: "wolf-pelt", chance: 1 }] },
  "Bigger, scarred, and last to run.",
  false
);
