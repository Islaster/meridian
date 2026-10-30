import { Dungeon } from "../models/dungeon";

new Dungeon(
  "tide-cave",
  "The tide cave",
  1,
  {
    level: 1,
    rank: 0,
    party: [1, 2],
    environment:
      "A sea cave under the broken breakwater, dry only at low tide.",
    arrival: "Low tide has left the entrance open.",
    monsters: ["cave-goblin", "goblin-slinger", "tide-crab"],
    materials: ["salt-crystal", "kelp-fiber"],
  },
  [
    {
      id: "mouth",
      name: "The mouth",
      type: "empty",
      exits: ["coast-road", "first"],
      describe:
        "Low tide has left the entrance open, a black arch under the breakwater's broken end. Wet sand, the smell of salt and something older. Osric's boot prints, maybe, long since softened.",
      harvest: {
        id: "kelp-fiber",
        hours: 1,
        text: "Shards along the shore that never melt, even in your hand.",
      },
    },
    {
      id: "first",
      name: "The first chamber",
      type: "combat",
      exits: ["mouth", "narrows"],
      monsters: ["cave-goblin", "cave-goblin"],
      describe:
        "Wider than it should be. Firelight where there shouldn't be any — a camp, two shapes rising from it.",
    },
    {
      id: "narrows",
      name: "The narrows",
      type: "trap",
      exits: ["first", "third", "pool"],
      trap: {
        stat: "dex",
        dc: 7,
        damage: 6,
        pass: "The ceiling groans and lets go. You're already through.",
        fail: "The ceiling groans and lets go. Not fast enough — rock across your shoulders, and blood in your mouth.",
      },
      describe:
        "A crawl between two slabs, the stone above cracked and hanging. The tide has been in and out of here ten thousand times. It only needs to be once more.",
    },
    {
      id: "third",
      name: "The third chamber",
      type: "treasure",
      exits: ["narrows"],
      loot: [{ id: "salt-crystal", qty: 2 }, { id: "minor-potion" }],
      describe:
        "A dry shelf above the waterline. Someone kept things here: a crate, a lamp, a chalk mark on the left wall at waist height.",
    },
    {
      id: "pool",
      name: "The deep pool",
      type: "boss",
      exits: ["narrows"],
      monsters: ["tide-crab", "goblin-slinger"],
      describe:
        "The cave ends in black water. Something armored moves beneath it, and something small and quick moves above, on the ledge, with a sling.",
      harvest: {
        id: "salt-crystal",
        hours: 1,
        text: "Shards along the shore that never melt, even in your hand.",
      },
    },
  ]
);
