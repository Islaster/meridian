import { useState } from "react";
import { useGame } from "@/state/game";
import { Item } from "@/data/items";
import type { Shop as ShopDef } from "@/data/world/locations";
import { buy, sell, sellPrice, carried, wornIn } from "@/systems/inventory";
import MenuButton from "@/ui/menubutton";
import LedgerLine from "@/ui/ledgerline";
import Tabs from "@/ui/tabs";
import { graded } from "@/ui/grade";
import { row, small, sheet } from "@/ui/styles";

const TABS = ["buy", "sell"] as const;

// The counter: what's on the shelf for your rank, and what the house will give for yours.
export default function Shop({
  shop,
  onClose,
}: {
  shop: ShopDef;
  onClose: () => void;
}) {
  const { state, update } = useGame();
  const [tab, setTab] = useState<(typeof TABS)[number]>("buy");
  const onShelf = [
    ...shop.stock,
    ...Object.entries(shop.ranked ?? {})
      .filter(([r]) => state.player.rank >= Number(r))
      .flatMap(([, ids]) => ids),
  ];
  const sellable = carried(state.bag).filter(
    ({ item }) =>
      item.kind !== "quest" && !wornIn(state.player.equipment, item.id)
  );
  return (
    <div style={sheet}>
      <LedgerLine>《Coin》 {state.bag.gold}</LedgerLine>
      <Tabs tabs={TABS} value={tab} onPick={setTab} />
      {tab === "buy" &&
        onShelf.map((id) => {
          const it = Item.get(id),
            can = state.bag.gold >= it.price;
          return (
            <div key={id} style={row}>
              <span>
                <span style={graded(it.grade)}>{it.name}</span>
                <span style={{ opacity: 0.5 }}> · {it.price}</span>
              </span>
              <button
                style={{ ...small, opacity: can ? 1 : 0.35 }}
                disabled={!can}
                onClick={() => update(buy(state, id))}
              >
                Buy
              </button>
            </div>
          );
        })}
      {tab === "sell" &&
        (sellable.length === 0 ? (
          <div style={{ opacity: 0.5 }}>Nothing the Guild wants.</div>
        ) : (
          sellable.map(({ item, qty }) => (
            <div key={item.id} style={row}>
              <span>
                <span style={graded(item.grade)}>{item.name}</span>
                {qty > 1 && <span style={{ opacity: 0.5 }}> ×{qty}</span>}
                <span style={{ opacity: 0.5 }}>
                  {" "}
                  · {sellPrice(item, shop.cut)}
                </span>
              </span>
              <button
                style={small}
                onClick={() => update(sell(state, item.id, shop.cut))}
              >
                Sell
              </button>
            </div>
          ))
        ))}
      <div style={{ opacity: 0.45, fontSize: "0.8em" }}>
        The Guild keeps {Math.round(shop.cut * 100)}% of every sale.
      </div>
      <div style={{ alignSelf: "center", marginTop: 8 }}>
        <MenuButton label="Close" onClick={onClose} />
      </div>
    </div>
  );
}
