import { Quest } from "../../../../../models/quest";
import { learn } from "../../../../../systems/classes";
import { line } from "./line";

line({
  npc: "orrin-vey",
  short: "Orrin",
  where: "the lantern house on the point",
  chain: "The turning tide",
  className: "Wader",
  next: "forms-orrin-vey",
  meet: '"Tide\'s out." Orrin is trimming the lamp. "Osric used to sit on that step and ask me what the sea wanted. Wrong question. It doesn\'t want. It pulls." He looks at you properly. "Can you feel which way?"',
  noticed:
    'Orrin stops watching the water and watches you. "The thing in the lamp eats. Dried fish. Dunny has it."',
  errand: {
    name: "Fish for the lamp",
    objective: "Bring Orrin dried fish for whatever lives in the lamp.",
    complete: { kind: "have", item: "dried-fish" },
    take: ["dried-fish"],
    narration: "Salt-stiff and light as paper.",
  },
  back: 'Orrin opens the lamp a crack and the fish is gone before you see what took it. "It likes you," he says. "Or the fish."',
  oath: '"Wader," Orrin says. "You stand where the water is and learn where it isn\'t."',
});

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
    onComplete: learn("undertow", "cold-salve"),
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
