import { PlayerClass } from "../../../models/class";

// ── The sword · Ira's discipline ───────────────────────────────────────────
export const solider = new PlayerClass("soldier", "Soldier", "inferiority", {
  lineage: "battle",
  pool: "ki",
  medium: "sword",
  describe: "Drilled, not taught. Enough breath to hold a line.",
  master: "ira-vell",
  skills: ["straight-cut", "catch-breath"],
  starts: ["straight-cut"],
});
export const swordman = new PlayerClass("sword", "Swordsman", "normal", {
  lineage: "battle",
  pool: "ki",
  medium: "sword",
  describe: "Two breaths and a blade. The yard's first lesson.",
  master: "ira-vell",
  skills: ["cross-cut", "second-breath", "heavy-cut"],
  starts: ["cross-cut"],
  floor: { str: 7 },
});

if (import.meta.hot) import.meta.hot.accept();
