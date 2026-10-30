import { Quest } from "../../../../models/quest";

const SIX = [
  "the-master",
  "maud-kestrel",
  "tobin-ashe",
  "hesper-quill",
  "orrin-vey",
  "dessa-marl",
];
const fan = (prefix: string) => [
  { any: SIX.map((m) => ({ quest: `${prefix}-${m}` })) },
];

new Quest(
  "a-masters-word",
  "main",
  "A master's word",
  "Six still teach in Caldermouth. Ira at the sword yard, off the square. Maud at the butts, inside the gate wall. Tobin at the forge and Hesper in the stillroom, on harbor row. Orrin at the lantern house on the point. Dessa in the kiln yard, up the kiln road. Go and meet one.",
  { kind: "flag", flag: "met" },
  {
    chain: "A master's word",
    visible: { complete: ["the-tide-cave"] },
    track: fan("meet"),
    next: "earn-the-eye",
  }
);

new Quest(
  "earn-the-eye",
  "main",
  "Earn the eye",
  "Nobody teaches a stranger. Practice where your master teaches — a session a day — until they notice you.",
  { kind: "flag", flag: "noticed" },
  { chain: "A master's word", track: fan("practice"), next: "run-the-errands" }
);

new Quest(
  "run-the-errands",
  "main",
  "Run the errands",
  "They've noticed. Now they'll ask for something. Do it, and the next thing.",
  { kind: "flag", flag: "errands" },
  { chain: "A master's word", track: fan("errand"), next: "the-short-words" }
);

new Quest(
  "the-short-words",
  "main",
  "The short words",
  "Take their oath — the short one. The long one needs a trial and a floor, and can wait. After the words, the lessons start.",
  { kind: "flag", flag: "inducted" },
  {
    chain: "A master's word",
    track: fan("oath"),
    reward: { xp: 30 },
    epilogue:
      "A name for what you are, and a second line on the Ledger. Your master's quests are in the journal now — each one opens something the oath didn't.",
  }
);

if (import.meta.hot) import.meta.hot.accept();
