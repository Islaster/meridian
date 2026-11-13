import { City } from "@/models/city";

// Caldermouth, drawn: the gate at the top of the hill, the square in the middle,
// the row along the water at the bottom, the breakwater running out into the sea.
new City(
  "caldermouth",
  "Caldermouth",
  "meridian-coast",
  "charter-guild",
  2,
  1,
  {
    plan: {
      size: [12, 8],
      boxes: {
        "coast-road": [0, 0, 3, 1.4],
        "town-gate": [3.4, 0, 2.6, 1.4],
        "kiln-road": [6.4, 0, 2.6, 1.4],
        "the-butts": [9.4, 0, 2.6, 1.4],
        "sword-yard": [0, 1.9, 2.6, 2],
        "town-square": [3, 1.9, 4, 2.4],
        "gull-and-lamp": [7.4, 1.9, 2.3, 1.6],
        "halls-yard": [10, 1.9, 2, 2.4],
        "guild-hall": [7.4, 3.9, 2.6, 1.5],
        "the-forge": [0, 4.3, 2.6, 1.4],
        "harbor-row": [3, 4.7, 5.5, 1.1],
        "lantern-house": [10.4, 4.7, 1.6, 1.4],
        "the-stillroom": [0, 6.1, 2.6, 1.4],
        hall: [3, 6.2, 3, 1.8],
        "the-shingle": [6.3, 6.2, 2.2, 1.4],
        breakwater: [8.9, 6.4, 3.1, 1.4],
      },
    },
  }
);
