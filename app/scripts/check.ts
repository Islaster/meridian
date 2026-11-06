import "../src/data/items";
import "../src/data/skills";
import "../src/data/classes";
import "../src/data/monsters";
import "../src/data/world/land";
import "../src/data/world/dungeons";
import "../src/data/world/cities";
import "../src/data/world/locations";
import "../src/data/quests";

import { Item } from "../src/models/item";
import { Skill } from "../src/models/skill";
import { PlayerClass } from "../src/models/class";
import { Monster } from "../src/models/monster";
import { Dungeon } from "../src/models/dungeon";
import { Location, Npc, type Action } from "../src/models/location";
import { Quest, type Target } from "../src/models/quest";
import { SPOTS } from "../src/data/gather";

const errors: string[] = [];
const need = (ok: boolean, msg: string) => ok || errors.push(msg);
const place = (id: string) =>
  Location.registry.has(id) || Dungeon.registry.has(id);

// every pointer in the game, wherever it's declared, with where it stands
const actions: { a: Action; at: string; owner: string }[] = [
  ...[...Location.registry.values()].flatMap((l) =>
    l.actions.map((a) => ({ a, at: l.id, owner: `location ${l.id}` }))
  ),
  ...[...Quest.registry.values()].flatMap((q) =>
    q.actions.map((a) => ({ a, at: a.at, owner: `quest ${q.id}` }))
  ),
  ...[...Npc.registry.values()].flatMap((n) =>
    n.actions.map((a) => ({ a, at: a.at, owner: `npc ${n.id}` }))
  ),
];
const actionIds = [...actions.map((x) => x.a.id), ...SPOTS.map((sp) => sp.id)];

// ── places ────────────────────────────────────────────────────────────────
for (const l of Location.registry.values()) {
  for (const e of l.exits)
    need(place(e.to), `location ${l.id}: exit to unknown "${e.to}"`);
  for (const n of l.npcs)
    need(Npc.registry.has(n), `location ${l.id}: unknown npc "${n}"`);
  if (l.requires)
    need(
      Item.registry.has(l.requires),
      `location ${l.id}: unknown key item "${l.requires}"`
    );
}

// ── pointers ──────────────────────────────────────────────────────────────
for (const { a, at, owner } of actions) {
  need(place(at), `${owner}: action "${a.id}" stands in unknown place "${at}"`);
  for (const m of a.fight ?? [])
    need(Monster.registry.has(m), `action ${a.id}: unknown monster "${m}"`);
  if (a.quest)
    need(
      Quest.registry.has(a.quest),
      `action ${a.id}: unknown quest "${a.quest}"`
    );
}
for (const id of new Set(actionIds))
  need(
    actionIds.filter((x) => x === id).length === 1,
    `action id "${id}" is used more than once`
  );

// ── people ────────────────────────────────────────────────────────────────
for (const n of Npc.registry.values()) {
  for (const q of n.offers ?? [])
    need(Quest.registry.has(q), `npc ${n.id}: offers unknown quest "${q}"`);
  if (n.home)
    need(
      Location.registry.has(n.home.location),
      `npc ${n.id}: unknown home "${n.home.location}"`
    );
  for (const lo of n.lends ?? [])
    for (const it of lo.items)
      need(
        Item.registry.has(it.id),
        `npc ${n.id}: lends unknown item "${it.id}"`
      );
}

// ── land ──────────────────────────────────────────────────────────────────
for (const d of Dungeon.registry.values()) {
  for (const m of d.posting.monsters)
    need(Monster.registry.has(m), `dungeon ${d.id}: unknown monster "${m}"`);
  for (const r of Object.values(d.rooms)) {
    for (const x of r.exits)
      need(
        place(x) || x in d.rooms,
        `dungeon ${d.id}/${r.id}: exit to unknown "${x}"`
      );
    for (const m of r.monsters ?? [])
      need(
        Monster.registry.has(m),
        `dungeon ${d.id}/${r.id}: unknown monster "${m}"`
      );
    for (const l of r.loot ?? [])
      need(
        Item.registry.has(l.id),
        `dungeon ${d.id}/${r.id}: unknown loot "${l.id}"`
      );
    if (r.harvest)
      need(
        Item.registry.has(r.harvest.id),
        `dungeon ${d.id}/${r.id}: unknown harvest "${r.harvest.id}"`
      );
  }
}

// ── monsters ──────────────────────────────────────────────────────────────
for (const m of Monster.registry.values())
  for (const dr of m.drops)
    need(
      Item.registry.has(dr.item),
      `monster ${m.id}: unknown drop "${dr.item}"`
    );

// ── classes ───────────────────────────────────────────────────────────────
for (const c of PlayerClass.registry.values()) {
  if (c.master)
    need(
      Npc.registry.has(c.master),
      `class ${c.id}: unknown master "${c.master}"`
    );
  for (const s of [...c.skills, ...c.starts])
    need(Skill.registry.has(s), `class ${c.id}: unknown skill "${s}"`);
  for (const s of c.starts)
    need(
      c.skills.includes(s),
      `class ${c.id}: start "${s}" not in its curriculum`
    );
}

// ── quests ────────────────────────────────────────────────────────────────
const target = (q: Quest, t: Target): void => {
  if ("npc" in t)
    need(
      Npc.registry.has(t.npc),
      `quest ${q.id}: tracks unknown npc "${t.npc}"`
    );
  else if ("place" in t)
    need(place(t.place), `quest ${q.id}: tracks unknown place "${t.place}"`);
  else if ("dungeon" in t)
    need(
      Dungeon.registry.has(t.dungeon),
      `quest ${q.id}: tracks unknown dungeon "${t.dungeon}"`
    );
  else if ("action" in t)
    need(
      actionIds.includes(t.action),
      `quest ${q.id}: tracks unknown action "${t.action}"`
    );
  else if ("any" in t) t.any.forEach((x) => target(q, x));
  else {
    const id = "board" in t ? t.board : t.quest;
    need(Quest.registry.has(id), `quest ${q.id}: tracks unknown quest "${id}"`);
  }
};

for (const q of Quest.registry.values()) {
  for (const n of [q.next ?? []].flat())
    need(Quest.registry.has(n), `quest ${q.id}: next unknown "${n}"`);
  for (const i of [
    ...(q.take ?? []),
    ...(q.give ?? []),
    ...(q.reward.items ?? []),
  ])
    need(Item.registry.has(i), `quest ${q.id}: unknown item "${i}"`);
  for (const c of [
    ...(q.visible?.complete ?? []),
    ...(q.acceptable?.complete ?? []),
  ])
    need(Quest.registry.has(c), `quest ${q.id}: requires unknown quest "${c}"`);
  for (const t of q.track ?? []) target(q, t);
  const c = q.complete;
  if (c.kind === "talk")
    need(
      Npc.registry.has(c.npc),
      `quest ${q.id}: talks to unknown npc "${c.npc}"`
    );
  if (c.kind === "visit")
    need(
      Location.registry.has(c.location),
      `quest ${q.id}: visits unknown "${c.location}"`
    );
  if (c.kind === "clear")
    need(
      Dungeon.registry.has(c.dungeon),
      `quest ${q.id}: clears unknown "${c.dungeon}"`
    );
  if (c.kind === "have")
    need(
      Item.registry.has(c.item),
      `quest ${q.id}: wants unknown item "${c.item}"`
    );
  if (c.kind === "flag")
    need(!/\s/.test(c.flag), `quest ${q.id}: flag "${c.flag}" has whitespace`);
  for (const f of [
    ...(q.set ?? []),
    ...(q.visible?.flags ?? []),
    ...(q.acceptable?.flags ?? []),
  ])
    need(!/\s/.test(f), `quest ${q.id}: flag "${f}" has whitespace`);
}

// ── items & spots ─────────────────────────────────────────────────────────
for (const it of Item.registry.values())
  for (const m of it.recipe?.materials ?? [])
    need(
      Item.registry.has(m.id),
      `item ${it.id}: recipe wants unknown "${m.id}"`
    );
for (const sp of SPOTS) {
  need(
    Item.registry.has(sp.material),
    `spot ${sp.id}: unknown material "${sp.material}"`
  );
  for (const at of [sp.at].flat())
    need(place(at), `spot ${sp.id}: unknown place "${at}"`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `ok · ${Quest.registry.size} quests · ${Location.registry.size} places · ${Dungeon.registry.size} land · ${Monster.registry.size} monsters · ${Item.registry.size} items`
);
