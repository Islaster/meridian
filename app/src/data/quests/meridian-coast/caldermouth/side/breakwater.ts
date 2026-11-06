import { Quest } from "../../../../../models/quest";

new Quest(
  "walk-the-breakwater",
  "side",
  "The lamp on the point",
  "Walk out along the breakwater from harbor row and see whether the lamp still stands.",
  { kind: "visit", location: "breakwater" },
  {
    chain: "The breakwater lamp",
    narration:
      "The lamp stands. Its glass is whole. Its oil is gone — not burned down, gone, the reservoir dry and the cap set neatly back in place. Someone took it.",
    next: "tell-dunny",
  }
);

if (import.meta.hot) import.meta.hot.accept();
