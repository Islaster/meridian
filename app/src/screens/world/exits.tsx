import type { Town } from "./usetown";
import { ptr, dim, col } from "../../ui/styles";
import { Location } from "../../data/locations";
import { Dungeon } from "../../data/land";
import { isOpen, dur } from "../../systems/time";
import { hasItem } from "../../systems/inventory";
import { admission } from "../../systems/dungeon";
import { marks } from "../../systems/quests";
import { allowed } from "../../systems/tutorial";

export default function Exits({ t }: { t: Town }) {
  const { state, loc, sig } = t;
  console.log(
    "land",
    [...Dungeon.registry.keys()],
    "exits here",
    loc.exits.map((e) => e.to)
  );
  return (
    <div style={col}>
      {loc.exits.map((e) => {
        const dest = Dungeon.registry.has(e.to)
          ? Dungeon.get(e.to)
          : Location.get(e.to);
        const place = dest instanceof Location ? dest : undefined;
        const gate = dest instanceof Dungeon ? admission(state, dest) : null;
        const hours = place?.hours;
        const requires = place?.requires;
        const closed = !isOpen(hours, state.time);
        const locked = !!requires && !hasItem(state.bag, requires);
        const ok = allowed(state, { kind: "exit", id: e.to });
        const blocked = !!gate || closed || locked || !ok;
        const why = gate
          ? gate
          : closed
          ? `closed until ${hours!.open}:00`
          : locked
          ? "the door wants a key"
          : dur(e.hours);
        return (
          <button
            key={e.to}
            style={{ ...ptr, opacity: blocked ? 0.4 : 1 }}
            disabled={blocked}
            onClick={() => t.go(e.to, e.hours)}
          >
            → {dest.name}
            {dest instanceof Dungeon && dest.kind === "dungeon" && (
              <span style={dim}> · {dest.color} gate</span>
            )}
            {marks(sig.exits[e.to])}
            {why && <span style={dim}> · {why}</span>}
          </button>
        );
      })}
    </div>
  );
}
