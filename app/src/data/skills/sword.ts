import { Skill } from "@/models/skill";

// ── Soldier · foundational ─────────────────────────────────────────────────
new Skill("straight-cut", "Straight cut", "sword", {
  cost: 2,
  power: 1.3,
  family: "cut",
  describe: "One cut, the way it was drilled.",
});
new Skill("catch-breath", "Catch breath", "sword", {
  cost: 2,
  heal: 5,
  family: "breath",
  describe:
    "A soldier's trick: three heartbeats, and the next step hurts less.",
});

// ── Swordsman · trained ────────────────────────────────────────────────────
new Skill("cross-cut", "Cross cut", "sword", {
  cost: 2,
  power: 1.6,
  family: "cut",
  describe: "Two cuts in one breath.",
});
new Skill("second-breath", "Second breath", "sword", {
  cost: 3,
  heal: 8,
  family: "breath",
  describe: "Breath goes in further than it has ever gone. Mends a little.",
});
new Skill("heavy-cut", "Heavy cut", "sword", {
  cost: 4,
  power: 2.2,
  family: "weight",
  describe: "Everything behind one stroke.",
});
