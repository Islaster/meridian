import { PlayerClass } from "@/models/class";

// ── The ember · Dessa's discipline ─────────────────────────────────────────
new PlayerClass("stoker", "Stoker", "inferiority", {
  lineage: "battle",
  pool: "mana",
  medium: "ember",
  describe: "Keeps a fire. Hasn't yet asked it for anything.",
  master: "dessa-marl",
  level: 4,
  skills: ["spark", "warm-hands"],
  starts: ["spark"],
});
new PlayerClass("ember", "Firebrand", "normal", {
  lineage: "battle",
  pool: "mana",
  medium: "ember",
  describe: "What's banked, stays banked — until you say.",
  master: "dessa-marl",
  level: 6,
  skills: ["cinder-flick", "banked-heat", "flare"],
  starts: ["cinder-flick"],
  floor: { wis: 7 },
});
