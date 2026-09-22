import { Consumable } from "../models/item";
export const minorPotion = new Consumable(
  "minor-potion",
  "Minor potion",
  20,
  12
);
export const potion = new Consumable("potion", "Potion", 45, 30, "normal");
export const oilFlask = new Consumable(
  "oil-flask",
  "Oil flask",
  0,
  8,
  "normal"
);
export const bomb = new Consumable("bomb", "Bomb", 0, 20, "inferiority");
export const driedFish = new Consumable(
  "dried-fish",
  "Dried fish",
  8,
  3,
  "normal"
);
