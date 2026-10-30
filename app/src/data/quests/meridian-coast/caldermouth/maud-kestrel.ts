import { Quest } from "../../../models/quest";
import { learn } from "../../../../systems/classes";

new Quest(
  "meet-maud-kestrel",
  "side",
  "Meet Maud Kestrel",
  "Maud Kestrel keeps the butts by the gate wall. Go and hear the terms.",
  { kind: "talk", npc: "maud-kestrel" },
  {
    chain: "The held breath",
    visible: { complete: ["the-tide-cave"] },
    set: ["met:maud-kestrel"],
    narration:
      '"Osric\'s heir." She doesn\'t look up from the string she\'s waxing. "He sent me three students in twenty years. Two of them could hit a door." She points her chin down the range. "Show me."',
    next: "trial-maud-kestrel",
  }
);
new Quest(
  "trial-maud-kestrel",
  "side",
  "The running mark",
  "Hit what Maud sends running across the butts.",
  { kind: "flag", flag: "act:the-mark" },
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
    onComplete: learn("pin-shot"),
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
