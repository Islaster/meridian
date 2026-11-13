import { Quest } from "@/models/quest";

new Quest(
  "the-tide-cave",
  "main",
  "The tide cave",
  "The cave is north on the coast road, under the old breakwater. Low tide is morning.",
  { kind: "clear", dungeon: "tide-cave" },
  {
    chain: "The inheritance",
    reward: { xp: 40, gold: 30 },
    epilogue:
      "The cave is empty now. Whatever Osric came here for, the third chamber's chalk mark says he found it — and took it home.",
    next: "return-the-loan",
  }
);
