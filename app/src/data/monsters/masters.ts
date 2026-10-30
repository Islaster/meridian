import { Monster } from "../../models/monster";

new Monster(
  "running-mark",
  "The running mark",
  2,
  "far",
  { hp: 12, attack: 1, defense: 0, agility: 12 },
  { xp: 10, drops: [] },
  "Straw on a rope, and someone on the far end who hates you.",
  false
);

new Monster(
  "lamp-wisp",
  "Lamp-wisp",
  2,
  "far",
  { hp: 10, attack: 5, defense: 0, agility: 10 },
  { xp: 10, drops: [] },
  "A breath of light out of the lamp. It goes for the eyes and won't come near your hands.",
  false
);
