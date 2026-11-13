import { Dungeon } from "@/models/dungeon";

new Dungeon(
  "hall-cellar",
  "The Hall cellar",
  0,
  {
    level: 0,
    rank: 0,
    party: [1, 1],
    environment:
      "A stone cellar under Osric's shop. Shelves of jars, most of them broken.",
    arrival:
      "The trapdoor was not locked. Something has been scratching down there.",
    monsters: ["cellar-rat", "rat-king"],
    materials: ["salt-crystal"],
  },
  [
    {
      id: "steps",
      name: "The steps",
      type: "empty",
      describe:
        "Stone steps down from behind the counter. Cold air, and the smell of spilled tinctures.",
      exits: ["hall", "stores"],
    },
    {
      id: "stores",
      name: "The stores",
      type: "combat",
      monsters: ["cellar-rat", "cellar-rat", "cellar-rat"],
      describe:
        "Osric's stores. Sacks torn open, jars swept off the shelves. Rats, and not few.",
      exits: ["steps", "nest"],
    },
    {
      id: "nest",
      name: "The nest",
      type: "boss",
      monsters: ["rat-king"],
      describe:
        "A hole chewed through the back wall, wide enough to crawl. Whatever is in there is bigger than a rat.",
      exits: ["stores"],
    },
  ],
  {
    // down the steps, through the stores, to the hole in the back wall
    plan: {
      size: [6, 4],
      door: [0, 0, 1.8, 0.8],
      boxes: {
        steps: [0, 1.2, 1.8, 1.6],
        stores: [2.2, 0.8, 2, 2.4],
        nest: [4.5, 1.4, 1.5, 1.4],
      },
    },
  }
);
