import { QuestItem } from "../models/item";

export const sealedLetter = new QuestItem("sealed-letter", "Sealed letter");
export const hallKey = new QuestItem("hall-key", "Hall key");
export const predecessorJournal = new QuestItem(
  "predecessor-journal",
  "A stranger's journal"
);

if (import.meta.hot) import.meta.hot.accept();
