import { Location, Npc } from "../../../models/location";
import { lienNotice, settleLien } from "../../../systems/lien";
import { LIEN } from "../../money/lien";
import { shelf } from "../../items/forge";
import { roaming } from "../../../systems/presence";
import { oaths, practice } from "../../../systems/classes";

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
new Npc(
  "ira-vell",
  "Ira Vell",
  "Show me your hands. No — I've seen enough. Come back when you've carried something heavy.",
  {
    offers: [
      "meet-ira-vell",
      "the-yard-trial",
      "first-forms",
      "the-weight",
      "bring-ira-home",
    ],
    home: { location: "hall", when: "resident:ira-vell" },
    actions: [
      {
        at: "sword-yard",
        id: "practice-ira-vell",
        repeat: true,
        hours: 4,
        label: "Practice in the yard",
        requires: { flags: ["met:ira-vell"] },
        effect: practice("ira-vell", 2),
        text: "Forms with a blunt blade, alone, while the old man watches nothing in particular.",
      },
      ...oaths("ira-vell", "Ira").map((a) => ({ ...a, at: "sword-yard" })),
    ],
  }
);
new Npc(
  "maud-kestrel",
  "Maud Kestrel",
  "You breathe when you draw. Everyone does, until they don't.",
  {
    offers: [
      "meet-maud-kestrel",
      "trial-maud-kestrel",
      "forms-maud-kestrel",
      "home-maud-kestrel",
    ],
    home: { location: "hall", when: "resident:maud-kestrel" },
    actions: [
      {
        at: "the-butts",
        id: "practice-maud-kestrel",
        repeat: true,
        hours: 4,
        label: "Loose at the butts",
        requires: { flags: ["met:maud-kestrel"] },
        effect: practice("maud-kestrel", 2),
        text: "A quiver, a straw man, and a woman who doesn't look up.",
      },
      ...oaths("maud-kestrel", "Maud").map((a) => ({ ...a, at: "the-butts" })),
    ],
  }
);
new Npc(
  "tobin-ashe",
  "Tobin Ashe",
  "If it breaks, it wasn't made. Say what you want or get out of the heat.",
  {
    offers: ["meet-tobin-ashe", "trial-tobin-ashe", "home-tobin-ashe"],
    home: { location: "hall", when: "resident:tobin-ashe" },
    actions: [
      {
        at: "the-forge",
        id: "practice-tobin-ashe",
        repeat: true,
        hours: 4,
        label: "Work the bellows",
        requires: { flags: ["met:tobin-ashe"] },
        effect: practice("tobin-ashe", 2),
        text: "Pump, wait, pump. The bar comes to heat on Tobin's count, not yours.",
      },
      ...oaths("tobin-ashe", "Tobin").map((a) => ({ ...a, at: "the-forge" })),
    ],
  }
);
new Npc(
  "hesper-quill",
  "Hesper Quill",
  "Don't touch that. Or that. Sit, if you must.",
  {
    offers: ["meet-hesper-quill", "trial-hesper-quill", "home-hesper-quill"],
    home: { location: "hall", when: "resident:hesper-quill" },
    actions: [
      {
        at: "the-stillroom",
        id: "practice-hesper-quill",
        repeat: true,
        hours: 4,
        label: "Grind in the stillroom",
        requires: { flags: ["met:hesper-quill"] },
        effect: practice("hesper-quill", 2),
        text: "Pestle and mortar until your wrist burns. She corrects the grip once and says nothing else.",
      },
      ...oaths("hesper-quill", "Hesper").map((a) => ({
        ...a,
        at: "the-stillroom",
      })),
    ],
  }
);
new Npc(
  "orrin-vey",
  "Orrin Vey",
  "Tide's turning. You can feel it if you stop talking.",
  {
    offers: [
      "meet-orrin-vey",
      "trial-orrin-vey",
      "forms-orrin-vey",
      "home-orrin-vey",
    ],
    home: { location: "hall", when: "resident:orrin-vey" },
    actions: [
      {
        at: "lantern-house",
        id: "practice-orrin-vey",
        repeat: true,
        hours: 4,
        label: "Breathe with the swell",
        requires: { flags: ["met:orrin-vey"] },
        effect: practice("orrin-vey", 2),
        text: "Out when it goes out, in when it comes in. An hour in, you stop counting.",
      },
      ...oaths("orrin-vey", "Orrin").map((a) => ({
        ...a,
        at: "lantern-house",
      })),
    ],
  }
);
new Npc(
  "dessa-marl",
  "Dessa Marl",
  "Mind the third kiln. It's the only one still warm, and it bites.",
  {
    offers: [
      "meet-dessa-marl",
      "trial-dessa-marl",
      "forms-dessa-marl",
      "home-dessa-marl",
    ],
    hours: { open: 8, close: 16 },
    home: { location: "hall", when: "resident:dessa-marl" },
    actions: [
      {
        at: "the-kilns",
        id: "practice-dessa-marl",
        repeat: true,
        hours: 4,
        label: "Feed the kiln",
        requires: { flags: ["met:dessa-marl"] },
        effect: practice("dessa-marl", 2),
        text: 'Charcoal in, draught open, draught closed. She says "less" twice and nothing else.',
      },
      ...oaths("dessa-marl", "Dessa").map((a) => ({ ...a, at: "the-kilns" })),
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
      {
        id: "yard-receipt",
        quest: "errand-ira-vell-2",
        label: "Ask Pell for the yard's receipt",
        text: 'Pell writes it without looking up. "Sweat. Received in full." He stamps it anyway.',
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
    { to: "breakwater", hours: 1 },
    { to: "the-shingle" },
  ],
  { npcs: ["dunny-crake"] }
);
new Location(
  "hall",
  "Training Hall (Home)",
  "A training hall with nobody training in it. The practice floor runs the length of the room, swept once and not since; the racks along the wall hold dust. Off the far end, the teachers' quarters stand open on stripped beds. Osric's rooms are up the stair, and under the boards by the far wall there is a trapdoor.",
  [{ to: "harbor-row" }, { to: "hall-cellar" }],
  {
    requires: "hall-key",
    canRest: true,
    after: [
      {
        when: "resident:ira-vell",
        describe:
          "The practice floor is swept and the first rack on the wall holds blades, oiled and in order — Ira's. The far quarters have a lamp in them after dark. Osric's rooms are up the stair; the trapdoor is under the boards by the far wall.",
      },
    ],
    deed: "act:pay-lien",
    upgrades: [
      {
        id: "hall-quarters",
        name: "Teachers' quarters",
        opens: "a master can live here",
        gold: 60,
        items: [
          { id: "kelp-fiber", qty: 6 },
          { id: "crab-shell", qty: 4 },
        ],
        hours: 3,
        text: "Rope, shell and a day's sweat. The far quarters have beds in them again, and a door that shuts.",
      },
    ],
  }
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
  "Packed earth, a rack of blunt blades, an old man watching.",
  [{ to: "town-square" }],
  {
    npcs: ["ira-vell"],
    hours: { open: 6, close: 20 },
    actions: [
      {
        id: "yard-trial",
        quest: "the-yard-trial",
        label: "Stand in the ring",
        fight: ["yards-second"],
        text: "It lasts longer than it should and ends faster than you expect. Ira's second lowers his blade and steps out of the ring without a word.",
      },
      {
        id: "train-forms",
        quest: "first-forms",
        hours: 4,
        label: "Train until dusk",
        text: "Forms until your arms shake, then forms until they stop. Ira corrects your feet twice and says nothing else all afternoon.",
      },
    ],
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
      monsters: ["kiln-wolf", "kiln-wolf", "grey-alpha"],
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
    npcs: ["dessa-marl"],
    actions: [
      {
        id: "the-cold-kiln",
        quest: "trial-dessa-marl",
        label: "Open the third kiln",
        fight: ["ash-wisp"],
        text: "A coal that drifts. It burns from where you aren't, until you stop chasing it and close the draught. Dessa watches the kiln, not you.",
      },
      {
        id: "tend-the-fire",
        quest: "forms-dessa-marl",
        hours: 4,
        label: "Tend the fire till dusk",
        text: "Too hot, then too cold, then — for an hour nobody mentions — right. Your hands know before you do.",
      },
    ],
    bench: { craft: "smith", label: "The third kiln" },
  }
);

new Location(
  "the-butts",
  "The butts",
  "A strip of trampled grass along the inside of the wall, straw men at the far end, and a woman waxing a string.",
  [{ to: "town-gate" }],
  {
    npcs: ["maud-kestrel"],
    hours: { open: 7, close: 18 },
    actions: [
      {
        id: "loose-at-the-mark",
        quest: "trial-maud-kestrel",
        label: "Loose at the mark",
        fight: ["running-mark"],
        text: "A straw man on a rope, and someone on the far end who hates you. Three in the dirt, then one in the straw. Maud lets the rope go slack.",
      },
      {
        id: "loose-till-dark",
        quest: "forms-maud-kestrel",
        hours: 4,
        label: "Loose till dark",
        text: "A hundred arrows, then a hundred more. By the end she isn't watching your hands anymore, which is the only praise she has.",
      },
    ],
  }
);

new Location(
  "the-forge",
  "The forge",
  "Heat you feel from the street. One man, one anvil, and a bar of iron that is being argued with.",
  [{ to: "harbor-row" }],
  {
    npcs: ["tobin-ashe"],
    hours: { open: 6, close: 19 },
    actions: [
      {
        id: "forge-blank",
        quest: "trial-tobin-ashe",
        hours: 3,
        label: "Work the iron",
        text: "The bar fights you for an hour and then, somewhere in the second, stops. What comes off the anvil is ugly and straight. Tobin turns it over twice and grunts.",
      },
    ],
    bench: { craft: "smith", label: "The anvil" },
  }
);

new Location(
  "the-stillroom",
  "The stillroom",
  "A narrow room behind a narrow door. Shelves to the ceiling, every bottle labeled, and a smell of salt and something bitter.",
  [{ to: "harbor-row" }],
  {
    npcs: ["hesper-quill"],
    hours: { open: 9, close: 17 },
    actions: [
      {
        id: "first-draught",
        quest: "trial-hesper-quill",
        hours: 3,
        label: "Brew under her eye",
        text: "She says nothing for three hours, which you learn is how she teaches. What's in the flask at the end is cloudy, and it works.",
      },
    ],
    bench: { craft: "alchemy", label: "The still" },
  }
);

new Location(
  "lantern-house",
  "The lantern house",
  "The old light on the point, its lamp trimmed but unlit by day. The sea is loud here in a way it isn't in town.",
  [{ to: "harbor-row", hours: 0.5 }],
  {
    npcs: ["orrin-vey"],
    hours: { open: 10, close: 22 },
    actions: [
      {
        id: "the-lamp-wisp",
        quest: "trial-orrin-vey",
        label: "Open the lamp",
        fight: ["lamp-wisp"],
        text: "It comes out of the lamp like a breath and goes for your eyes. You learn, fast, where it won't go. When it gutters, Orrin closes the lamp on it without hurry.",
      },
      {
        id: "sit-with-the-tide",
        quest: "forms-orrin-vey",
        hours: 4,
        label: "Sit through the tide",
        text: "Six hours of the sea going out and coming back. Somewhere in the fifth you stop hearing it and start feeling where it is.",
      },
    ],
  }
);
new Location(
  "the-shingle",
  "The Shingle",
  "Grey stones under the headland. The cliff weeps green where the copper is, and the ebb leaves kelp in rows.",
  [{ to: "harbor-row" }]
);
