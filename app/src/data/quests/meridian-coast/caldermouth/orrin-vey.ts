import { Quest } from "../../../../models/quest";
import { learn } from "../../../../systems/classes";

new Quest(
  "meet-orrin-vey",
  "side",
  "Meet Orrin Vey",
  "Orrin Vey keeps the lantern house on the point, past harbor row. Go and hear the terms.",
  { kind: "talk", npc: "orrin-vey" },
  {
    chain: "The lamp and the tide",
    visible: { complete: ["the-tide-cave"] },
    set: ["met:orrin-vey"],
    narration:
      '"Tide\'s out." Orrin is trimming the lamp. "Osric used to sit on that step and ask me what the sea wanted. Wrong question. It doesn\'t want. It pulls." He looks at you properly. "Can you feel which way?"',
    next: "trial-orrin-vey",
  }
);
new Quest(
  "trial-orrin-vey",
  "side",
  "The lamp-wisp",
  "Put out what lives in Orrin's lamp. You can't hit it; find what it flinches from.",
  { kind: "flag", flag: "act:the-lamp-wisp" },
  {
    chain: "The lamp and the tide",
    visible: { complete: ["meet-orrin-vey"] },
    set: ["proved:orrin-vey"],
    narration:
      '"It flinches from you," Orrin says, "which means something in you pulls." His terms are the lamp, the tide, and the oath, and he says them to the sea rather than to you.',
  }
);
new Quest(
  "forms-orrin-vey",
  "side",
  "Sit with the tide",
  "Sit at the lantern house through a whole tide, and listen.",
  { kind: "flag", flag: "act:sit-with-the-tide" },
  {
    chain: "The lamp and the tide",
    visible: { flags: ["sworn:orrin-vey"] },
    reward: { xp: 50 },
    onComplete: learn("undertow"),
    epilogue:
      "\"There,\" he says, when you open your eyes. \"That's the undertow. Don't fight it; it's on your side.\" The hall, he adds, has a window on the water. He's noticed.",
  }
);
new Quest(
  "home-orrin-vey",
  "main",
  "A lamp for Orrin",
  "The deed is yours and the quarters are built. Go home and open the hall for Orrin.",
  { kind: "visit", location: "hall" },
  {
    chain: "The lamp and the tide",
    visible: {
      complete: ["forms-orrin-vey", "settle-the-lien"],
      flags: ["master:orrin-vey", "built:hall-quarters"],
    },
    set: ["resident:orrin-vey"],
    reward: { xp: 40 },
    epilogue:
      "The hall's seaward window has a lamp in it the next night, trimmed low. Orrin keeps the lantern house by day. Nights, the pull in the hall's air changes with the tide.",
  }
);
if (import.meta.hot) import.meta.hot.accept();
