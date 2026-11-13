import { useGame } from "@/state/game";
import { Weapon, Armor, Item, isGear } from "@/data/items";
import { equip, unequip, wornIn, wornFor, wearable } from "@/systems/inventory";
import { weaponDamage, strBonus } from "@/systems/combat";
import { explain } from "@/systems/perks";
import { effective } from "@/systems/conditions";
import { label, para, ptr, rail } from "@/ui/styles";
import { GRADE_NAME, graded } from "@/ui/grade";

const block = { display: "flex", flexDirection: "column" as const, gap: 4 };

// The card: looks, then the numbers with yours in them, then every perk spelled out, then what it asks.
export default function GearDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { state, update } = useGame();
  const p = state.player;
  const stats = effective(p); // as they stand, conditions counted
  const def = Item.get(id);
  if (!isGear(def)) return null;

  const worn = wornIn(p.equipment, id);
  const otherId = wornFor(p.equipment, def);
  const other = otherId && otherId !== id ? Item.get(otherId) : undefined;
  const power = (it: Item | undefined) =>
    it instanceof Weapon
      ? weaponDamage(it, stats)
      : it instanceof Armor
      ? it.defense
      : 0;
  const now = power(def);
  const delta = other ? now - power(other) : null;
  const made = def.recipe
    ? `${def.recipe.craft}: ${def.recipe.materials
        .map((m) => `${m.qty} ${Item.get(m.id).name.toLowerCase()}`)
        .join(", ")}`
    : "found, never made";

  return (
    <div style={{ ...rail, gap: 14, flex: 1, minWidth: "min(260px, 100%)" }}>
      <div style={block}>
        <button
          style={{
            ...ptr,
            alignSelf: "flex-start",
            padding: "2px 10px",
            fontSize: "0.8em",
            letterSpacing: "0.1em",
          }}
          onClick={onClose}
          title="esc"
        >
          × close card
        </button>
        <div style={label}>
          <span style={graded(def.grade)}>{GRADE_NAME[def.grade]}</span> ·{" "}
          {def.kind} · {def.group}
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
        {def instanceof Weapon ? (
          <>
            <div>
              Damage {def.damage}
              {now !== def.damage && (
                <span style={{ opacity: 0.7 }}> · {now} with its perks</span>
              )}
            </div>
            <div style={{ opacity: 0.7 }}>
              Your attack: {now + strBonus(stats)} ({now} + {strBonus(stats)}{" "}
              from STR {stats.str ?? 5})
            </div>
          </>
        ) : (
          <div>Defense {def.defense}</div>
        )}
      </div>

      {def.perks.length > 0 && (
        <div style={block}>
          <div style={label}>Perks</div>
          {def.perks.map((pk, i) => (
            <div key={i} style={{ opacity: 0.85 }}>
              {explain(pk, stats)}
            </div>
          ))}
        </div>
      )}

      {(def.reqLevel > 1 || Object.keys(def.reqStats).length > 0) && (
        <div style={block}>
          <div style={label}>Asks</div>
          <div style={{ opacity: 0.7 }}>
            {[
              def.reqLevel > 1 && `level ${def.reqLevel}`,
              ...Object.entries(def.reqStats).map(
                ([k, n]) =>
                  `${k.toUpperCase()} ${n}${
                    (stats[k] ?? 0) < n ? ` (you: ${stats[k] ?? 0})` : ""
                  }`
              ),
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
      )}

      <div style={{ opacity: 0.7 }}>
        Worth {def.price} gold · {made}
      </div>
      {other && (
        <div style={{ opacity: 0.7 }}>
          In that slot now: {other.name} · {power(other)}
          {delta !== null && delta !== 0 && (
            <span> → {delta > 0 ? `+${delta}` : delta} if you switch</span>
          )}
        </div>
      )}
      {worn ? (
        <button
          style={{ ...ptr, alignSelf: "flex-start" }}
          onClick={() => update({ ...state, player: unequip(p, worn) })}
        >
          Unequip
        </button>
      ) : (
        <button
          style={{
            ...ptr,
            alignSelf: "flex-start",
            opacity: wearable(p, id) ? 1 : 0.4,
          }}
          disabled={!wearable(p, id)}
          onClick={() => update({ ...state, player: equip(p, id) })}
        >
          Equip
        </button>
      )}
    </div>
  );
}
