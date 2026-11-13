import { Quest } from "@/models/quest";
import { learn } from "@/systems/classes";

new Quest(
  "forms-dessa-marl",
  "side",
  "Tend the fire",
  "Keep the hall's kiln at heat for a whole afternoon without Dessa touching it.",
  { kind: "flag", flag: "act:tend-the-fire" },
  {
    chain: "Banked",
    visible: { flags: ["sworn:dessa-marl"] },
    reward: { xp: 50 },
    onComplete: learn("flare", "warm-hands"),
    actions: [
      {
        at: "hall-kiln",
        id: "tend-the-fire",
        hours: 4,
        label: "Tend the fire till dusk",
        text: "Too hot, then too cold, then — for an hour nobody mentions — right. Your hands know before you do.",
      },
    ],
    epilogue:
      '"Right," Dessa says, and means the heat. "The hall has a cold hearth. I\'ve seen it. Light it and I\'ll know."',
  }
);
