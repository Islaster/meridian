import { useState } from "react";
import type { World } from "./useworld";
import { Plans } from "@/models/plan";
import { Location, Npc } from "@/data/world/locations";
import { Dungeon } from "@/data/world/land";
import { present } from "@/systems/presence";
import { blocked, route } from "@/systems/travel";
import { marks } from "@/systems/quests";
import { allowed } from "@/systems/tutorial";
import { dur } from "@/systems/time";
import PlanView, { type Cell } from "@/ui/plan";
import { label, hollow, faint } from "@/ui/styles";

// The plan you're looking at: an outline, what's in it as boxes, you in one of them.
// Levels nest — city › district › hall — and the crumbs above the outline climb them.
// Click a street to walk there (the quickest open way, from wherever you stand);
// click a district to look into it; click a name in your box to talk. A hall opens
// its own plan when you step in, and its one exit is the way back out.
export default function Map({ w }: { w: World }) {
  const { state, sig } = w;
  const here = state.world.area;
  const mine = Plans.levelOf(here); // the level you stand on
  // a level you're looking at instead, remembered with where you stood; moving on forgets it
  const [peek, setPeek] = useState<{ at: string; level: string } | null>(null);
  const view = peek && peek.at === here ? peek.level : null;
  const setView = (level: string | null) =>
    setPeek(level ? { at: here, level } : null);
  const level = (view && Plans.of(view)) || mine;

  // ways out that no plan draws: the road beyond the gate, a cave off the coast road
  const links = (exits: { to: string; hours: number }[]) =>
    exits.length > 0 && (
      <div
        style={{
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          fontSize: "0.9em",
        }}
      >
        {exits.map((e) => {
          const why = blocked(state, e.to);
          const ok = !why && allowed(state, { kind: "exit", id: e.to });
          return (
            <span
              key={e.to}
              data-tut={sig.exits[e.to]?.size ? "way" : undefined}
              style={{
                cursor: ok ? "pointer" : "default",
                opacity: ok ? 1 : 0.4,
              }}
              onClick={() => ok && w.go(e.to)}
            >
              →{" "}
              {
                (Dungeon.registry.has(e.to)
                  ? Dungeon.get(e.to)
                  : Location.get(e.to)
                ).name
              }
              {marks(sig.exits[e.to])}
              <span style={faint}> · {why ?? dur(e.hours)}</span>
            </span>
          );
        })}
      </div>
    );
  if (!level || !mine)
    return <div data-tut="exits">{links(Location.get(here).exits)}</div>;

  // a hall's plan is owned by a place you can stand in; a city's or a district's isn't
  const owner = Location.registry.has(level.id) ? Location.get(level.id) : null;
  const building = Location.registry.has(mine.id)
    ? Location.get(mine.id)
    : null;
  const out = building?.exits.find((e) => !(e.to in mine.plan.boxes))?.to; // the hall's door
  const onFloor = !!owner && here === owner.id;
  const path = Plans.path(level.id);
  const inside = new Set(Plans.path(mine.id).map((lv) => lv.id)); // the levels you're within

  // someone standing where you are can be spoken to; elsewhere they're just seen
  const person = (p: string, near: boolean) => (
    <span
      key={p}
      style={{
        ...faint,
        cursor: near ? "pointer" : "default",
        opacity: near ? 1 : 0.6,
      }}
      onClick={(e) => {
        if (!near || !allowed(state, { kind: "npc", id: p })) return;
        e.stopPropagation();
        w.talk(p);
      }}
    >
      {Npc.get(p).name}
      {sig.available.has(p) && " ?"}
      {sig.pending.has(p) && <span style={hollow}> ?</span>}
      {marks(sig.npcs[p])}
    </span>
  );

  // the door of a hall, drawn as a box on its plan where the plan says
  const door = level.id === mine.id && out && level.plan.door ? out : null;
  const plan = door
    ? {
        ...level.plan,
        boxes: { ...level.plan.boxes, [door]: level.plan.door! },
      }
    : level.plan;

  // what each box says
  const cells: Record<string, Cell> = {};
  for (const id of Object.keys(plan.boxes)) {
    const dungeon = Dungeon.registry.has(id) ? Dungeon.get(id) : null;
    const loc = !dungeon && Location.registry.has(id) ? Location.get(id) : null;
    const area = !dungeon && !loc ? Plans.of(id) : null; // a district: look, don't walk
    const current = id === here || (!!area && inside.has(id));
    const why = current || area ? null : blocked(state, id);
    const ok = area ? true : allowed(state, { kind: "exit", id });
    const r = current || why || area ? null : route(state, here, id);
    const people = loc ? present(state, loc) : [];
    cells[id] = {
      title: (
        <>
          {(dungeon ?? loc ?? area)!.name}
          {marks(sig.exits[id])}
          {dungeon && <span style={faint}> · {dungeon.color} gate</span>}
        </>
      ),
      note:
        why ??
        (area
          ? current
            ? `you are in here · ${Location.get(here).name}`
            : "look in"
          : current
          ? "you are here"
          : r && r.hours
          ? dur(r.hours)
          : undefined),
      body: people.length ? people.map((p) => person(p, current)) : undefined,
      here: current,
      dim: !!why || !ok,
      can: area ? true : !current && !why && ok && !!r,
      nested: !!Plans.of(id),
      out: id === door || !!level.plan.out?.includes(id),
      tut: sig.exits[id]?.size ? "way" : undefined,
    };
  }

  return (
    <div
      data-tut="exits"
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div style={{ ...label, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {path.map((lv, i) => (
          <span key={lv.id} style={{ display: "flex", gap: 10 }}>
            {i > 0 && <span>›</span>}
            <span
              style={{
                cursor: lv.id === level.id ? "default" : "pointer",
                opacity: lv.id === level.id ? 1 : 0.7,
              }}
              onClick={() =>
                lv.id !== level.id && setView(lv.id === mine.id ? null : lv.id)
              }
            >
              {lv.name}
            </span>
          </span>
        ))}
        {level.id !== mine.id && (
          <span
            style={{ cursor: "pointer", marginLeft: 6 }}
            onClick={() => setView(null)}
          >
            ◉ back to {Location.get(here).name}
          </span>
        )}
        {level.id === mine.id && out && !door && (
          <span
            style={{ cursor: "pointer", marginLeft: 6 }}
            onClick={() => w.go(out)}
          >
            ↑ {Location.get(out).name}
          </span>
        )}
      </div>
      {owner && (
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            fontSize: "0.9em",
          }}
        >
          <span
            style={{ cursor: onFloor ? "default" : "pointer" }}
            onClick={() => !onFloor && w.go(owner.id)}
          >
            {onFloor && "◉ "}the floor
          </span>
          {present(state, owner).map((p) => person(p, onFloor))}
        </div>
      )}
      <PlanView
        plan={plan}
        cells={cells}
        onPick={(id) =>
          cells[id] && Plans.of(id) && !Location.registry.has(id)
            ? setView(id)
            : w.go(id)
        }
      />
      {links(
        Location.get(here).exits.filter(
          (e) => !(e.to in mine.plan.boxes) && e.to !== out
        )
      )}
    </div>
  );
}
