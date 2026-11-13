import { Quest } from "@/models/quest";

const SIX = [
  "ira-vell",
  "maud-kestrel",
  "tobin-ashe",
  "hesper-quill",
  "orrin-vey",
  "dessa-marl",
];

// The hall's six take your word once you're worth teaching. Pick one; the oath pointer is in their room.
new Quest(
  "a-masters-word",
  "main",
  "A master's word",
  "Six masters keep the hall — Ira and Maud in the yard, Tobin in the smithy, Hesper at the still, Orrin in the cistern, Dessa at the kiln. Every name they teach opens at its own level; the pointer in their room says which. Pick one.",
  { kind: "flag", flag: "inducted" },
  {
    chain: "A master's word",
    visible: { complete: ["the-tide-cave"] },
    track: [
      {
        any: SIX.flatMap((m) => [
          { action: `oath-${m}-lesser` },
          { action: `oath-${m}` },
        ]),
      },
    ],
    reward: { xp: 30 },
    epilogue:
      "A name for what you are, and a second line on the Ledger. Your master's quests are in the journal now — each one opens something the oath didn't.",
  }
);
