import { Quest } from "@/models/quest";
import { learn } from "@/systems/classes";

new Quest(
  "forms-maud-kestrel",
  "side",
  "Loose till dark",
  "Shoot in the hall's yard until Maud stops correcting you.",
  { kind: "flag", flag: "act:loose-till-dark" },
  {
    chain: "The held breath",
    visible: { flags: ["sworn:maud-kestrel"] },
    reward: { xp: 50 },
    onComplete: learn("pin-shot", "steady"),
    epilogue: '"You\'ll do," Maud says, and goes back to her waxing.',
    actions: [
      {
        at: "hall-yard",
        id: "loose-till-dark",
        hours: 4,
        label: "Loose till dark",
        text: "A hundred arrows, then a hundred more. By the end she isn't watching your hands anymore, which is the only praise she has.",
      },
    ],
  }
);
