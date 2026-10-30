import { Quest } from "../../../../models/quest";

new Quest(
  "tell-corvin",
  "side",
  "Tell Corvin",
  "Tell Corvin at the Halls' yard.",
  { kind: "talk", npc: "corvin-ashe" },

  {
    chain: "The mark on the stone",
    reward: { xp: 12 },
    epilogue:
      'Corvin is quiet a long time. "A circle and a line. The old sign for a door." He does not explain, and you get the sense he can\'t.',
  }
);

new Quest(
  "the-last-page",
  "main",
  "The last page",
  "The torn page mentions the Halls. Show it and the journal to Corvin at the Halls' yard.",
  { kind: "talk", npc: "corvin-ashe" },
  {
    chain: "The sealed hall",
    visible: { complete: ["the-harbor-caves", "first-forms"] },
    acceptable: { items: ["predecessor-journal"] },
    narration:
      'Corvin reads the page three times. "He found the inner door. He read it." His hands are not steady. "Come. You should see what he saw."',
    next: "the-halls-door",
  }
);

if (import.meta.hot) import.meta.hot.accept();
