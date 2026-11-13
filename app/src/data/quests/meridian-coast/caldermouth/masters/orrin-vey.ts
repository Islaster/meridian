import { Quest } from "@/models/quest";
import { learn } from "@/systems/classes";

new Quest(
  "forms-orrin-vey",
  "side",
  "Sit with the tide",
  "Sit in the cistern through a whole tide, and listen.",
  { kind: "flag", flag: "act:sit-with-the-tide" },
  {
    chain: "The turning tide",
    visible: { flags: ["sworn:orrin-vey"] },
    reward: { xp: 50 },
    onComplete: learn("undertow", "cold-salve"),
    epilogue:
      '"There," he says, when you open your eyes. "That\'s the undertow. Don\'t fight it; it\'s on your side."',
    actions: [
      {
        at: "hall-cistern",
        id: "sit-with-the-tide",
        hours: 4,
        label: "Sit through the tide",
        text: "Six hours of the sea going out and coming back. Somewhere in the fifth you stop hearing it and start feeling where it is.",
      },
    ],
  }
);
