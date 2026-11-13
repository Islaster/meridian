import { Quest } from "@/models/quest";

new Quest(
  "wolves-on-the-kiln-road",
  "bounty",
  "Wolves on the kiln road",
  "A pack has the kiln road after dark. Tamsin pays for the alpha. Walk the road at night and come back with the fangs.",
  { kind: "flag", flag: "act:roam-kiln-road" },
  {
    reward: { gold: 120, xp: 30 },
    repeat: 7,
    visible: { day: { from: 2 } },
    acceptable: { rank: 1 },
    epilogue:
      'Tamsin counts the fangs, not the coin. "They\'ll be back inside a week. They always are."',
  }
);
