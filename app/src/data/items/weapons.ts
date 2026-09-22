import { Weapon } from "../models/item";
export const walkingStick = new Weapon(
  "walking-stick",
  "Walking stick",
  "club",
  2,
  { price: 0 }
);
export const rustyBlade = new Weapon("rusty-blade", "Rusty blade", "sword", 4, {
  price: 15,
});
export const ironSword = new Weapon("iron-sword", "Iron sword", "sword", 6, {
  reqStats: { str: 7 },
  price: 60,
});
export const woodAxe = new Weapon("wood-axe", "Wood axe", "axe", 7, {
  reqStats: { str: 8 },
  price: 55,
});
export const shortBow = new Weapon("short-bow", "Short bow", "bow", 5, {
  reqStats: { dex: 7 },
  price: 60,
});
export const ashStaff = new Weapon("ash-staff", "Ash staff", "staff", 3, {
  reqStats: { int: 7 },
  price: 50,
});
export const beltKnife = new Weapon("belt-knife", "Belt knife", "sword", 3);
export const huntingBow = new Weapon("hunting-bow", "Hunting bow", "bow", 4);
