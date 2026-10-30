import { useState } from "react";
import { useGame } from "../../state/gamecontext";
import { Item } from "../../data/items";
import type { Shop as ShopDef } from "../../data/world/locations";
import { buy, sell, itemByName } from "../../systems/inventory";
import { SERIF, MenuButton } from "../../ui/cards";
import LedgerLine from "../../ui/ledgerline";

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "6px 0",
  borderBottom: "1px solid rgba(233,236,242,0.1)",
};
const small = {
  font: "inherit",
  color: "inherit",
  background: "transparent",
  border: "1px solid rgba(233,236,242,0.28)",
  padding: "2px 10px",
  cursor: "pointer",
};

export default function Shop({
  shop,
  onClose,
}: {
  shop: ShopDef;
  onClose: () => void;
}) {
  const { state, changeState } = useGame();
  const onShelf = [
    ...shop.stock,
    ...Object.entries(shop.ranked ?? {})
      .filter(([r]) => state.player.rank >= Number(r))
      .flatMap(([, ids]) => ids),
  ];
  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const sellable = [
    ...(state.bag.materials ?? []),
    ...(state.bag.equipment ?? []),
    ...(state.bag.consumables ?? []),
  ].filter(
    (i) => !Object.values(state.player.equipment ?? {}).includes(i.name)
  );
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 40,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "#000",
          border: "1px solid rgba(233,236,242,0.2)",
          padding: "28px 32px",
          color: "rgba(233,236,242,0.92)",
          font: `400 clamp(14px, 1.4vw, 18px) ${SERIF}`,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <LedgerLine>《Coin》 {state.bag.gold}</LedgerLine>
        <div
          style={{
            display: "flex",
            gap: 24,
            letterSpacing: "0.12em",
            fontSize: "0.85em",
          }}
        >
          {(["buy", "sell"] as const).map((t) => (
            <span
              key={t}
              onClick={() => setTab(t)}
              style={{
                cursor: "pointer",
                opacity: tab === t ? 1 : 0.45,
                textTransform: "uppercase",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        {tab === "buy" &&
          onShelf.map((id) => {
            const it = Item.get(id),
              can = state.bag.gold >= it.price;
            return (
              <div key={id} style={row}>
                <span>
                  {it.name}
                  <span style={{ opacity: 0.5 }}> · {it.price}</span>
                </span>
                <button
                  style={{ ...small, opacity: can ? 1 : 0.35 }}
                  disabled={!can}
                  onClick={() => {
                    const n = buy(state, id);
                    if (n) changeState("bag", n.bag);
                  }}
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
            sellable.map((i) => {
              const it = itemByName(i.name),
                gets = it ? Math.floor(it.price * (1 - shop.cut)) : 0;
              return (
                <div key={i.name} style={row}>
                  <span>
                    {i.name}
                    {i.qty > 1 && (
                      <span style={{ opacity: 0.5 }}> ×{i.qty}</span>
                    )}
                    <span style={{ opacity: 0.5 }}> · {gets}</span>
                  </span>
                  <button
                    style={small}
                    onClick={() =>
                      changeState("bag", sell(state, i.name, shop.cut).bag)
                    }
                  >
                    Sell
                  </button>
                </div>
              );
            })
          ))}
        <div style={{ opacity: 0.45, fontSize: "0.8em" }}>
          The Guild keeps {Math.round(shop.cut * 100)}% of every sale.
        </div>
        <div style={{ alignSelf: "center", marginTop: 8 }}>
          <MenuButton label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
