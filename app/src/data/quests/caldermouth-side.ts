import { Quest } from "../models/quest";

export const aNoticeForTheYard = new Quest(
  "a-notice-for-the-yard",
  "side",
  "A notice for the yard",
  [
    {
      objective:
        "Deliver the Guild's notice to Ira Vell at the sword yard, off the square.",
      narration:
        '"The old man ignores letters," Pell says, holding one out. "He won\'t ignore a face. Bring me his answer."',
      complete: { kind: "talk", npc: "ira-vell" },
    },
    {
      objective: "Take Ira's answer back to Pell at the Guild hall.",
      narration:
        'Ira reads it without taking it. "Tell Marrow the yard pays its dues in sweat, not coin. He\'ll know what that means." He goes back to watching the empty yard.',
      complete: { kind: "talk", npc: "pell-marrow" },
    },
  ],
  {
    reward: { xp: 8, gold: 10 },
    epilogue:
      'Pell\'s mouth thins. "He always says that." A coin, counted twice, for your trouble.',
  }
);

// Dunny → the breakwater → Dunny. A look at the sea, and oil for a mortal's kit.
export const theBreakwaterLamp = new Quest(
  "the-breakwater-lamp",
  "side",
  "The breakwater lamp",
  [
    {
      objective:
        "Walk out along the breakwater from harbor row and see whether the lamp still stands.",
      narration:
        '"Lamp on the point\'s been dark two nights," Dunny says. "I\'m not walking out there. You\'re young."',
      complete: { kind: "visit", location: "breakwater" },
    },
    {
      objective: "Tell Dunny what you found.",
      narration:
        "The lamp stands. Its glass is whole. Its oil is gone — not burned down, gone, the reservoir dry and the cap set neatly back in place. Someone took it.",
      complete: { kind: "talk", npc: "dunny-crake" },
    },
  ],
  {
    reward: { items: ["oil-flask", "oil-flask"] },
    epilogue:
      'Dunny swears at no one in particular and pushes two flasks across the counter. "Then you\'ll need these more than I do."',
  }
);

// Corvin → the gate → Corvin. First lore of the Halls, and the first mention of the doors from someone who saw them.
export const theMarkOnTheStone = new Quest(
  "the-mark-on-the-stone",
  "side",
  "The mark on the stone",
  [
    {
      objective:
        "Look for a carved mark on the gate towers — a circle cut by a line.",
      narration:
        '"My master carved his mark on the gate the day he left," Corvin says. "I\'ve never had the nerve to check whether it\'s still there. Look for me."',
      complete: { kind: "visit", location: "town-gate" },
    },
    {
      objective: "Tell Corvin at the Halls' yard.",
      narration:
        "It's there, at the base of the left tower, small enough to miss: a circle, cut through by a single line. The stone around it is scorched black in a shape the weather hasn't touched.",
      complete: { kind: "talk", npc: "corvin-ashe" },
    },
  ],
  {
    reward: { xp: 12 },
    epilogue:
      'Corvin is quiet a long time. "A circle and a line. The old sign for a door." He does not explain, and you get the sense he can\'t.',
  }
);
