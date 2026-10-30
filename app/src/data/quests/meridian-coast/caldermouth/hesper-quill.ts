import { Quest } from "../../../../models/quest";

new Quest(
  "meet-hesper-quill",
  "side",
  "Meet Hesper Quill",
  "Hesper Quill keeps the stillroom on harbor row. Go and hear the terms.",
  { kind: "talk", npc: "hesper-quill" },
  {
    chain: "What the tide gives",
    visible: { complete: ["the-tide-cave"] },
    set: ["met:hesper-quill"],
    narration:
      '"The hall\'s new tenant." Hesper doesn\'t offer a chair. "Osric could read a tide table and a wound the same way. Can you read at all?" The stillroom smells of salt and something bitter.',
    next: "trial-hesper-quill",
  }
);
new Quest(
  "trial-hesper-quill",
  "side",
  "The first draught",
  "Brew a draught under Hesper's eye without poisoning either of you.",
  { kind: "flag", flag: "act:first-draught" },
  {
    chain: "What the tide gives",
    visible: { complete: ["meet-hesper-quill"] },
    set: ["proved:hesper-quill"],
    narration:
      '"Cloudy," she says of your flask. "Honest, though." She names her terms the way she names reagents — exactly once.',
  }
);
new Quest(
  "home-hesper-quill",
  "main",
  "A shelf for Hesper",
  "The deed is yours and the quarters are built. Go home and open the hall for Hesper.",
  { kind: "visit", location: "hall" },
  {
    chain: "What the tide gives",
    visible: {
      complete: ["trial-hesper-quill", "settle-the-lien"],
      flags: ["master:hesper-quill", "built:hall-quarters"],
    },
    set: ["resident:hesper-quill"],
    reward: { xp: 40 },
    epilogue:
      "A shelf of stoppered bottles appears in the hall's cold room, labeled in a hand smaller than yours. Hesper keeps the stillroom by day. Nights, something simmers in the hall that no one is allowed to touch.",
  }
);
if (import.meta.hot) import.meta.hot.accept();
