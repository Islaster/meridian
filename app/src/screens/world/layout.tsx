import type { World } from "./useworld";
import type { Plan, Box } from "@/models/plan";
import { Location, Npc } from "@/data/world/locations";
import { Dungeon } from "@/data/world/land";
import { present } from "@/systems/presence";
import { blocked } from "@/systems/travel";
import { marks } from "@/systems/quests";
import { allowed } from "@/systems/tutorial";
import { canCraft } from "@/systems/craft";
import { available } from "@/systems/actions";
import { dur } from "@/systems/time";
import PlanView, { type Cell } from "@/ui/plan";
import { label, hollow, faint } from "@/ui/styles";

// The place you're in, drawn: what's here as boxes, and the ways out of it as boxes
// marked OUT. The layout is navigation and nothing else — pick something that's here and
// it opens under the layout; pick a way out and the layout becomes the next place.
// A place lays itself out unless its file draws a plan by hand.

const ROW = 4; // boxes per row in a self-drawn layout
const W = 2.5,
  H = 1.4,
  GAP = 0.25;
const auto = (here: string[], ways: string[]): Plan => {
  const boxes: Record<string, Box> = {};
  let y = GAP;
  for (const band of [here, ways]) {
    band.forEach((id, i) => {
      boxes[id] = [
        GAP + (i % ROW) * (W + GAP),
        y + Math.floor(i / ROW) * (H + GAP),
        W,
        H,
      ];
    });
    if (band.length) y += Math.ceil(band.length / ROW) * (H + GAP) + GAP;
  }
  return { size: [ROW * (W + GAP) + GAP, Math.max(y, H + 2 * GAP)], boxes };
};
// a hand-drawn plan can't know who'll be standing here: whatever it didn't draw goes in rows under it
const fill = (plan: Plan, missing: string[]): Plan => {
  if (!missing.length) return plan;
  const cols = Math.max(1, Math.floor((plan.size[0] - GAP) / (W + GAP)));
  const boxes = { ...plan.boxes };
  missing.forEach((id, i) => {
    boxes[id] = [
      GAP + (i % cols) * (W + GAP),
      plan.size[1] + GAP + Math.floor(i / cols) * (H + GAP),
      W,
      H,
    ];
  });
  const rows = Math.ceil(missing.length / cols);
  return { size: [plan.size[0], plan.size[1] + GAP + rows * (H + GAP)], boxes };
};

export default function Layout({ w }: { w: World }) {
  const { state, loc, sig, focus } = w;
  const people = present(state, loc);
  const actions = available(loc, state);
  const here = [
    ...people,
    ...(loc.shop ? ["shop"] : []),
    ...(loc.board ? ["board"] : []),
    ...(loc.bench ? ["bench"] : []),
    ...actions.map((a) => a.id),
  ];
  const ways = loc.exits.map((e) => e.to);
  const plan = loc.plan
    ? fill(
        loc.plan,
        [...here, ...ways].filter((id) => !(id in loc.plan!.boxes))
      )
    : auto(here, ways);

  const cells: Record<string, Cell> = {};
  for (const id of people) {
    const ok = allowed(state, { kind: "npc", id });
    cells[id] = {
      title: (
        <>
          {Npc.get(id).name}
          {sig.available.has(id) && " ?"}
          {sig.pending.has(id) && <span style={hollow}> ?</span>}
          {marks(sig.npcs[id])}
        </>
      ),
      here: focus === id,
      dim: !ok,
      can: ok,
    };
  }
  if (loc.shop) {
    const ok = allowed(state, { kind: "shop" });
    cells.shop = {
      title: loc.shop.name ?? "The counter",
      note: `buy & sell · ${Math.round(loc.shop.cut * 100)}% cut`,
      here: focus === "shop",
      dim: !ok,
      can: ok,
    };
  }
  if (loc.board) {
    const ok = allowed(state, { kind: "board" });
    cells.board = {
      title: <>The posting board{marks(sig.board)}</>,
      note: state.player.rank < 1 ? "needs a guild card" : undefined,
      here: focus === "board",
      dim: !ok || state.player.rank < 1,
      can: ok,
    };
  }
  if (loc.bench)
    cells.bench = {
      title: loc.bench.label,
      note: canCraft(state, loc.bench.craft) ? undefined : "basics only",
      here: focus === "bench",
      can: true,
      tut: "bench",
    };
  for (const a of actions) {
    const short = !!a.gold && state.bag.gold < a.gold;
    const ok = allowed(state, { kind: "action", id: a.id });
    const cost = [a.gold && `${a.gold} gold`, a.hours && `${a.hours}h`]
      .filter(Boolean)
      .join(" · ");
    cells[a.id] = {
      title: (
        <>
          {a.label}
          {marks(sig.actions[a.id])}
        </>
      ),
      note: short ? `${cost} · short` : cost || undefined,
      dim: short || !ok,
      can: !short && ok,
      tut: sig.actions[a.id]?.size ? "marked" : undefined,
    };
  }
  for (const e of loc.exits) {
    const dungeon = Dungeon.registry.has(e.to) ? Dungeon.get(e.to) : null;
    const why = blocked(state, e.to);
    const ok = allowed(state, { kind: "exit", id: e.to });
    cells[e.to] = {
      title: (
        <>
          {(dungeon ?? Location.get(e.to)).name}
          {marks(sig.exits[e.to])}
          {dungeon && <span style={faint}> · {dungeon.color} gate</span>}
        </>
      ),
      note: why ?? (e.hours ? dur(e.hours) : undefined),
      // a free hop is the next room: you can see who's in it
      body:
        !dungeon && !e.hours
          ? present(state, Location.get(e.to)).map((p) => (
              <span key={p} style={faint}>
                {Npc.get(p).name}
              </span>
            ))
          : undefined,
      dim: !!why || !ok,
      can: !why && ok,
      out: true,
      tut: sig.exits[e.to]?.size ? "way" : undefined,
    };
  }

  return (
    <div
      data-tut="exits"
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div style={label}>{loc.name}</div>
      <PlanView plan={plan} cells={cells} onPick={w.pick} />
    </div>
  );
}
