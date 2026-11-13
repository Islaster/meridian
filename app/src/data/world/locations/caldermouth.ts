import { Location, Npc } from "@/models/location";
import { lienNotice, settleLien } from "@/systems/lien";
import { LIEN } from "@/data/money/lien";
import { shelf } from "@/data/items/forge";
import { roaming } from "@/systems/presence";
import { oaths, practice } from "@/systems/classes";

//NPC
new Npc(
  "pell-marrow",
  "Pell Marrow",
  "The Guild keeps the deeds. Show me the letter and we'll see whose name is on yours.",
  { offers: ["deliver-the-notice"] }
);
new Npc(
  "wenna-tarrow",
  "Wenna Tarrow",
  "Osric's kin? He drank alone. Sit; the lamp's lit either way.",
  {
    offers: ["something-in-the-cellar"],
    lends: [
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
    ],
  }
);
new Npc(
  "dunny-crake",
  "Dunny Crake",
  "Flasks, oil, salt fish. Guild prices, don't look at me.",
  { offers: ["walk-the-breakwater"], hours: { open: 8, close: 18 } }
);

new Npc(
  "tamsin-roake",
  "Tamsin Roake",
  "The wolves come down the Kiln road at dusk. Draw a bow before you talk to me.",
  { offers: ["wolves-on-the-kiln-road"] }
);
new Npc(
  "corvin-ashe",
  "Corvin Ashe",
  "My master went into the deep. I teach what he left me, which is less than you'd hope.",
  { offers: ["find-the-mark"] }
);
// The hall's masters. They live there, each with a room for the craft, and keep a week:
// mornings in their rooms, afternoons out in the town where the craft is, evenings on the hall floor.
// Days are 0–6 from the first day of the week. Each name they teach opens at its own level — the class says which.
new Npc(
  "ira-vell",
  "Ira Vell",
  "Show me your hands. No — I've seen enough. Come back when you've carried something heavy.",
  {
    offers: ["deliver-the-notice", "first-forms", "the-weight"],
    home: { location: "hall" },
    week: [
      { at: "hall-yard", open: 6, close: 13 },
      { at: "sword-yard", open: 13, close: 18, days: [1, 3, 5] },
      { at: "hall-yard", open: 13, close: 18, days: [0, 2, 4, 6] },
    ],
    actions: [
      {
        at: "hall-yard",
        id: "practice-ira-vell",
        repeat: true,
        hours: 4,
        label: "Drill in the yard",
        effect: practice("ira-vell"),
        text: "Forms with a blunt blade, alone, while the old man watches nothing in particular.",
      },
      ...oaths("ira-vell", "Ira").map((a) => ({ ...a, at: "hall-yard" })),
    ],
  }
);
new Npc(
  "maud-kestrel",
  "Maud Kestrel",
  "You breathe when you draw. Everyone does, until they don't.",
  {
    offers: ["forms-maud-kestrel"],
    home: { location: "hall" },
    week: [
      { at: "hall-yard", open: 7, close: 12 },
      { at: "the-butts", open: 12, close: 18, days: [0, 2, 4] },
      { at: "hall-yard", open: 12, close: 18, days: [1, 3, 5, 6] },
    ],
    actions: [
      {
        at: "hall-yard",
        id: "practice-maud-kestrel",
        repeat: true,
        hours: 4,
        label: "Loose at the straw",
        effect: practice("maud-kestrel"),
        text: "A quiver, a straw man, and a woman who doesn't look up.",
      },
      ...oaths("maud-kestrel", "Maud").map((a) => ({ ...a, at: "hall-yard" })),
    ],
  }
);
new Npc(
  "tobin-ashe",
  "Tobin Ashe",
  "If it breaks, it wasn't made. Say what you want or get out of the heat.",
  {
    offers: [],
    home: { location: "hall" },
    week: [
      { at: "hall-smithy", open: 6, close: 12 },
      { at: "the-forge", open: 12, close: 19, days: [1, 2, 4, 5] },
      { at: "hall-smithy", open: 12, close: 19, days: [0, 3, 6] },
    ],
    actions: [
      {
        at: "hall-smithy",
        id: "practice-tobin-ashe",
        repeat: true,
        hours: 4,
        label: "Work the bellows",
        effect: practice("tobin-ashe"),
        text: "Pump, wait, pump. The bar comes to heat on Tobin's count, not yours.",
      },
      ...oaths("tobin-ashe", "Tobin").map((a) => ({ ...a, at: "hall-smithy" })),
    ],
  }
);
new Npc(
  "hesper-quill",
  "Hesper Quill",
  "Don't touch that. Or that. Sit, if you must.",
  {
    offers: [],
    home: { location: "hall" },
    week: [
      { at: "hall-still", open: 9, close: 13 },
      { at: "the-stillroom", open: 13, close: 17, days: [0, 1, 3] },
      { at: "hall-still", open: 13, close: 17, days: [2, 4, 5, 6] },
    ],
    actions: [
      {
        at: "hall-still",
        id: "practice-hesper-quill",
        repeat: true,
        hours: 4,
        label: "Grind at the bench",
        effect: practice("hesper-quill"),
        text: "Pestle and mortar until your wrist burns. She corrects the grip once and says nothing else.",
      },
      ...oaths("hesper-quill", "Hesper").map((a) => ({
        ...a,
        at: "hall-still",
      })),
    ],
  }
);
new Npc(
  "orrin-vey",
  "Orrin Vey",
  "Tide's turning. You can feel it if you stop talking.",
  {
    offers: ["forms-orrin-vey"],
    home: { location: "hall" },
    week: [
      { at: "hall-cistern", open: 10, close: 15 },
      { at: "lantern-house", open: 15, close: 22, days: [2, 3, 6] },
      { at: "hall-cistern", open: 15, close: 22, days: [0, 1, 4, 5] },
    ],
    actions: [
      {
        at: "hall-cistern",
        id: "practice-orrin-vey",
        repeat: true,
        hours: 4,
        label: "Breathe with the swell",
        effect: practice("orrin-vey"),
        text: "Out when it goes out, in when it comes in. An hour in, you stop counting.",
      },
      ...oaths("orrin-vey", "Orrin").map((a) => ({ ...a, at: "hall-cistern" })),
    ],
  }
);
new Npc(
  "dessa-marl",
  "Dessa Marl",
  "Mind the kiln. It's the only one still warm, and it bites.",
  {
    offers: ["forms-dessa-marl"],
    home: { location: "hall" },
    week: [
      { at: "hall-kiln", open: 8, close: 12 },
      { at: "the-kilns", open: 12, close: 16, days: [1, 4] },
      { at: "hall-kiln", open: 12, close: 16, days: [0, 2, 3, 5, 6] },
    ],
    actions: [
      {
        at: "hall-kiln",
        id: "practice-dessa-marl",
        repeat: true,
        hours: 4,
        label: "Feed the kiln",
        effect: practice("dessa-marl"),
        text: 'Charcoal in, draught open, draught closed. She says "less" twice and nothing else.',
      },
      ...oaths("dessa-marl", "Dessa").map((a) => ({ ...a, at: "hall-kiln" })),
    ],
  }
);

//Locations
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
    { to: "town-square" },
    { to: "coast-road", hours: 1 },
    { to: "kiln-road", hours: 1 },
    { to: "the-butts" },
  ],
  {
    npcs: ["tamsin-roake"],
    actions: [
      {
        id: "the-mark",
        quest: "find-the-mark",
        label: "Inspect the wall",
        text: "Under the salt stain, cut shallow and old: a circle with a line through it. Someone wanted this found, and not by everyone.",
      },
    ],
  }
);
new Location(
  "town-square",
  "The square",
  "Cobbles cracked by the wave, long since swept. The Guild hall faces the sea.",
  [
    { to: "guild-hall" },
    { to: "harbor-row" },
    { to: "gull-and-lamp" },
    { to: "sword-yard" },
    { to: "halls-yard" },
    { to: "town-gate" },
  ]
);
new Location(
  "guild-hall",
  "The Charter Guild",
  "Ledgers, a brass window, a clerk who has seen strangers before.",
  [{ to: "town-square" }],
  {
    npcs: ["pell-marrow"],
    hours: { open: 8, close: 18 },
    shop: {
      stock: [
        "minor-potion",
        "potion",
        "dried-fish",
        "oil-flask",
        "bomb",
        "rusty-blade",
        "leather-cap",
        "traveler-cloak",
        "felt-cap",
        "fur-lined-boots",
        "rations",
        "camp-pack",
      ],
      ranked: { 1: shelf(1), 2: shelf(2) },
      cut: 0.15,
    },
    board: {
      onLocked: (s) => {
        const n = (s.counters["nag:board"] ?? 0) + 1;
        const next = { ...s, counters: { ...s.counters, "nag:board": n } };
        const { lck, cha } = s.player.stats;
        if (n >= 5 && lck >= 10 && cha >= 15)
          return {
            say: "Fine. You've worn me down, and you've the face for it. Card's yours — don't tell Tamsin I did that.",
            next: {
              ...next,
              player: { ...next.player, rank: 1 },
              done: [...next.done, "act:license"],
            },
          };
        const says = [
          `The board's for members, ${s.player.name}. Fifty gold and you're one.`,
          "Still fifty.",
          "It was fifty a minute ago. It's fifty now.",
          "You're wearing a groove in my floor.",
        ];
        return { say: says[Math.min(n - 1, says.length - 1)], next };
      },
    },
    notices: [lienNotice],
    actions: [
      {
        id: "license",
        label: "The main desk · ask Pell for a license",
        gold: 50,
        requires: { complete: ["journal-to-pell"] },
        effect: (s) => ({ ...s, player: { ...s.player, rank: 1 } }),
        text: 'Pell stamps a card and slides it under the brass. Rank F. "It gets you past the gates the Guild keeps. The rest you earn."',
      },
      {
        id: "pay-lien",
        quest: "settle-the-lien",
        gold: LIEN.amount,
        effect: settleLien,
        label: "Settle Fenn's lien",
        text: "Twelve thousand, counted twice.",
      },
    ],
  }
);
new Location(
  "harbor-row",
  "Harbor row",
  "Shuttered shops along the water. One is open. One has your relative's name over the door.",
  [
    { to: "town-square" },
    { to: "hall" },
    { to: "the-forge" },
    { to: "the-stillroom" },
    { to: "lantern-house", hours: 0.5 },
    { to: "breakwater", hours: 1 },
    { to: "the-shingle" },
  ],
  { npcs: ["dunny-crake"] }
);
new Location(
  "hall",
  "Training Hall (Home)",
  "A training hall with its teachers in it. The practice floor runs the length of the room; doors off it go to the yard, the smithy, the still, the cistern and the kiln, and the six who keep them come and go by the hour. Osric's rooms are up the stair, and under the boards by the far wall there is a trapdoor.",
  [
    { to: "harbor-row" },
    { to: "hall-yard", hours: 0 },
    { to: "hall-smithy", hours: 0 },
    { to: "hall-still", hours: 0 },
    { to: "hall-cistern", hours: 0 },
    { to: "hall-kiln", hours: 0 },
    { to: "hall-cellar", hours: 0 },
  ],
  {
    requires: "hall-key",
    canRest: true,
    deed: "act:pay-lien",
    // the floor is the outline; the rooms sit off it, the door onto the row at the bottom
    plan: {
      size: [8, 5],
      boxes: {
        "harbor-row": [3, 4.3, 2.5, 0.7],
        "hall-yard": [0, 0, 3, 2.2],
        "hall-smithy": [3.3, 0, 2.2, 2.2],
        "hall-kiln": [5.8, 0, 2.2, 2.2],
        "hall-still": [0, 2.7, 2, 1.1],
        "hall-cistern": [0, 4, 3, 1],
        "hall-cellar": [5.5, 3.6, 2.5, 1.4],
      },
    },
  }
);
new Location(
  "hall-yard",
  "The hall's yard",
  "Packed earth between the hall and the wall, a rack of blunt blades, straw men at the far end.",
  [{ to: "hall" }]
);
new Location(
  "hall-smithy",
  "The hall's smithy",
  "A lean-to off the yard with a forge in it that was cold for twenty years and isn't now.",
  [{ to: "hall" }],
  { bench: { craft: "smith", label: "The hall's anvil" } }
);
new Location(
  "hall-still",
  "The still",
  "A narrow room under the stair. Shelves to the ceiling, every bottle labeled, and a smell of salt and something bitter.",
  [{ to: "hall" }],
  { bench: { craft: "alchemy", label: "The hall's still" } }
);
new Location(
  "hall-cistern",
  "The cistern",
  "Stone steps down to a tank the sea fills through a grate. The water rises and falls with the harbor, and so does the air.",
  [{ to: "hall" }]
);
new Location(
  "hall-kiln",
  "The hall's kiln",
  "One brick kiln in the back court, kept warm, with charcoal stacked under oilcloth beside it.",
  [{ to: "hall" }],
  { bench: { craft: "smith", label: "The hall's kiln" } }
);
new Location(
  "gull-and-lamp",
  "The Gull & Lamp",
  "Low beams, one lamp, talk that stops when you enter.",
  [{ to: "town-square" }],
  { npcs: ["wenna-tarrow"], hours: { open: 12, close: 24 } }
);
new Location(
  "sword-yard",
  "The sword yard",
  "Packed earth, a rack of blunt blades. Some afternoons, an old man watching.",
  [{ to: "town-square" }],
  {
    hours: { open: 6, close: 20 },
  }
);
new Location(
  "halls-yard",
  "The Halls' outer yard",
  "Weeds through flagstones. The great doors beyond are sealed.",
  [{ to: "town-square" }],
  { npcs: ["corvin-ashe"], hours: { open: 8, close: 18 } }
);

new Location(
  "breakwater",
  "The breakwater",
  "Wet stone, a quarter mile of it, half of it missing. At the end, a lamp on an iron post, facing a sea that took the rest.",
  [{ to: "harbor-row", hours: 1 }]
);

new Location(
  "kiln-road",
  "The kiln road",
  "A brick road climbing out of town toward the old kiln yard. Cart-ruts, hoof-prints, and lately paw-prints over both.",
  [
    { to: "town-gate", hours: 1 },
    { to: "the-kilns", hours: 0.5 },
  ],
  {
    roam: {
      monsters: ["kiln-wolf", "kiln-wolf", "wolf-alpha"],
      when: "night",
      chance: 0.5,
      text: "They come out of the dark where the road bends: two, then the big one. It's done by the time the moon clears the hill.",
    },
    notices: [
      (s) =>
        roaming(s, Location.get("kiln-road"))
          ? "Fresh prints in the ruts, big ones, crossing and crossing back. They'll be out tonight."
          : null,
    ],
  }
);

new Location(
  "the-kilns",
  "The kilns",
  "Six brick kilns, sheds, a chimney, all cold. Between the second and third kilns a slit of ember light stands ten feet tall and three wide and no thicker than a blade's edge; walk around it and it's a line in the air. The kilnmen left the year it opened. The Guild has held it since.",
  [
    { to: "kiln-road", hours: 0.5 },
    { to: "kilns-cold" }, // the gate — exits.tsx greys it with the Guild's admission reason
  ],
  {
    bench: { craft: "smith", label: "The third kiln" },
  }
);

new Location(
  "the-butts",
  "The butts",
  "A strip of trampled grass along the inside of the wall, straw men at the far end, and a woman waxing a string.",
  [{ to: "town-gate" }],
  {
    hours: { open: 7, close: 18 },
  }
);

new Location(
  "the-forge",
  "The forge",
  "Heat you feel from the street. One man, one anvil, and a bar of iron that is being argued with.",
  [{ to: "harbor-row" }],
  {
    hours: { open: 6, close: 19 },
    bench: { craft: "smith", label: "The anvil" },
  }
);

new Location(
  "the-stillroom",
  "The stillroom",
  "A narrow room behind a narrow door. Shelves to the ceiling, every bottle labeled, and a smell of salt and something bitter.",
  [{ to: "harbor-row" }],
  {
    hours: { open: 9, close: 17 },
    bench: { craft: "alchemy", label: "The still" },
  }
);

new Location(
  "lantern-house",
  "The lantern house",
  "The old light on the point, its lamp trimmed but unlit by day. The sea is loud here in a way it isn't in town.",
  [{ to: "harbor-row", hours: 0.5 }],
  {
    hours: { open: 10, close: 22 },
  }
);
new Location(
  "the-shingle",
  "The Shingle",
  "Grey stones under the headland. The cliff weeps green where the copper is, and the ebb leaves kelp in rows.",
  [{ to: "harbor-row" }]
);
