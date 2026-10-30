import { Consumable } from "../models/item";

export const minorPotion = new Consumable(
  "minor-potion",
  "Minor potion",
  "potion",
  20,
  12
);
export const potion = new Consumable("potion", "Potion", "potion", 45, 30);
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

if (import.meta.hot) import.meta.hot.accept();
