import { Skill } from "../models/skill";

// ── Wader · foundational ───────────────────────────────────────────────────
new Skill("spray", "Spray", "tide", {
  cost: 2,
  power: 1.2,
  family: "lash",
  describe: "A fistful of sea, thrown from nowhere.",
});
new Skill("cold-salve", "Cold salve", "tide", {
  cost: 3,
  heal: 5,
  family: "still",
  describe: "Seawater over the hurt. It stings, and then it doesn't.",
});

// ── Tidecaller · trained ───────────────────────────────────────────────────
new Skill("brine-lash", "Brine lash", "tide", {
  cost: 3,
  power: 1.7,
  family: "lash",
  describe: "A rope of seawater out of nothing, swung.",
});
new Skill("still-water", "Still water", "tide", {
  cost: 4,
  heal: 10,
  family: "still",
  describe: "The pull goes quiet for a breath, and takes the hurt with it.",
});
new Skill("undertow", "Undertow", "tide", {
  cost: 5,
  power: 2.3,
  family: "pull",
  describe: "The floor goes out from under them.",
});

if (import.meta.hot) import.meta.hot.accept();
