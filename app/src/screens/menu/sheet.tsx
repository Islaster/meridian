import { useGame } from "@/state/game";
import { Item } from "@/data/items";
import { PlayerClass } from "@/data/classes";
import { held } from "@/systems/classes";
import { unequip } from "@/systems/inventory";
import { xpToNext } from "@/systems/progression";
import { row, small, label } from "@/ui/styles";
import { graded } from "@/ui/grade";
import type { Equipment } from "@/state/types";

const SLOTS: (keyof Equipment)[] = [
  "weapon",
  "offhand",
  "head",
  "armor",
  "hands",
  "boots",
  "back",
  "ring",
  "ring2",
];
const SLOT_NAME: Record<keyof Equipment, string> = {
  weapon: "weapon",
  offhand: "off hand",
  head: "head",
  armor: "armor",
  hands: "hands",
  boots: "boots",
  back: "back",
  ring: "ring",
  ring2: "second ring",
};

// The sheet: level, pools, the name on the Ledger, stats to spend, what's worn.
export default function Sheet() {
  const { state, update } = useGame();
  const p = state.player;
  const addStat = (k: string) =>
    update({
      ...state,
      player: {
        ...p,
        statPoints: p.statPoints - 1,
        stats: { ...p.stats, [k]: p.stats[k] + 1 },
      },
    });
  return (
    <>
      <div style={row}>
        <span>{p.name}</span>
        <span style={{ opacity: 0.6 }}>
          Level {p.level} · {p.xp} / {xpToNext(p.level)} xp
        </span>
      </div>
      <div style={row}>
        <span style={{ opacity: 0.6 }}>hp</span>
        <span>
          {p.hp} / {p.maxHp}
        </span>
      </div>
      {p.maxMp > 0 && (
        <div style={row}>
          <span style={{ opacity: 0.6 }}>pool</span>
          <span>
            {p.mp} / {p.maxMp}
          </span>
        </div>
      )}
      {p.class && (
        <div style={row}>
          <span style={{ opacity: 0.6 }}>class</span>
          <span>
            <span style={graded(PlayerClass.get(p.class).grade)}>
              {PlayerClass.get(p.class).name}
            </span>
            {held(state)
              .filter((c) => c.id !== p.class)
              .map((c) => (
                <span key={c.id} style={{ opacity: 0.6 }}>
                  {" · "}
                  {c.name}
                </span>
              ))}
          </span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 64,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={label}>
            <span data-tut="stats">
              Stats{p.statPoints > 0 && ` · ${p.statPoints} to spend`}
            </span>
          </div>
          {p.weary && (
            <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
              weary · {p.weary.stat.toUpperCase()} −{p.weary.amount} until you
              sleep properly
            </div>
          )}
          {Object.entries(p.stats).map(([k, v]) => (
            <div key={k} style={row}>
              <span style={{ letterSpacing: "0.15em" }}>{k.toUpperCase()}</span>
              <span>
                {v}
                {p.statPoints > 0 && (
                  <button
                    style={{ ...small, marginLeft: 12 }}
                    onClick={() => addStat(k)}
                  >
                    +
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={label}>Equipped</div>
          {SLOTS.map((s) => (
            <div key={s} style={row}>
              <span style={{ opacity: 0.6 }}>{SLOT_NAME[s]}</span>
              <span style={{ whiteSpace: "nowrap" }}>
                {p.equipment[s] ? Item.get(p.equipment[s]!).name : "—"}
                {p.equipment[s] && (
                  <button
                    style={{ ...small, marginLeft: 12 }}
                    onClick={() => update({ ...state, player: unequip(p, s) })}
                  >
                    Unequip
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
