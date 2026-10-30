import { Quest } from "../../../../models/quest";

new Quest(
  "the-yard-trial",
  "side",
  "The yard",
  "Stand in Ira's yard and answer whatever he sends at you.",
  { kind: "flag", flag: "act:yard-trial" },
  {
    chain: "Two breaths",
    set: ["proved:ira-vell"],
    narration:
      'Ira doesn\'t say you passed. He puts two fingers against your sternum, and something under them that has been shut your whole life opens. Breath goes in further than it has ever gone. "Ki," he says. "It was always there. Now it\'s yours." He looks toward the harbor. "Osric\'s hall. I\'ll want to see it, when it\'s worth seeing."',
    next: "first-forms",
    visible: { complete: ["meet-the-master"] },
  }
);

if (import.meta.hot) import.meta.hot.accept();
