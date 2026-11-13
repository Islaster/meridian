import { Quest } from "@/models/quest";
import { learn } from "@/systems/classes";

// The Ledger's quests. Nobody offers these: a 《Phantasm》 name taken puts its own line in the journal (via: "ledger").
// The trigger lives on the class (data/classes/phantasm/*); what the name asks of you afterwards lives here, one block per name.

// ── Somnomancer ────────────────────────────────────────────────────────────
new Quest(
  "the-hundredth-night",
  "side",
  "The hundredth night",
  "What you learned asleep has to be said awake, once. Go to the end of the breakwater after dark and close your eyes with the lamp lit.",
  { kind: "flag", flag: "act:say-it-awake" },
  {
    chain: "The Ledger's line",
    via: "ledger",
    visible: { flags: ["class:somnomancer"] },
    reward: { xp: 60 },
    onComplete: learn("night-terror"),
    epilogue:
      "You say it. The lamp gutters once and steadies. Whatever was in the dark is in you now, and it is awake when you are.",
    actions: [
      {
        at: "breakwater",
        id: "say-it-awake",
        hours: 1,
        label: "Close your eyes",
        requires: { hour: { from: 20 } },
        text: "Eyes shut, the lamp behind the lids, the sea going out. A hundred nights come back in order, and at the end of them a word you've never said. You say it.",
      },
    ],
  }
);
