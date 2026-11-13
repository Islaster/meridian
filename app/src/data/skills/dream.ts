import { Skill } from "@/models/skill";

// ── Somnomancer · the Ledger's ─────────────────────────────────────────────
// Sleep as a medium. Nothing in the hall teaches these; a hundred nights did.
new Skill("lull", "Lull", "dream", {
  cost: 3,
  power: 1.3,
  family: "dream",
  describe: "A yawn that isn't yours, and the weight behind it.",
});
new Skill("drowse", "Drowse", "dream", {
  cost: 3,
  heal: 8,
  family: "dream",
  describe: "A minute's sleep, taken standing. You wake mended, a little.",
});
new Skill("night-terror", "Night terror", "dream", {
  cost: 6,
  power: 2.6,
  family: "dream",
  describe:
    "What waited in the dark for a hundred nights, let out for one breath.",
});
