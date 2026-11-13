import { Quest } from "@/models/quest";

new Quest(
  "the-halls-door",
  "main",
  "The sealed hall",
  "Follow Corvin to the inner door of the Halls.",
  { kind: "visit", location: "halls-door" },
  {
    chain: "The sealed hall",
    reward: { xp: 80 },
    epilogue:
      'A door, sealed, taller than the yard\'s wall. Cut into it at the height of a hand: a circle, crossed by a single line. Below the mark, an inscription in a script that reads itself into your Ledger as you look — a want, not a welcome. Ira has come up behind you without a sound. "Learn everything I know," he says. "Then we\'ll talk about that door."',
  }
);
