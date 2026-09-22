// Opening sequence — configuration. Tune numbers here, never in the engine.
import type { Layout, Shot } from "./types";

export const VIEW = { overscan: 0.92 }; // fraction of the plate visible; the rest is the hidden overflow

export const PALETTE = {
  seamCore: "#eef3ff",
  seamGlow: "#9fb4ff",
  ember: "#ff7a2f",
  emberBright: "#ffb15c",
  star: "#dfe6ff",
  gull: "#3a4358",
  smoke: "#04060b",
  ash: "#b3b7bc",
  crest: "#c9d7ff",
  seaDark: "#0b1220",
  cardText: "rgba(233,236,242,0.92)",
  titleText: "rgba(226,231,240,0.96)",
} as const;

// Where things are in YOUR plates, as fractions of width/height. Measure once on the master.
export const LAYOUT: Layout = {
  tip: { x: 0.71, y: 0.27 },
  seamTop: 0.05,
  horizon: 0.69,
  town: { x0: 0.0, x1: 0.4, y0: 0.42, y1: 0.72 },
  chimneys: [
    { x: 0.14, y: 0.5 },
    { x: 0.22, y: 0.49 },
    { x: 0.3, y: 0.52 },
  ],
};

export const CARDS = [
  "A world of dungeons, and those who delve them.",
  "The old stories say the dungeons were doors, once.",
  "The strongest climbed from the dungeons and became legends.",
  "Until the day the doors remembered them.",
  "And the age of masters ended.",
];
export const TITLE = "MERIDIAN";

export const TRANSITION = { iris: 0.55, flash: 0.35, card: 0.45 } as const;

// Shots play in order. fx entries are [name, params]; order within a shot matters.
export const SHOTS: Shot[] = [
  { type: "card", text: CARDS[0], dur: 3.0 },
  {
    type: "plate",
    id: "day",
    dur: 6.0,
    cam: [1.0, 1.04],
    in: "cut",
    out: "cut",
    cue: "coast",
    fx: [["gulls", { flee: false }]],
  },
  { type: "card", text: CARDS[1], dur: 2.8 },
  {
    type: "plate",
    id: "halfdark",
    base: "day",
    dur: 5.5,
    cam: [1.04, 1.06],
    in: "iris",
    out: "cut",
    cue: "gullsStop",
    fx: [["drain"], ["shimmer", { amp: 0.15 }], ["gulls", { flee: true }]],
  },
  { type: "card", text: CARDS[2], dur: 2.8 },
  {
    type: "plate",
    id: "night",
    dur: 4.5,
    cam: [1.06, 1.08],
    in: "iris",
    out: "iris",
    cue: "wind",
    fx: [["shimmer", { amp: 0.12 }], ["windowFlicker"]],
  },
  { type: "card", text: CARDS[3], dur: 3.4 },
  {
    type: "plate",
    id: "converged",
    dur: 5.0,
    cam: [1.08, 1.08],
    rumble: 1,
    in: "iris",
    out: "flash",
    cue: "rumble",
    fx: [["shimmer", { amp: 0.1 }], ["windowFlicker"]],
  },
  {
    type: "plate",
    id: "lightning",
    dur: 4.0,
    cam: [1.08, 1.1],
    in: "flash",
    out: "iris",
    cue: "crack",
    fx: [["shimmer", { amp: 0.1 }], ["windowFlicker"]],
  },
  { type: "card", text: CARDS[4], dur: 2.8 },
  {
    type: "plate",
    id: "eruption",
    dur: 6.0,
    cam: [1.0, 1.06],
    rumble: 1,
    in: "iris",
    out: "cut",
    cue: "eruption",
    fx: [["lavaFlow"], ["eruptionGlow"], ["embers"]],
  },
  {
    type: "plate",
    id: "smoke",
    dur: 6.0,
    cam: [1.06, 1.06],
    in: "cut",
    out: "cut",
    cue: "smoke",
    fx: [
      ["lavaFlow", { amp: 0.15 }],
      ["embers", { sparse: true }],
      [
        "smokeFlash",
        {
          loop: false,
          rate: 4,
          region: { x0: 0, y0: 0, x1: 0.85, y1: 0.55 },
          radius: 0.2,
        },
      ],
      ["smokeGlow", { radius: 0.55, amp: 0.5 }],
      ["silhouettes"],
      ["dissolve", { plate: "tsunami", startP: 0.7 }],
    ],
  },
  {
    type: "plate",
    id: "tsunami",
    dur: 5.0,
    cam: [1.0, 1.0],
    in: "cut",
    out: "cut",
    cue: "wave",
    fx: [
      ["shimmer", { amp: 0.1 }],
      ["embers", { sparse: true }],
      [
        "smokeFlash",
        {
          loop: true,
          rate: 4,
          region: { x0: 0, y0: 0, x1: 0.85, y1: 0.55 },
          radius: 0.2,
        },
      ],
      ["smokeGlow", { radius: 0.55, amp: 0.5 }],
    ],
  },
  {
    type: "plate",
    id: "tsunamiMotion",
    dur: 2,
    cam: [1, 1],
    in: "cut",
    out: "flash",
    fx: [
      [
        "smokeFlash",
        {
          loop: true,
          rate: 4,
          region: { x0: 0, y0: 0, x1: 0.85, y1: 0.55 },
          radius: 0.2,
        },
      ],
      ["smokeGlow", { radius: 0.55, amp: 0.5 }],
    ],
  },
  {
    type: "plate",
    id: "impact",
    dur: 2.0,
    cam: [1, 1],
    in: "cut",
    out: "flash",
    fx: [
      [
        "smokeFlash",
        {
          loop: true,
          rate: 4,
          region: { x0: 0, y0: 0, x1: 0.85, y1: 0.55 },
          radius: 0.2,
        },
      ],
      ["smokeGlow", { radius: 0.55, amp: 0.5 }],
    ],
  },
  {
    type: "plate",
    id: "aftermath",
    dur: 12.0,
    cam: [1.06, 1.0],
    in: "flash",
    out: "none",
    cue: "silence",
    fx: [["shimmer", { amp: 0.06 }], ["ash"]],
    title: { start: 2.0, fade: 3.0 },
  },
];
