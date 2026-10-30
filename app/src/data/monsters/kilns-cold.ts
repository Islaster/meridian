import { Monster } from "../../models/monster";

new Monster(
  "rime-wolf",
  "Rime wolf",
  3,
  "near",
  { hp: 18, attack: 6, defense: 2, agility: 8 },
  {
    xp: 16,
    drops: [
      { item: "wolf-pelt", chance: 0.6 },
      { item: "wolf-fang", chance: 0.5 },
      { item: "rime-glass", chance: 0.15 },
    ],
  },
  "White on white, and bigger than the road wolves. Its breath doesn't steam."
);

new Monster(
  "frost-elf",
  "Frost elf",
  4,
  "far",
  { hp: 14, attack: 8, defense: 1, agility: 9 },
  {
    xp: 22,
    drops: [
      { item: "rime-glass", chance: 0.5 },
      { item: "potion", chance: 0.15 },
    ],
  },
  "Tall, thin, and already drawing. It shoots from the trees and moves before you've found it."
);

new Monster(
  "white-bear",
  "White bear",
  4,
  "heavy",
  { hp: 48, attack: 9, defense: 4, agility: 4 },
  {
    xp: 45,
    drops: [
      { item: "bear-hide", chance: 1 },
      { item: "potion", chance: 0.1 },
    ],
  },
  "It rises onto its hind legs before it swings — that's your whole warning, and it's enough."
);

new Monster(
  "ice-golem",
  "Ice golem",
  5,
  "heavy",
  { hp: 70, attack: 10, defense: 5, agility: 3 },
  {
    xp: 80,
    drops: [
      { item: "rime-glass", chance: 1 },
      { item: "rime-glass", chance: 0.5 },
    ],
  },
  "Ice stacked into the shape of a man. It lifts both arms and holds them there a beat too long before it brings them down.",
  false
);
