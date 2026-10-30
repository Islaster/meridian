import { Monster } from "../models/monster";

// Ira's intake trial. Near archetype, unfleeable like any boss (battle doc), no drops, no coin.
new Monster(
  "yards-second",
  "The yard's second",
  2,
  "near",
  { hp: 22, attack: 5, defense: 3, agility: 6 },
  { xp: 12, gold: [0, 0] },
  "A sun-browned man with a blunt blade, waiting without expression.",
  false
);

if (import.meta.hot) import.meta.hot.accept();
