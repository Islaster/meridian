// Every id the content names must exist, and every pointer id must be unique. Run after any data
// edit (`npm run check`); it fails loud with the owner and the missing id. Warnings at the end are
// hygiene, not failures: things that exist but nothing reaches.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import "../src/data/items";
import "../src/data/skills";
import "../src/data/classes";
import "../src/data/monsters";
import "../src/data/world/land";
import "../src/data/world/cities";
import "../src/data/world/locations";
import "../src/data/quests";

import { Item } from "../src/models/item";
import { Skill } from "../src/models/skill";
import { PlayerClass } from "../src/models/class";
import { Monster } from "../src/models/monster";
import { Dungeon } from "../src/models/dungeon";
import { Plans } from "../src/models/plan";
import { City } from "../src/models/city";
import { District } from "../src/models/district";
import { Location, Npc, type Action, type Shop } from "../src/models/location";
import { Quest, type Target, type Requirement } from "../src/models/quest";
import { SPOTS } from "../src/data/gather";

const errors: string[] = [],
  warnings: string[] = [];
const need = (ok: boolean, msg: string) => ok || errors.push(msg);
const place = (id: string) =>
  Location.registry.has(id) || Dungeon.registry.has(id);
const item = (owner: string, id: string, what = "item") =>
  need(Item.registry.has(id), `${owner}: unknown ${what} "${id}"`);
const quest = (owner: string, id: string, what = "quest") =>
  need(Quest.registry.has(id), `${owner}: unknown ${what} "${id}"`);
const npc = (owner: string, id: string, what = "npc") =>
  need(Npc.registry.has(id), `${owner}: unknown ${what} "${id}"`);
const monster = (owner: string, id: string) =>
  need(Monster.registry.has(id), `${owner}: unknown monster "${id}"`);
const flag = (owner: string, f: string) =>
  need(!/\s/.test(f), `${owner}: flag "${f}" has whitespace`);

// a requirement names quests, items and flags; all of them must exist
const requirement = (owner: string, r?: Requirement) => {
  for (const c of r?.complete ?? []) quest(owner, c);
  for (const i of r?.items ?? []) item(owner, i);
  for (const f of [...(r?.flags ?? []), ...(r?.not ?? [])]) flag(owner, f);
  if (r?.proved) npc(owner, r.proved, "trial master");
};

// every pointer in the game, wherever it's declared, with where it stands
const actions: { a: Action; at: string; owner: string }[] = [
  ...Location.all().flatMap((l) =>
    l.actions.map((a) => ({ a, at: l.id, owner: `location ${l.id}` }))
  ),
  ...Quest.all().flatMap((q) =>
    q.actions.map((a) => ({ a, at: a.at, owner: `quest ${q.id}` }))
  ),
  ...Npc.all().flatMap((n) =>
    n.actions.map((a) => ({ a, at: a.at, owner: `npc ${n.id}` }))
  ),
];
const actionIds = [...actions.map((x) => x.a.id), ...SPOTS.map((sp) => sp.id)];

// ── places ────────────────────────────────────────────────────────────────
const shop = (owner: string, s: Shop) => {
  for (const id of [...s.stock, ...Object.values(s.ranked ?? {}).flat()])
    item(owner, id, "stock");
};
for (const l of Location.all()) {
  for (const e of l.exits)
    need(place(e.to), `location ${l.id}: exit to unknown "${e.to}"`);
  for (const n of l.npcs) npc(`location ${l.id}`, n);
  if (l.requires) item(`location ${l.id}`, l.requires, "key item");
  if (l.shop) shop(`location ${l.id}`, l.shop);
  for (const m of l.roam?.monsters ?? []) monster(`location ${l.id}`, m);
}

// ── plans ─────────────────────────────────────────────────────────────────
// a place's hand-drawn layout may only name its exits and what's in it
for (const l of Location.all()) {
  if (!l.plan) continue;
  const mine = new Set([
    ...l.exits.map((e) => e.to),
    ...l.npcs,
    ...l.actions.map((a) => a.id),
    ...(l.shop ? ["shop"] : []),
    ...(l.board ? ["board"] : []),
    ...(l.bench ? ["bench"] : []),
  ]);
  for (const id of Object.keys(l.plan.boxes))
    need(mine.has(id), `location ${l.id}: layout box "${id}" isn't here`);
}
for (const l of Location.all())
  for (const e of l.exits)
    if (
      Location.registry.has(e.to) &&
      !Location.get(e.to).exits.some((x) => x.to === l.id)
    )
      warnings.push(`location ${l.id} → ${e.to} has no way back`);
// a dungeon's plan: every box a room, every room a box
for (const d of Dungeon.all()) {
  if (!d.plan) continue;
  for (const id of Object.keys(d.plan.boxes))
    need(id in d.rooms, `dungeon ${d.id}: plan box for unknown room "${id}"`);
  for (const id of Object.keys(d.rooms))
    if (!(id in d.plan.boxes))
      warnings.push(`dungeon ${d.id}: room ${id} isn't on its plan`);
}
// the town's own plan and its districts — a map, not navigation
for (const lv of Plans.all())
  for (const id of Object.keys(lv.plan.boxes))
    need(
      place(id) || District.registry.has(id),
      `plan ${lv.id}: box for unknown "${id}"`
    );
for (const d of District.all()) {
  need(City.registry.has(d.city), `district ${d.id}: unknown city "${d.city}"`);
  if (
    City.registry.has(d.city) &&
    !(d.id in (Plans.of(d.city)?.plan.boxes ?? {}))
  )
    warnings.push(`district ${d.id} isn't drawn on ${d.city}'s plan`);
}
for (const c of City.all()) {
  const districts = District.all().filter((d) => d.city === c.id).length;
  if (c.size >= 3 && !districts)
    warnings.push(
      `city ${c.id} is size ${c.size} — big enough for districts, drawn as one plan`
    );
  if (c.size <= 2 && districts)
    warnings.push(
      `city ${c.id} is size ${c.size} — too small for its ${districts} districts`
    );
}

// ── pointers ──────────────────────────────────────────────────────────────
for (const { a, at, owner } of actions) {
  need(place(at), `${owner}: action "${a.id}" stands in unknown place "${at}"`);
  for (const m of a.fight ?? []) monster(`action ${a.id}`, m);
  if (a.quest) quest(`action ${a.id}`, a.quest);
  if (a.oath) npc(`action ${a.id}`, a.oath, "master");
  requirement(`action ${a.id}`, a.requires);
}
for (const id of new Set(actionIds))
  need(
    actionIds.filter((x) => x === id).length === 1,
    `action id "${id}" is used more than once`
  );

// ── people ────────────────────────────────────────────────────────────────
for (const n of Npc.all()) {
  for (const q of n.offers) quest(`npc ${n.id}`, q, "offered quest");
  if (n.home)
    need(
      Location.registry.has(n.home.location),
      `npc ${n.id}: unknown home "${n.home.location}"`
    );
  for (const w of n.week)
    need(
      Location.registry.has(w.at),
      `npc ${n.id}: shift in unknown place "${w.at}"`
    );
  for (const lo of n.lends ?? [])
    for (const it of lo.items) item(`npc ${n.id}`, it.id, "loaner");
}

// ── land ──────────────────────────────────────────────────────────────────
for (const d of Dungeon.all()) {
  for (const m of d.posting.monsters) monster(`dungeon ${d.id}`, m);
  for (const i of d.posting.materials)
    item(`dungeon ${d.id}`, i, "posted material");
  for (const r of Object.values(d.rooms)) {
    const owner = `dungeon ${d.id}/${r.id}`;
    for (const x of r.exits)
      need(place(x) || x in d.rooms, `${owner}: exit to unknown "${x}"`);
    for (const m of r.monsters ?? []) monster(owner, m);
    for (const l of r.loot ?? []) item(owner, l.id, "loot");
    if (r.harvest) item(owner, r.harvest.id, "harvest");
    need(
      !(r.type === "combat" || r.type === "boss") || !!r.monsters?.length,
      `${owner}: a ${r.type} room with no monsters`
    );
  }
}

// ── monsters ──────────────────────────────────────────────────────────────
for (const m of Monster.all())
  for (const dr of m.drops) item(`monster ${m.id}`, dr.item, "drop");

// ── classes ───────────────────────────────────────────────────────────────
for (const c of PlayerClass.all()) {
  if (c.master) npc(`class ${c.id}`, c.master, "master");
  for (const s of [...c.skills, ...c.starts])
    need(Skill.registry.has(s), `class ${c.id}: unknown skill "${s}"`);
  for (const s of c.starts)
    need(
      c.skills.includes(s),
      `class ${c.id}: start "${s}" not in its curriculum`
    );
  requirement(`class ${c.id}`, c.manifest);
}

// ── quests ────────────────────────────────────────────────────────────────
const target = (q: Quest, t: Target): void => {
  const owner = `quest ${q.id}`;
  if ("npc" in t) npc(owner, t.npc, "tracked npc");
  else if ("place" in t)
    need(place(t.place), `${owner}: tracks unknown place "${t.place}"`);
  else if ("dungeon" in t)
    need(
      Dungeon.registry.has(t.dungeon),
      `${owner}: tracks unknown dungeon "${t.dungeon}"`
    );
  else if ("action" in t)
    need(
      actionIds.includes(t.action),
      `${owner}: tracks unknown action "${t.action}"`
    );
  else if ("any" in t) t.any.forEach((x) => target(q, x));
  else quest(owner, "board" in t ? t.board : t.quest, "tracked quest");
};
for (const q of Quest.all()) {
  const owner = `quest ${q.id}`;
  for (const n of q.next) quest(owner, n, "next");
  for (const i of [...q.take, ...q.give, ...(q.reward.items ?? [])])
    item(owner, i);
  requirement(owner, q.visible);
  requirement(owner, q.acceptable);
  for (const t of q.track ?? []) target(q, t);
  for (const f of q.set) flag(owner, f);
  const c = q.complete;
  if (c.kind === "talk") npc(owner, c.npc);
  if (c.kind === "visit")
    need(
      Location.registry.has(c.location),
      `${owner}: visits unknown "${c.location}"`
    );
  if (c.kind === "clear")
    need(
      Dungeon.registry.has(c.dungeon),
      `${owner}: clears unknown "${c.dungeon}"`
    );
  if (c.kind === "have") item(owner, c.item);
  if (c.kind === "flag") flag(owner, c.flag);
}

// ── items & spots ─────────────────────────────────────────────────────────
for (const it of Item.all())
  for (const m of it.recipe?.materials ?? [])
    item(`item ${it.id}`, m.id, "recipe material");
for (const sp of SPOTS) {
  item(`spot ${sp.id}`, sp.material, "material");
  for (const at of [sp.at].flat())
    need(place(at), `spot ${sp.id}: unknown place "${at}"`);
  requirement(`spot ${sp.id}`, sp.requires);
}

// ── hygiene: content that exists but nothing reaches ──────────────────────
const reachable = new Set<string>([
  ...Location.all().flatMap((l) => [
    ...(l.shop?.stock ?? []),
    ...Object.values(l.shop?.ranked ?? {}).flat(),
  ]),
  ...Monster.all().flatMap((m) => m.drops.map((d) => d.item)),
  ...Dungeon.all().flatMap((d) =>
    Object.values(d.rooms).flatMap((r) => [
      ...(r.loot ?? []).map((l) => l.id),
      r.harvest?.id ?? "",
    ])
  ),
  ...Quest.all().flatMap((q) => [...q.give, ...(q.reward.items ?? [])]),
  ...Npc.all().flatMap((n) =>
    (n.lends ?? []).flatMap((lo) => lo.items.map((i) => i.id))
  ),
  ...SPOTS.map((sp) => sp.material),
  ...Item.all()
    .filter((it) => it.recipe)
    .map((it) => it.id), // anything with a recipe can be made
  "hall-key",
  "sealed-letter",
  "hales-blade", // the start, and the guard's gift
]);
// materials are stock for tiers not built yet; gear and supplies should be findable now
for (const it of Item.all())
  if (!reachable.has(it.id) && it.kind !== "quest" && it.kind !== "material")
    warnings.push(
      `item ${it.id} has no source (no shop, drop, loot, reward, spot or recipe)`
    );
const summoned = new Set([
  ...Dungeon.all().flatMap((d) => [
    ...d.posting.monsters,
    ...Object.values(d.rooms).flatMap((r) => r.monsters ?? []),
  ]),
  ...Location.all().flatMap((l) => l.roam?.monsters ?? []),
  ...actions.flatMap((x) => x.a.fight ?? []),
]);
for (const m of Monster.all())
  if (!summoned.has(m.id)) warnings.push(`monster ${m.id} is never summoned`);
const taught = new Set(PlayerClass.all().flatMap((c) => c.skills));
for (const s of Skill.all())
  if (!taught.has(s.id))
    warnings.push(`skill ${s.id} is in no class's curriculum`);
// ── filenames: lowercase, because the deploy's disk is case-sensitive and the Mac's isn't ──
const walk = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );
for (const f of walk("src"))
  need(
    !/[A-Z]/.test(f),
    `file ${f} has a capital in its name — rename it through git`
  );

if (warnings.length)
  console.warn(warnings.map((w) => `warn · ${w}`).join("\n"));
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `ok · ${Quest.registry.size} quests · ${Location.registry.size} places · ${Dungeon.registry.size} land · ${Monster.registry.size} monsters · ${Item.registry.size} items`
);
