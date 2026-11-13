import { PlayerClass } from "@/models/class";

// ── Somnomancer · the Ledger's ─────────────────────────────────────────────
// No master, no oath. Sleep a hundred days straight — wake, and go back to bed, a hundred times —
// and the Ledger writes the name. Nothing in the game says so.
new PlayerClass(
  "somnomancer",
  "Somnomancer",
  "phantasm",
  {
    lineage: "battle",
    pool: "mana",
    medium: "dream",
    describe:
      "A hundred days asleep. Something in the dark learned your name, and you learned what it does with the hours nobody's using.",
    skills: ["lull", "drowse", "night-terror"],
    starts: ["lull"],
    manifest: { counters: { "sleep:straight": 100 } },
  }
);
