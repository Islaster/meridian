import { Skill } from "@/models/skill";

// ── Scout · foundational ───────────────────────────────────────────────────
new Skill("snap-shot", "Snap shot", "bow", {
  cost: 2,
  power: 1.2,
  family: "shot",
  describe: "Loosed the moment the string is back.",
});
new Skill("steady", "Steady", "bow", {
  cost: 2,
  heal: 5,
  family: "breath",
  describe: "Feet set, breath let out. The shaking stops.",
});

// ── Bowman · trained ───────────────────────────────────────────────────────
new Skill("measured-shot", "Measured shot", "bow", {
  cost: 3,
  power: 1.7,
  family: "shot",
  describe: "Drawn to the ear and held until it's right.",
});
new Skill("held-breath", "Held breath", "bow", {
  cost: 3,
  heal: 8,
  family: "breath",
  describe: "The breath held, then let go. The hurt goes with it.",
});
new Skill("pin-shot", "Pin shot", "bow", {
  cost: 4,
  power: 2.1,
  family: "weight",
  describe: "One arrow, where it has to go.",
});
