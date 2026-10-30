import { Quest } from "../../../../models/quest";

new Quest(
  "meet-tobin-ashe",
  "side",
  "Meet Tobin Ashe",
  "Tobin Ashe keeps the forge on harbor row. Go and hear the terms.",
  { kind: "talk", npc: "tobin-ashe" },
  {
    chain: "Iron that holds",
    visible: { complete: ["the-tide-cave"] },
    set: ["met:tobin-ashe"],
    narration:
      '"Osric\'s." Tobin looks at your hands, then at the bar on the anvil. "A smith is someone who can make a thing that doesn\'t break. Everything else is talk."',
    next: "trial-tobin-ashe",
  }
);
new Quest(
  "trial-tobin-ashe",
  "side",
  "A blank",
  "Draw a blank from the bar Tobin puts in your hands, and don't ruin it.",
  { kind: "flag", flag: "act:forge-blank" },
  {
    chain: "Iron that holds",
    visible: { complete: ["meet-tobin-ashe"] },
    set: ["proved:tobin-ashe"],
    narration:
      '"It\'ll hold," he says, which is the whole examination. The apron on the peg is the offer.',
  }
);
new Quest(
  "home-tobin-ashe",
  "main",
  "A rack for Tobin",
  "The deed is yours and the quarters are built. Go home and open the hall for Tobin.",
  { kind: "visit", location: "hall" },
  {
    chain: "Iron that holds",
    visible: {
      complete: ["trial-tobin-ashe", "settle-the-lien"],
      flags: ["master:tobin-ashe", "built:hall-quarters"],
    },
    set: ["resident:tobin-ashe"],
    reward: { xp: 40 },
    epilogue:
      "The hall's back room smells of coal by the end of the week. Tobin keeps the forge by day; nights, the small anvil in the hall rings once or twice before he sleeps.",
  }
);
if (import.meta.hot) import.meta.hot.accept();
