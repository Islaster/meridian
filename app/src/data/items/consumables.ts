import { Consumable } from "../../models/item";

// the still
export const minorPotion = new Consumable(
  "minor-potion",
  "Minor potion",
  "potion",
  20,
  12
).made(
  "alchemy",
  [
    { id: "sea-wormwood", qty: 1 },
    { id: "kelp-fiber", qty: 1 },
    { id: "charcoal", qty: 1 },
  ],
  true
); // a simple steep: anyone's work
export const potion = new Consumable("potion", "Potion", "potion", 45, 30).made(
  "alchemy",
  [
    { id: "sea-wormwood", qty: 2 },
    { id: "salt-crystal", qty: 1 },
    { id: "pine-resin", qty: 1 },
    { id: "charcoal", qty: 1 },
  ]
);

// the counter — cooked, not brewed; no hearth to make them at yet
export const driedFish = new Consumable(
  "dried-fish",
  "Dried fish",
  "food",
  8,
  3
);
export const rations = new Consumable("rations", "Rations", "food", 6, 5);
export const mulledWine = new Consumable(
  "mulled-wine",
  "Mulled wine",
  "food",
  12,
  14
);
