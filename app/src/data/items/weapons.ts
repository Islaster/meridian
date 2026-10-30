import { Weapon } from "../../models/item";

export const walkingStick = new Weapon(
  "walking-stick",
  "Walking stick",
  "club",
  2
);
export const beltKnife = new Weapon("belt-knife", "Belt knife", "sword", 3);
export const rustyBlade = new Weapon("rusty-blade", "Rusty blade", "sword", 4, {
  price: 15,
});
export const huntingBow = new Weapon("hunting-bow", "Hunting bow", "bow", 4);
export const goblinSling = new Weapon(
  "goblin-sling",
  "Goblin sling",
  "bow",
  3,
  { price: 20 }
);
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
export const halesBlade = new Weapon(
  "hales-blade",
  "Hale's blade",
  "sword",
  6,
  { grade: "rare", scaling: { stat: "lck", per: 0.5, from: 5 } }
);

// shop · the kiln yard's smiths left good steel behind
export const kilnsteelSword = new Weapon(
  "kilnsteel-sword",
  "Kilnsteel sword",
  "sword",
  9,
  { reqLevel: 4, price: 140 }
);
export const yewBow = new Weapon("yew-bow", "Yew bow", "bow", 8, {
  reqLevel: 4,
  price: 120,
});
export const handAxe = new Weapon("hand-axe", "Hand axe", "axe", 10, {
  reqLevel: 4,
  reqStats: { str: 7 },
  price: 130,
});

// drops · best for someone
export const alphaFang = new Weapon(
  "alphas-fang",
  "The alpha's fang",
  "knife",
  6,
  {
    reqLevel: 4,
    grade: "rare",
    price: 90,
    scaling: { stat: "agi", per: 0.5, from: 5 },
  }
);
export const rimeEdge = new Weapon("rime-edge", "Rime edge", "sword", 10, {
  reqLevel: 5,
  grade: "rare",
  price: 160,
  scaling: { stat: "int", per: 0.5, from: 5 },
});

if (import.meta.hot) import.meta.hot.accept();
