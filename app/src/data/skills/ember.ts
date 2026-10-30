import { Skill } from "../../models/skill";

// ── Stoker · foundational ──────────────────────────────────────────────────
new Skill("spark", "Spark", "ember", {
  cost: 2,
  power: 1.2,
  family: "flick",
  describe: "Struck off the thumbnail. It catches.",
});
new Skill("warm-hands", "Warm hands", "ember", {
  cost: 3,
  heal: 5,
  family: "bank",
  describe: "Heat held in the palms and pressed where it's needed.",
});

// ── Firebrand · trained ────────────────────────────────────────────────────
new Skill("cinder-flick", "Cinder flick", "ember", {
  cost: 3,
  power: 1.6,
  family: "flick",
  describe: "A coal from nowhere, snapped off the fingers.",
});
new Skill("banked-heat", "Banked heat", "ember", {
  cost: 4,
  heal: 9,
  family: "bank",
  describe: "Warmth kept back for exactly this.",
});
new Skill("flare", "Flare", "ember", {
  cost: 5,
  power: 2.4,
  family: "burst",
  describe: "Everything banked, all at once.",
});

if (import.meta.hot) import.meta.hot.accept();
