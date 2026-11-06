import { Quest, type Condition } from "../../../../../models/quest";

export interface Line {
  npc: string; // "maud-kestrel"
  short: string; // "Maud"
  where: string; // "the butts, inside the gate wall"
  chain: string;
  className: string; // the short oath's class — "Archer"
  trial?: string; // the trial quest id, if not trial-<npc>
  next?: string; // what the oath opens — forms-<npc>, first-forms, or nothing yet
  meet: string; // what they say when met
  noticed: string; // when they look up
  errand: {
    name: string;
    objective: string;
    complete: Condition;
    take?: string[];
    narration: string;
  };
  back: string; // when you bring it back
  oath: string; // the short words
}

export const line = (l: Line) => {
  const id = (p: string) => `${p}-${l.npc}`;
  const o = { chain: l.chain };
  new Quest(
    id("meet"),
    "side",
    `Meet ${l.short}`,
    `${l.short} keeps ${l.where}. Go and hear the terms.`,
    { kind: "talk", npc: l.npc },
    {
      ...o,
      visible: { complete: ["the-tide-cave"] },
      set: [`met:${l.npc}`, "met"],
      narration: l.meet,
      next: [id("practice"), l.trial ?? id("trial")],
    }
  );
  new Quest(
    id("practice"),
    "side",
    "Every day",
    `Practice at ${l.where} — a session a day — until ${l.short} looks up.`,
    { kind: "flag", flag: `noticed:${l.npc}` },
    {
      ...o,
      narration: l.noticed,
      next: id("errand"),
      track: [{ action: id("practice") }],
    }
  );
  new Quest(
    id("errand"),
    "side",
    l.errand.name,
    l.errand.objective,
    l.errand.complete,
    { ...o, narration: l.errand.narration, next: id("errand-2") }
  );
  new Quest(
    id("errand-2"),
    "side",
    `Back to ${l.short}`,
    `Bring it back to ${l.short}.`,
    { kind: "talk", npc: l.npc },
    {
      ...o,
      take: l.errand.take,
      set: [`errands:${l.npc}`, "errands"],
      narration: l.back,
      next: id("oath"),
    }
  );
  new Quest(
    id("oath"),
    "side",
    "The short words",
    `Take ${l.short}'s oath — the short one. ${l.className}.`,
    { kind: "flag", flag: `sworn:${l.npc}` },
    {
      ...o,
      narration: l.oath,
      next: l.next,
      track: [
        { any: [{ action: `${id("oath")}-lesser` }, { action: id("oath") }] },
      ],
    }
  );
};
