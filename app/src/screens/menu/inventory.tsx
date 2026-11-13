import { useEffect, useState } from "react";
import { useGame } from "@/state/game";
import { Weapon, Armor, Consumable, isGear, type Item } from "@/data/items";
import {
  carried,
  equip,
  unequip,
  consume,
  wornIn,
  SHELF_OF,
  type Shelf,
} from "@/systems/inventory";
import { row, small, link, rowBetween } from "@/ui/styles";
import { GRADE_NAME, graded } from "@/ui/grade";
import Tabs from "@/ui/tabs";
import GearDetail from "./geardetail";

type Sort = "name" | "power" | "worth" | "count";
const SHELVES: readonly Shelf[] = ["gear", "supplies", "materials", "papers"];
const NAMES: Record<Shelf, string> = {
  gear: "gear",
  supplies: "supplies",
  materials: "materials",
  papers: "papers & keys",
};
const SORTS: Record<Shelf, Sort[]> = {
  gear: ["power", "worth", "name"],
  supplies: ["power", "count", "worth"],
  materials: ["count", "worth", "name"],
  papers: ["name"],
};
const power = (it: Item) =>
  it instanceof Weapon
    ? it.damage
    : it instanceof Armor
    ? it.defense
    : it instanceof Consumable
    ? it.heal
    : 0;
// what a shelf can be narrowed to: gear by slot, materials by group
const kindOf = (shelf: Shelf, it: Item) =>
  shelf === "gear"
    ? it.slot ?? ""
    : shelf === "materials"
    ? it.group ?? ""
    : "";

// The bag, by shelf; a piece of gear opens its card beside the list.
export default function Inventory({
  onWide,
}: {
  onWide: (w: boolean) => void;
}) {
  const { state, update } = useGame();
  const p = state.player;
  const [shelf, setShelf] = useState<Shelf>("gear");
  const [sort, setSort] = useState<Sort>("power");
  const [kind, setKind] = useState("all");
  const [pick, setPick] = useState<string | null>(null); // the gear open in the side panel

  // Escape closes the card first; the menu only hears the key when no card is open
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !pick) return;
      e.stopImmediatePropagation();
      setPick(null);
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [pick]);
  useEffect(() => onWide(!!pick), [pick, onWide]);

  const onShelf = carried(state.bag).filter(
    ({ item }) => SHELF_OF[item.kind] === shelf
  );
  const kinds = [
    ...new Set(onShelf.map(({ item }) => kindOf(shelf, item))),
  ].filter(Boolean);
  const shown = onShelf
    .filter(({ item }) => kind === "all" || kindOf(shelf, item) === kind)
    .sort((a, b) =>
      sort === "name"
        ? a.item.name.localeCompare(b.item.name)
        : sort === "count"
        ? b.qty - a.qty
        : sort === "worth"
        ? b.item.price - a.item.price
        : power(b.item) - power(a.item)
    );
  const picked = pick && state.bag.items[pick] ? pick : null;

  return (
    <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
      <div
        style={{
          flex: 1,
          minWidth: 320,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={row}>
          <span>Coin</span>
          <span>{state.bag.gold} gold</span>
        </div>
        <Tabs
          tabs={SHELVES}
          value={shelf}
          names={NAMES}
          gap={16}
          tut="shelves"
          onPick={(s) => {
            setShelf(s);
            setSort(SORTS[s][0]);
            setKind("all");
          }}
        />
        {(SORTS[shelf].length > 1 || kinds.length > 1) && (
          <div style={rowBetween}>
            {kinds.length > 1 ? (
              <Tabs
                tabs={["all", ...kinds]}
                value={kind}
                onPick={setKind}
                gap={12}
              />
            ) : (
              <span />
            )}
            {SORTS[shelf].length > 1 && (
              <Tabs
                tabs={SORTS[shelf]}
                value={sort}
                onPick={setSort}
                gap={12}
              />
            )}
          </div>
        )}
        {shown.length === 0 && <div style={{ opacity: 0.4 }}>—</div>}
        {shown.map(({ item, qty }) => {
          const gear = isGear(item);
          const detail = [
            item.grade !== "normal" && GRADE_NAME[item.grade],
            item instanceof Weapon && `dmg ${item.damage}`,
            item instanceof Armor && `def ${item.defense}`,
            item instanceof Consumable && `+${item.heal} hp`,
            gear && item.slot,
            shelf === "materials" && item.group,
            item.price ? `${item.price}g` : "",
            ...(gear
              ? Object.entries(item.reqStats).map(([k, n]) => `${k} ${n}`)
              : []),
          ]
            .filter(Boolean)
            .join(" · ");
          const worn = wornIn(p.equipment, item.id);
          return (
            <div key={item.id} style={row}>
              <span
                style={
                  gear
                    ? {
                        ...link,
                        textDecoration: pick === item.id ? "underline" : "none",
                      }
                    : undefined
                }
                onClick={() =>
                  gear && setPick(pick === item.id ? null : item.id)
                }
              >
                <span style={graded(item.grade)}>{item.name}</span>
                {qty > 1 && <span style={{ opacity: 0.5 }}> ×{qty}</span>}
                {detail && (
                  <span style={{ opacity: 0.5, fontSize: "0.85em" }}>
                    {" "}
                    · {detail}
                  </span>
                )}
              </span>
              {gear &&
                (worn ? (
                  <button
                    style={small}
                    onClick={() =>
                      update({ ...state, player: unequip(p, worn) })
                    }
                  >
                    Unequip
                  </button>
                ) : (
                  <button
                    style={small}
                    onClick={() =>
                      update({ ...state, player: equip(p, item.id) })
                    }
                  >
                    Equip
                  </button>
                ))}
              {item instanceof Consumable && (
                <button
                  style={{ ...small, opacity: p.hp >= p.maxHp ? 0.4 : 1 }}
                  disabled={p.hp >= p.maxHp}
                  title={p.hp >= p.maxHp ? "unhurt" : ""}
                  onClick={() => update(consume(state, item.id))}
                >
                  Use
                </button>
              )}
            </div>
          );
        })}
      </div>
      {picked && <GearDetail id={picked} onClose={() => setPick(null)} />}
    </div>
  );
}
