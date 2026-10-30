import { PlayerClass } from "../../models/class";

// ── The ember · Dessa's discipline ─────────────────────────────────────────
export const stoker = new PlayerClass("stoker", "Stoker", "inferiority", {
  lineage: "battle",
  pool: "mana",
  medium: "ember",
  describe: "Keeps a fire. Hasn't yet asked it for anything.",
  master: "dessa-marl",
  skills: ["spark", "warm-hands"],
  starts: ["spark"],
});
export const firebrand = new PlayerClass("ember", "Firebrand", "normal", {
  lineage: "battle",
  pool: "mana",
  medium: "ember",
  describe: "What's banked, stays banked — until you say.",
  master: "dessa-marl",
  skills: ["cinder-flick", "banked-heat", "flare"],
  starts: ["cinder-flick"],
  floor: { wis: 7 },
});

if (import.meta.hot) import.meta.hot.accept();
