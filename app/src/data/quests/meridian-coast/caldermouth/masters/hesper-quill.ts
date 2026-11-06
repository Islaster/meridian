import { Quest } from "../../../../../models/quest";
import { line } from "./line";

line({
  npc: "hesper-quill",
  short: "Hesper",
  where: "the stillroom on harbor row",
  chain: "The bitter shelf",
  className: "Herbalist",
  meet: '"The hall\'s new tenant." Hesper doesn\'t offer a chair. "Osric could read a tide table and a wound the same way. Can you read at all?" The stillroom smells of salt and something bitter.',
  noticed:
    '"Still here." Hesper doesn\'t turn. "The shingle has kelp on it at the ebb. I want it before it dries."',
  errand: {
    name: "Kelp for the stillroom",
    objective:
      "Bring Hesper kelp fiber — the tideline on the shingle leaves it in rows.",
    complete: { kind: "have", item: "kelp-fiber" },
    take: ["kelp-fiber"],
    narration: "Cold, slick, and smelling of the whole sea.",
  },
  back: 'She holds it to the light, then to her nose. "It will do." From Hesper, that is praise.',
  oath: '"Herbalist," she says, writing it on a label. "Touch nothing I haven\'t named."',
});

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
