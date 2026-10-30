import { Dungeon } from "../models/dungeon";

new Dungeon(
  "kilns-cold",
  "The cold kilns",
  1,
  {
    level: 3,
    rank: 1,
    party: [1, 2],
    environment:
      "The old kiln yard up behind the town — six brick kilns, sheds, a chimney, all cold. Between the second and third kilns stands a slit of ember light, ten feet tall and three wide and no thicker than a blade's edge; walk around it and it's a line in the air. The kilnmen left the year it opened. The Guild has held it since. Through it: forest, snow, and no end to either.",
    arrival:
      "Edge-on it is nothing. Face-on it takes you in a single step: warm brick and salt air behind, and then the cold has your breath. Pines in every direction, snow to the shin, a sky the color of pewter. Over your shoulder the slit hangs in the white, a thread of ember.",
    monsters: [
      "rime-wolf",
      "wolf-alpha",
      "frost-elf",
      "white-bear",
      "ice-golem",
    ],
    materials: ["rime-glass", "bear-hide"],
  },
  [
    {
      id: "threshold",
      name: "The threshold",
      type: "empty",
      describe:
        "Snow unbroken but for one set of tracks, old, going in. The trees start ten paces off and don't stop. The slit is at your back, ember-colored, the only warm thing in sight.",
      exits: ["the-kilns", "treeline"],
    },
    {
      id: "treeline",
      name: "The treeline",
      type: "combat",
      monsters: ["rime-wolf", "rime-wolf"],
      describe:
        "The pines close over. Something keeps pace with you, off to the left, white on white.",
      exits: ["threshold", "frozen-door", "lake", "deadfall"],
      harvest: {
        id: "pine-resin",
        qty: 2,
        hours: 1,
        text: "Sap bleeds where the bark is split. It keeps.",
      },
    },
    {
      id: "frozen-door",
      name: "The frozen door",
      type: "empty",
      describe:
        "A door of blue ice set into a cliff, and on it a handprint the size of a shield. Frost-script above the lintel: WHAT WINTER TOOK, WINTER KEEPS. BRING IT WARMTH AND IT MAY GIVE BACK. Beyond the treeline, now and then, something very large shifts its weight.",
      exits: ["treeline"],
    },
    {
      id: "deadfall",
      name: "The deadfall",
      type: "combat",
      monsters: ["white-bear"],
      describe:
        "Fallen pines in a tangle, and under them a den that is not a wolf's. It does not hurry out.",
      exits: ["treeline"],
    },
    {
      id: "lake",
      name: "The lake",
      type: "trap",
      trap: {
        stat: "agi",
        dc: 7,
        damage: 5,
        pass: "The ice holds where you step. You don't look down.",
        fail: "The ice gives. Knee-deep, and the cold takes a bite you'll feel all day.",
      },
      describe:
        "A frozen lake, grey and groaning. The far shore is where the trees thin.",
      exits: ["treeline", "hollow", "pack"],
      harvest: {
        id: "rime-glass",
        hours: 1,
        text: "Shards along the shore that never melt, even in your hand.",
      },
    },
    {
      id: "hollow",
      name: "The hollow",
      type: "stat",
      describe:
        "A great pine, hollow at the root, and inside it — warmth, from nothing. You could sit here a long time.",
      exits: ["lake"],
    },
    {
      id: "pack",
      name: "The pack",
      type: "combat",
      monsters: ["wolf-alpha", "rime-wolf", "rime-wolf"],
      describe:
        "Where the trees thin the pack is waiting, because it was always going to be. The big one stands up slowly.",
      exits: ["lake", "clearing"],
    },
    {
      id: "clearing",
      name: "The clearing",
      type: "boss",
      monsters: ["ice-golem", "frost-elf"],
      describe:
        "A ring of standing stones under snow. In the middle, ice stacked into the shape of a man, and it turns its head.",
      exits: ["pack", "cairn"],
    },
    {
      id: "cairn",
      name: "The cairn",
      type: "treasure",
      loot: [{ id: "rime-glass", qty: 2 }, { id: "bear-hide" }],
      describe:
        "Stones piled by hands, with things left under them for whoever came next.",
      exits: ["clearing"],
    },
  ],
  {
    kind: "dungeon",
    manager: { kind: "guild", owner: "caldermouth" },
    dormancy: 3,
  }
);

if (import.meta.hot) import.meta.hot.accept();
