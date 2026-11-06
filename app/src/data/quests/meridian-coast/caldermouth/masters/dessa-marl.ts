import { Quest } from "../../../../../models/quest";
import { learn } from "../../../../../systems/classes";
import { line } from "./line";

line({
  npc: "dessa-marl",
  short: "Dessa",
  where: "the kiln yard, up the kiln road",
  chain: "Banked",
  className: "Stoker",
  next: "forms-dessa-marl",
  meet: '"The gate took the kilns. It didn\'t take me." Dessa has one kiln going and her hands in it. "Osric\'s boy. He said you\'d come round the fire eventually. Everybody does."',
  noticed:
    '"You\'ve got the draught right twice." Dessa wipes her hands. "Tobin has my bellows. Has had for a month."',
  errand: {
    name: "Dessa's bellows",
    objective: "Get Dessa's bellows back from Tobin Ashe at the forge.",
    complete: { kind: "talk", npc: "tobin-ashe" },
    narration:
      'Tobin doesn\'t look up. "Tell her when she pays for the last pair." He hands you a leather bellows anyway.',
  },
  back: 'Dessa hangs them on their nail without a word, then: "Say the words. Short ones. I\'ve a fire to keep."',
  oath: '"Stoker," Dessa says. "Keep what\'s banked, banked."',
});

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
    onComplete: learn("flare", "warm-hands"),
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
