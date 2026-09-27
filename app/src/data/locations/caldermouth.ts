import { Location, Npc } from "../models/location";
new Npc(
  "wenna-tarrow",
  "Wenna Tarrow",
  "Osric's kin? He drank alone. Sit; the lamp's lit either way.",
  "something-in-the-cellar",
  undefined,
  [
    {
      id: "blade",
      name: "His brother's blade",
      blurb:
        "A rusty blade and a leather cap. Osric never used them. Someone should.",
      items: [{ id: "rusty-blade" }, { id: "leather-cap" }],
    },
    {
      id: "bow",
      name: "The hunting bow",
      blurb:
        "He shot gulls off the breakwater with it, badly. Boots to go with it.",
      items: [{ id: "hunting-bow" }, { id: "worn-boots" }],
    },
    {
      id: "flask",
      name: "The flask kit",
      blurb:
        "What he actually fought with: a belt knife, oil, and things that go off.",
      items: [
        { id: "belt-knife" },
        { id: "oil-flask", qty: 4 },
        { id: "bomb", qty: 2 },
      ],
    },
  ]
);
new Npc("pell-marrow", "Pell Marrow", "…", "a-notice-for-the-yard");

new Npc("dunny-crake", "Dunny Crake", "…", "the-breakwater-lamp");
new Npc(
  "ira-vell",
  "Ira Vell",
  "Show me your hands. No — I've seen enough. Come back when you've carried something heavy."
);
new Npc("corvin-ashe", "Corvin Ashe", "…", "the-mark-on-the-stone");
new Npc(
  "tamsin-roake",
  "Tamsin Roake",
  "The wolves come down the Kiln road at dusk. Draw a bow before you talk to me."
);

new Location(
  "coast-road",
  "The coast road",
  "Salt wind, a ruined breakwater, a gate that still stands.",
  [
    { to: "town-gate", hours: 1 },
    { to: "tide-cave", hours: 1 },
  ]
);
new Location(
  "town-gate",
  "The gate",
  "Two towers, one guard, a road running down to the water.",
  [
    { to: "town-square", hours: 0 },
    { to: "coast-road", hours: 1 },
  ],
  { npcs: ["tamsin-roake"] }
);
new Location(
  "town-square",
  "The square",
  "Cobbles cracked by the wave, long since swept. The Guild hall faces the sea.",
  [
    { to: "guild-hall", hours: 0 },
    { to: "harbor-row", hours: 0 },
    { to: "gull-and-lamp", hours: 0 },
    { to: "sword-yard", hours: 0 },
    { to: "halls-yard", hours: 0 },
    { to: "town-gate", hours: 0 },
  ]
);
new Location(
  "guild-hall",
  "The Charter Guild",
  "Ledgers, a brass window, a clerk who has seen strangers before.",
  [{ to: "town-square", hours: 0 }],
  { npcs: ["pell-marrow"], hours: { open: 8, close: 18 } }
);
new Location(
  "harbor-row",
  "Harbor row",
  "Shuttered shops along the water. One is open. One has your relative's name over the door.",
  [
    { to: "town-square", hours: 0 },
    { to: "workshop", hours: 0 },
    { to: "breakwater", hours: 1 },
  ],
  { npcs: ["dunny-crake"], hours: { open: 8, close: 18 } }
);
new Location(
  "workshop",
  "Hale's apothecary",
  "Dust on the bench. Flasks in rows. A bed upstairs that was someone else's.",
  [{ to: "harbor-row", hours: 0 }],
  { requires: "workshop-key", canRest: true }
);
new Location(
  "gull-and-lamp",
  "The Gull & Lamp",
  "Low beams, one lamp, talk that stops when you enter.",
  [{ to: "town-square", hours: 0 }],
  { npcs: ["wenna-tarrow"], hours: { open: 12, close: 24 } }
);
new Location(
  "sword-yard",
  "The sword yard",
  "Packed earth, a rack of blunt blades, an old man watching.",
  [{ to: "town-square", hours: 0 }],
  { npcs: ["ira-vell"], hours: { open: 6, close: 20 } }
);
new Location(
  "halls-yard",
  "The Halls' outer yard",
  "Weeds through flagstones. The great doors beyond are sealed.",
  [{ to: "town-square", hours: 0 }],
  { npcs: ["corvin-ashe"], hours: { open: 8, close: 18 } }
);

new Location(
  "breakwater",
  "The breakwater",
  "Wet stone, a quarter mile of it, half of it missing. At the end, a lamp on an iron post, facing a sea that took the rest.",
  [{ to: "harbor-row", hours: 1 }]
);
// harbor-row exits: add { to: "breakwater", hours: 1 }
