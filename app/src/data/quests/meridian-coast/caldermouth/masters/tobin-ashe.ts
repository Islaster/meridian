import { Quest } from "../../../../../models/quest";
import { line } from "./line";

line({
  npc: "tobin-ashe",
  short: "Tobin",
  where: "the forge on harbor row",
  chain: "Iron that holds",
  className: "Apprentice smith",
  meet: '"Osric\'s." Tobin looks at your hands, then at the bar on the anvil. "A smith is someone who can make a thing that doesn\'t break. Everything else is talk."',
  noticed:
    'Tobin looks up from the bar for the first time. "You keep coming. Fine. The kilns owe me a sack."',
  errand: {
    name: "Charcoal for the forge",
    objective:
      "Bring Tobin a sack of charcoal — the kilns up the road rake it out.",
    complete: { kind: "have", item: "charcoal" },
    take: ["charcoal"],
    narration: "The sack is heavier than it looks and leaves your hands black.",
  },
  back: 'Tobin weighs it in one hand and tips it into the bin. "It\'ll burn." That is the whole thank-you.',
  oath: '"Apprentice," Tobin says. "You carry, you pump, you watch. Talk when the iron does."',
});

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
