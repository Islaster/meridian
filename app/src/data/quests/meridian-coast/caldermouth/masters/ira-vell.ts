import { Quest } from "@/models/quest";
import { learn } from "@/systems/classes";

new Quest(
  "deliver-the-notice",
  "side",
  "Deliver the notice",
  "Deliver the Guild's notice to Ira Vell. He keeps the hall's yard, and the sword yard off the square some afternoons.",
  { kind: "talk", npc: "ira-vell" },
  {
    chain: "A notice for the yard",
    narration:
      'Ira reads it without taking it. "Tell Marrow the yard pays its dues in sweat, not coin. He\'ll know what that means." He goes back to watching the empty yard.',
    next: "iras-answer",
  }
);

new Quest(
  "first-forms",
  "side",
  "First forms",
  "Train in the hall's yard until Ira is satisfied.",
  { kind: "flag", flag: "act:train-forms" },
  {
    chain: "Two breaths",
    visible: { flags: ["sworn:ira-vell"] },
    reward: { xp: 50 },
    onComplete: learn("second-breath", "catch-breath"),
    epilogue:
      '"That\'ll do for a start," Ira says, which from him is a speech. The bar on your Ledger has a second line now, and a name for what it holds.',
    actions: [
      {
        at: "hall-yard",
        id: "train-forms",
        hours: 4,
        label: "Train until dusk",
        text: "Forms until your arms shake, then forms until they stop. Ira corrects your feet twice and says nothing else all afternoon.",
      },
    ],
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
    actions: [
      {
        at: "hall-yard",
        id: "train-weight",
        hours: 4,
        label: "Carry the weight",
        text: "A sack of wet sand on a pole, the length of the yard and back, until the pole is the only thing you can feel. Ira counts nothing out loud. Near the end he takes the pole, hands you a blade, and says one word: again.",
      },
    ],
  }
);
