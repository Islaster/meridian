import { PlayerClass } from "@/models/class";

// ── The sword · Ira's discipline ───────────────────────────────────────────
new PlayerClass("soldier", "Soldier", "inferiority", {
  lineage: "battle",
  pool: "ki",
  medium: "sword",
  describe: "Drilled, not taught. Enough breath to hold a line.",
  master: "ira-vell",
  level: 3,
  skills: ["straight-cut", "catch-breath"],
  starts: ["straight-cut"],
});
new PlayerClass("sword", "Swordsman", "normal", {
  lineage: "battle",
  pool: "ki",
  medium: "sword",
  describe: "Two breaths and a blade. The yard's first lesson.",
  master: "ira-vell",
  level: 5,
  skills: ["cross-cut", "second-breath", "heavy-cut"],
  starts: ["cross-cut"],
  floor: { str: 7 },
});
