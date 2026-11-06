import { Quest } from "../../../../../models/quest";
import { learn } from "../../../../../systems/classes";
import { line } from "./line";

line({
  npc: "maud-kestrel",
  short: "Maud",
  where: "the butts, inside the gate wall",
  chain: "The held breath",
  className: "Archer",
  next: "forms-maud-kestrel",
  meet: '"Osric\'s heir." She doesn\'t look up from the string she\'s waxing. "He sent me three students in twenty years. Two of them could hit a door." She points her chin down the range. "Show me."',
  noticed:
    '"You again." She watches a full draw before she speaks. "Fetch me something, and we\'ll see."',
  errand: {
    name: "Strings from Dunny",
    objective: "Fetch Maud's bowstrings from Dunny Crake on harbor row.",
    complete: { kind: "talk", npc: "dunny-crake" },
    narration:
      "Dunny pulls a coil of waxed string from under the counter without asking who it's for. \"Tell her the price went up. It didn't.\"",
  },
  back: 'Maud tests each string against her thumb. "He always says that." A nod toward the range. "Say the words, if you want them."',
  oath: '"Archer," Maud says, which is a job, not a title. "The rest is earned."',
});

new Quest(
  "trial-maud-kestrel",
  "side",
  "The running mark",
  "Hit what Maud sends running across the butts.",
  { kind: "flag", flag: "act:loose-at-the-mark" },
  {
    chain: "The held breath",
    visible: { complete: ["meet-maud-kestrel"] },
    set: ["proved:maud-kestrel"],
    narration:
      '"You breathe when you draw. Stop." That\'s the verdict, and the offer in the same breath: her bow, her terms, her oath.',
  }
);
new Quest(
  "forms-maud-kestrel",
  "side",
  "Loose till dark",
  "Shoot at the butts until Maud stops correcting you.",
  { kind: "flag", flag: "act:loose-till-dark" },
  {
    chain: "The held breath",
    visible: { flags: ["sworn:maud-kestrel"] },
    reward: { xp: 50 },
    onComplete: learn("pin-shot", "steady"),
    epilogue:
      '"You\'ll do," Maud says, and goes back to her waxing. "The hall has a rack with nothing on it. Put a bow on it and I might visit."',
  }
);
new Quest(
  "home-maud-kestrel",
  "main",
  "A rack for Maud",
  "The deed is yours and the quarters are built. Go home and open the hall for Maud.",
  { kind: "visit", location: "hall" },
  {
    chain: "The held breath",
    visible: {
      complete: ["forms-maud-kestrel", "settle-the-lien"],
      flags: ["master:maud-kestrel", "built:hall-quarters"],
    },
    set: ["resident:maud-kestrel"],
    reward: { xp: 40 },
    epilogue:
      "There is a bow on the far rack by morning, unstrung, and a stool under the window that wasn't there yesterday. Maud keeps the butts by day. Nights, she sits where she can see the door.",
  }
);
if (import.meta.hot) import.meta.hot.accept();
