import { Quest } from "../../../../models/quest";
import { learn } from "../../../../systems/classes";

new Quest(
  "deliver-the-notice",
  "side",
  "Deliver the notice",
  "Deliver the Guild's notice to Ira Vell at the sword yard, off the square.",
  { kind: "talk", npc: "ira-vell" },
  {
    chain: "A notice for the yard",
    narration:
      'Ira reads it without taking it. "Tell Marrow the yard pays its dues in sweat, not coin. He\'ll know what that means." He goes back to watching the empty yard.',
    next: "iras-answer",
  }
);

new Quest(
  "meet-the-master",
  "side",
  "The name in the journal",
  "Osric's journal names Ira Vell — the last teacher who ever stood in the hall. Find him at the sword yard.",
  { kind: "talk", npc: "ira-vell" },
  {
    chain: "Two breaths",
    visible: { complete: ["the-tide-cave"] },
    narration:
      'Ira looks at you the way the guard looked at the letter — reading. "Osric said you\'d come. Said the hall would open again, too." He nods at the packed earth. "I don\'t teach in dead rooms, and the yard doesn\'t take my word for anything. Go and stand in it."',
    next: "practice-ira-vell",
    set: ["met:ira-vell", "met"],
  }
);
new Quest(
  "practice-ira-vell",
  "side",
  "The yard, every day",
  "Practice in the sword yard. Two sessions, and Ira will have looked up.",
  { kind: "flag", flag: "noticed:ira-vell" },
  {
    chain: "Two breaths",
    narration:
      '"You again." Ira watches a full form through before he speaks. "Carry something for me, and we\'ll see."',
    next: "errand-ira-vell",
  }
);

new Quest(
  "errand-ira-vell",
  "side",
  "Word to the gate",
  "Carry Ira's word to Tamsin Roake at the gate: the yard pays its dues in sweat.",
  { kind: "talk", npc: "tamsin-roake" },
  {
    chain: "Two breaths",
    narration:
      'Tamsin snorts. "He\'s said that for twenty years. Tell him the gate still stands." You will.',
    next: "errand-ira-vell-2",
  }
);

new Quest(
  "errand-ira-vell-2",
  "side",
  "The yard's receipt",
  "Fetch the yard's dues receipt from Pell Marrow at the Guild, and bring it back to Ira.",
  { kind: "talk", npc: "ira-vell" },
  {
    chain: "Two breaths",
    visible: { flags: ["act:yard-receipt"] },
    set: ["errands:ira-vell", "errands"],
    narration:
      'Ira reads it the way he reads everything, then folds it into his belt. "That\'s twice. Say the words, if you want them."',
    next: "oath-ira-vell",
  }
);

new Quest(
  "oath-ira-vell",
  "side",
  "The short words",
  "Take Ira's oath — the short one. Soldier.",
  { kind: "flag", flag: "sworn:ira-vell" },
  {
    chain: "Two breaths",
    narration:
      '"Soldier," Ira says, which is not a compliment, and not an insult either. "The rest is earned."',
    next: "first-forms",
  }
);

new Quest(
  "first-forms",
  "side",
  "First forms",
  "Train at the sword yard until Ira is satisfied.",
  { kind: "flag", flag: "act:train-forms" },
  {
    chain: "Two breaths",
    visible: { flags: ["sworn:ira-vell"] },
    reward: { xp: 50 },
    onComplete: learn("second-breath"),
    epilogue:
      "\"That'll do for a start,\" Ira says, which from him is a speech. The bar on your Ledger has a second line now, and a name for what it holds. \"You've a hall with empty racks and a paper on it that isn't yours. Fix the paper. Then we'll talk about the racks.\"",
  }
);

new Quest(
  "the-weight",
  "side",
  "The weight of it",
  "Ira has one more thing to show you, and he won't show it until you've bled for the rest.",
  { kind: "flag", flag: "act:train-weight" },
  {
    chain: "Two breaths",
    visible: { complete: ["first-forms"] },
    reward: { xp: 60 },
    onComplete: learn("heavy-cut"),
    epilogue:
      '"Everything behind one stroke," Ira says. "Not most of it. Everything." You feel the difference in your shoulders for a week.',
  }
);

new Quest(
  "bring-ira-home",
  "main",
  "The first rack",
  "The deed is yours and the quarters are built. Go home and open the hall for him.",
  { kind: "visit", location: "hall" },
  {
    chain: "The first rack",
    visible: {
      complete: ["first-forms", "settle-the-lien"],
      flags: ["master:ira-vell", "built:hall-quarters"],
    },
    set: ["resident:ira-vell"],
    reward: { xp: 40 },
    epilogue:
      "By the time you reach the hall the far quarters have a lamp in them, and the first rack on the wall holds blades that are not yours. Ira keeps the yard by day. Nights, the hall has a master in it again — the first since Osric.",
  }
);

if (import.meta.hot) import.meta.hot.accept();
