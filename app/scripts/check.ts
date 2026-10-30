import "../src/data/items";
import "../src/data/skills";
import "../src/data/classes";
import "../src/data/monsters";
import "../src/data/land";
import "../src/data/dungeons";
import "../src/data/cities";
import "../src/data/locations";
import "../src/data/quests";

import { Item } from "../src/models/item";
import { Skill } from "../src/models/skill";
import { PlayerClass } from "../src/models/class";
import { Monster } from "../src/models/monster";
import { Dungeon } from "../src/models/dungeon";
import { Location, Npc } from "../src/models/location";
import { Quest } from "../src/models/quest";
import { SPOTS } from "../src/data/gather";

const errors: string[] = [];
const need = (ok: boolean, msg: string) => ok || errors.push(msg);
const place = (id: string) =>
  Location.registry.has(id) || Dungeon.registry.has(id);
let failures = 0;
const fail = (msg: string) => {
  failures++;
  console.error(`✗ ${msg}`);
};

const exists = (get: (id: string) => unknown, id: string) => {
  try {
    get(id);
    return true;
  } catch {
    return false;
  }
};
const placeExists = (id: string) =>
  exists((i) => Location.get(i), id) || exists((i) => Dungeon.get(i), id);

for (const l of Location.registry.values()) {
  for (const e of l.exits)
    need(place(e.to), `location ${l.id}: exit to unknown "${e.to}"`);
  for (const n of l.npcs)
    need(Npc.registry.has(n), `location ${l.id}: unknown npc "${n}"`);
  for (const a of l.actions) {
    for (const m of a.fight ?? [])
      need(Monster.registry.has(m), `action ${a.id}: unknown monster "${m}"`);
    if (a.quest)
      need(
        Quest.registry.has(a.quest),
        `action ${a.id}: unknown quest "${a.quest}"`
      );
  }
  if (l.requires)
    need(
      Item.registry.has(l.requires),
      `location ${l.id}: unknown key item "${l.requires}"`
    );
}

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

for (const m of Monster.registry.values())
  for (const dr of m.drops)
    need(
      Item.registry.has(dr.item),
      `monster ${m.id}: unknown drop "${dr.item}"`
    );

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

for (const q of Quest.registry.values()) {
  for (const n of [q.next ?? []].flat())
    need(Quest.registry.has(n), `quest ${q.id}: next unknown "${n}"`);
  for (const i of [
    ...(q.take ?? []),
    ...(q.give ?? []),
    ...(q.reward.items ?? []),
  ])
    need(Item.registry.has(i), `quest ${q.id}: unknown item "${i}"`);
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
  if (c.kind === "flag")
    need(!/\s/.test(c.flag), `quest ${q.id}: flag "${c.flag}" has whitespace`);
  for (const f of [
    ...(q.set ?? []),
    ...(q.visible?.flags ?? []),
    ...(q.acceptable?.flags ?? []),
  ])
    need(!/\s/.test(f), `quest ${q.id}: flag "${f}" has whitespace`);
}

for (const it of Item.registry.values())
  for (const m of it.recipe?.materials ?? [])
    need(
      Item.registry.has(m.id),
      `item ${it.id}: recipe wants unknown "${m.id}"`
    );
for (const sp of SPOTS) {
  Item.get(sp.material); // throws on an unknown id
  if (!placeExists(sp.at)) fail(`spot ${sp.id}: unknown place ${sp.at}`); // the lookup/report helpers check.ts already uses
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
if (failures) process.exit(1);
console.log(
  `ok · ${Quest.registry.size} quests · ${Location.registry.size} places · ${Dungeon.registry.size} land · ${Monster.registry.size} monsters · ${Item.registry.size} items`
);
