import { useGame } from "../../state/context";
import { Weapon, Armor, Item } from "../../data/items";
import { equip, unequip, itemByName } from "../../systems/inventory";
import { weaponDamage, strBonus } from "../../systems/combat";
import { explain } from "../../systems/perks";
import { label, para, ptr, rail } from "../../ui/styles";
import type { GameState } from "../../state/types";
import { GRADE_NAME, graded } from "../../ui/grade";

type Slot = keyof NonNullable<GameState["player"]["equipment"]>;

// the slot a piece goes in, as the equipment record names it
const slotKey = (it: Item): Slot | undefined =>
  it.slot === "weapon"
    ? "mainWeapon"
    : it.slot === "offhand"
    ? "altWeapon"
    : it.slot === "ring"
    ? "ringOne"
    : (it.slot as Slot | undefined);

const block = { display: "flex", flexDirection: "column" as const, gap: 4 };

// the card: looks, then the numbers with yours in them, then every perk spelled out, then what it asks
export default function GearDetail({
  name,
  onClose,
}: {
  name: string;
  onClose: () => void;
}) {
  const { state, changeState } = useGame();
  const p = state.player;
  const def = itemByName(name);
  if (!(def instanceof Weapon || def instanceof Armor)) return null;
  const w = def instanceof Weapon ? def : null;

  const wornIn = (Object.entries(p.equipment ?? {}) as [Slot, string][]).find(
    ([, n]) => n === name
  )?.[0];
  const key = slotKey(def);
  const wornName = key ? p.equipment?.[key] : undefined;
  const worn = wornName && wornName !== name ? itemByName(wornName) : undefined;

  const power = (it: Item | undefined) =>
    it instanceof Weapon
      ? weaponDamage(it, p.stats)
      : it instanceof Armor
      ? it.defense
      : 0;
  const now = power(def);
  const delta = worn ? now - power(worn) : null;
  const unmet = Object.entries(def.reqStats).filter(
    ([k, n]) => (p.stats[k] ?? 0) < n
  );
  const under = p.level < def.reqLevel;

  const made = def.recipe
    ? `${def.recipe.craft}: ${def.recipe.materials
        .map((m) => `${m.qty} ${Item.get(m.id).name.toLowerCase()}`)
        .join(", ")}`
    : "found, never made";

  return (
    <div style={{ ...rail, gap: 14, minWidth: 260 }}>
      <div style={block}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <button
            style={{
              ...ptr,
              padding: "2px 10px",
              fontSize: "0.8em",
              letterSpacing: "0.1em",
              whiteSpace: "nowrap",
            }}
            onClick={onClose}
            title="esc"
          >
            × close card
          </button>
        </div>
        <div style={label}>
          <span style={graded(def.grade)}>{GRADE_NAME[def.grade]}</span> ·{" "}
          {def.kind} · {def.tags[1]}
        </div>
        <div style={{ fontSize: "1.15em", ...graded(def.grade) }}>
          {def.name}
        </div>
        {def.describe && (
          <p style={{ ...para, opacity: 0.7 }}>{def.describe}</p>
        )}
      </div>

      <div style={block}>
        <div style={label}>Stats</div>
        {w ? (
          <>
            <div>
              Damage {w.damage}
              {now !== w.damage && (
                <span style={{ opacity: 0.7 }}> · {now} with its perks</span>
              )}
            </div>
            <div style={{ opacity: 0.7 }}>
              Your attack: {now + strBonus(p.stats)} ({now} +{" "}
              {strBonus(p.stats)} from STR {p.stats.str ?? 5})
            </div>
          </>
        ) : (
          <div>Defense {(def as Armor).defense}</div>
        )}
      </div>

      {def.perks.length > 0 && (
        <div style={block}>
          <div style={label}>Perks</div>
          {def.perks.map((pk, i) => (
            <div key={i} style={{ opacity: 0.85 }}>
              {explain(pk, p.stats)}
            </div>
          ))}
        </div>
      )}

      {(def.reqLevel > 1 || Object.keys(def.reqStats).length > 0) && (
        <div style={block}>
          <div style={label}>Asks</div>
          <div style={{ opacity: 0.7 }}>
            {def.reqLevel > 1 && `level ${def.reqLevel}`}
            {Object.entries(def.reqStats).map(([k, n], i) => (
              <span
                key={k}
                style={{ opacity: (p.stats[k] ?? 0) < n ? 1 : 0.7 }}
              >
                {(i > 0 || def.reqLevel > 1) && " · "}
                {k.toUpperCase()} {n}
                {(p.stats[k] ?? 0) < n && ` (you: ${p.stats[k] ?? 0})`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ opacity: 0.7 }}>
        Worth {def.price} gold · {made}
      </div>

      {worn && (
        <div style={{ opacity: 0.7 }}>
          In that slot now: {worn.name} · {power(worn)}
          {delta !== null && delta !== 0 && (
            <span> → {delta > 0 ? `+${delta}` : delta} if you switch</span>
          )}
        </div>
      )}

      {wornIn ? (
        <button
          style={{ ...ptr, alignSelf: "flex-start" }}
          onClick={() => changeState("player", unequip(p, wornIn))}
        >
          Unequip
        </button>
      ) : (
        <button
          style={{
            ...ptr,
            alignSelf: "flex-start",
            opacity: unmet.length || under ? 0.4 : 1,
          }}
          disabled={unmet.length > 0 || under}
          onClick={() => changeState("player", equip(p, def.id))}
        >
          Equip
        </button>
      )}
    </div>
  );
}
