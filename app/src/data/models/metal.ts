export type Row = {
  metal: string;
  wood: string;
  hide: string;
  power: number;
  price: number;
  level: number;
  from?: readonly (readonly [string, number])[]; // alloy: made from these instead of an ore
  found?: boolean; // no recipe: the ingot is found whole
};

export const METALS = [
  {
    metal: "copper",
    wood: "driftwood",
    hide: "cloth",
    power: 0.7,
    price: 0.3,
    level: 1,
  },
  {
    metal: "bronze",
    wood: "ash",
    hide: "leather",
    power: 1,
    price: 1,
    level: 3,
    from: [
      ["copper", 2],
      ["tin", 1],
    ],
  },
  {
    metal: "iron",
    wood: "yew",
    hide: "boiled hide",
    power: 1.45,
    price: 4,
    level: 6,
  },
  {
    metal: "steel",
    wood: "horn",
    hide: "scale",
    power: 2,
    price: 12,
    level: 10,
    from: [
      ["iron", 2],
      ["charcoal", 1],
    ],
  },
  {
    metal: "silversteel",
    wood: "ironwood",
    hide: "drake hide",
    power: 2.7,
    price: 30,
    level: 15,
    from: [
      ["steel", 2],
      ["silver", 1],
    ],
  },
  {
    metal: "mithril",
    wood: "bone",
    hide: "wyrm hide",
    power: 3.5,
    price: 70,
    level: 21,
  },
  {
    metal: "meteoric iron",
    wood: "heartwood",
    hide: "giant hide",
    power: 4.5,
    price: 150,
    level: 28,
    found: true,
  },
  {
    metal: "adamantite",
    wood: "worldash",
    hide: "dragon hide",
    power: 6,
    price: 320,
    level: 36,
  },
  {
    metal: "starmetal",
    wood: "starwood",
    hide: "leviathan hide",
    power: 8,
    price: 700,
    level: 45,
    found: true,
  },
] as const satisfies readonly Row[];
