import { Quest } from "../../../models/quest";
import { learn } from "../../../../systems/classes";

new Quest(
  "meet-dessa-marl",
  "side",
  "Meet Dessa Marl",
  "Dessa Marl still keeps one kiln lit in the kiln yard, up the kiln road. Go and hear the terms.",
  { kind: "talk", npc: "dessa-marl" },
  {
    chain: "Banked",
    visible: { complete: ["the-tide-cave"] },
    set: ["met:dessa-marl"],
    narration:
      '"The gate took the kilns. It didn\'t take me." Dessa has one kiln going and her hands in it. "Osric\'s boy. He said you\'d come round the fire eventually. Everybody does."',
    next: "trial-dessa-marl",
  }
);
new Quest(
  "trial-dessa-marl",
  "side",
  "The cold kiln",
  "Something still drifts in the one kiln Dessa never let go out. Smother it.",
  { kind: "flag", flag: "act:the-cold-kiln" },
  {
    chain: "Banked",
    visible: { complete: ["meet-dessa-marl"] },
    set: ["proved:dessa-marl"],
    narration:
      '"You closed the draught," she says. "Most people throw water." Her terms are short: keep what\'s banked, banked. The oath is shorter.',
  }
);
new Quest(
  "forms-dessa-marl",
  "side",
  "Tend the fire",
  "Keep Dessa's kiln at heat for a whole afternoon without her touching it.",
  { kind: "flag", flag: "act:tend-the-fire" },
  {
    chain: "Banked",
    visible: { flags: ["sworn:dessa-marl"] },
    reward: { xp: 50 },
    onComplete: learn("flare"),
    epilogue:
      '"Right," Dessa says, and means the heat. "The hall has a cold hearth. I\'ve seen it. Light it and I\'ll know."',
  }
);
new Quest(
  "home-dessa-marl",
  "main",
  "A hearth for Dessa",
  "The deed is yours and the quarters are built. Go home and open the hall for Dessa.",
  { kind: "visit", location: "hall" },
  {
    chain: "Banked",
    visible: {
      complete: ["forms-dessa-marl", "settle-the-lien"],
      flags: ["master:dessa-marl", "built:hall-quarters"],
    },
    set: ["resident:dessa-marl"],
    reward: { xp: 40 },
    epilogue:
      "The hall's hearth is lit when you come in, banked low, and there is a stool pulled close to it. Dessa keeps the kiln yard by day. Nights, the hall is warm in a way it hasn't been since before the ash.",
  }
);
if (import.meta.hot) import.meta.hot.accept();
