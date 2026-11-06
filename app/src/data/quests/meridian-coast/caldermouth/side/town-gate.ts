import { Quest } from "../../../../../models/quest";

new Quest(
  "find-the-mark",
  "side",
  "The mark on the gate",
  "Look for a carved mark on the gate towers — a circle cut by a line.",
  { kind: "flag", flag: "act:the-mark" },
  {
    chain: "The mark on the stone",
    narration:
      "It's there, at the base of the left tower, small enough to miss: a circle, cut through by a single line. The stone around it is scorched black in a shape the weather hasn't touched.",
    next: "tell-corvin",
  }
);

if (import.meta.hot) import.meta.hot.accept();
