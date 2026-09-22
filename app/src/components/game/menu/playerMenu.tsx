import { useState } from "react";
import { useGame } from "../../../state/gamecontext";
import { SERIF, MenuButton } from "../../landing/cards";
import { Weapon, Armor } from "../../../data/items";
import { equip, unequip, itemByName } from "../../../systems/inventory";
import { xpToNext } from "../../../systems/progression";

type Tab = "inventory" | "character" | "skills";
const SLOTS = [
  "mainWeapon",
  "altWeapon",
  "head",
  "armor",
  "hands",
  "boots",
  "back",
  "ringOne",
  "ringTwo",
] as const;
const CATS = ["equipment", "consumables", "materials", "questItems"] as const;

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

export default function PlayerMenu({
  onClose,
  initialTab = "inventory",
}: {
  onClose: () => void;
  initialTab?: Tab;
}) {
  const { state, changeState } = useGame();
  const [tab, setTab] = useState<Tab>(initialTab);
  const p = state.player;

  const addStat = (k: string) =>
    changeState("player", {
      ...p,
      statPoints: p.statPoints - 1,
      stats: { ...p.stats, [k]: p.stats[k] + 1 },
    });
  const addSkill = (k: string) =>
    changeState("player", {
      ...p,
      skillPoints: p.skillPoints - 1,
      skills: { ...p.skills, [k]: p.skills[k] + 1 },
    });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.96)",
        color: "rgba(233,236,242,0.92)",
        font: `400 clamp(14px, 1.4vw, 18px) ${SERIF}`,
        padding: "48px 24px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 640,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            letterSpacing: "0.12em",
            fontSize: "0.85em",
          }}
        >
          {(["inventory", "character", "skills"] as Tab[]).map((t) => (
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

        {tab === "inventory" &&
          CATS.map((c) => (
            <div key={c}>
              <div
                style={{
                  opacity: 0.5,
                  letterSpacing: "0.1em",
                  fontSize: "0.8em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {c}
              </div>
              {(state.bag[c] ?? []).length === 0 && (
                <div style={{ opacity: 0.4 }}>—</div>
              )}
              {(state.bag[c] ?? []).map((it) => {
                const def = itemByName(it.name);
                const gear = def instanceof Weapon || def instanceof Armor;
                return (
                  <div key={it.name} style={row}>
                    <span>
                      {it.name}
                      {it.qty > 1 && (
                        <span style={{ opacity: 0.5 }}> ×{it.qty}</span>
                      )}
                    </span>
                    {gear &&
                      def &&
                      (() => {
                        const slot = (
                          Object.entries(p.equipment ?? {}) as [
                            keyof NonNullable<typeof p.equipment>,
                            string
                          ][]
                        ).find(([, name]) => name === it.name)?.[0];
                        return slot ? (
                          <button
                            style={small}
                            onClick={() =>
                              changeState("player", unequip(p, slot))
                            }
                          >
                            Unequip
                          </button>
                        ) : (
                          <button
                            style={small}
                            onClick={() =>
                              changeState("player", equip(p, def.id))
                            }
                          >
                            Equip
                          </button>
                        );
                      })()}
                  </div>
                );
              })}
            </div>
          ))}

        {tab === "character" && (
          <>
            <div style={row}>
              <span>{p.name}</span>
              <span style={{ opacity: 0.6 }}>
                Level {p.level} · {p.xp} / {xpToNext(p.level)} xp
              </span>
            </div>
            <div
              style={{
                opacity: 0.5,
                letterSpacing: "0.1em",
                fontSize: "0.8em",
                textTransform: "uppercase",
              }}
            >
              Stats{p.statPoints > 0 && ` · ${p.statPoints} to spend`}
            </div>
            {Object.entries(p.stats).map(([k, v]) => (
              <div key={k} style={row}>
                <span style={{ letterSpacing: "0.15em" }}>
                  {k.toUpperCase()}
                </span>
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
            <div
              style={{
                opacity: 0.5,
                letterSpacing: "0.1em",
                fontSize: "0.8em",
                textTransform: "uppercase",
                marginTop: 12,
              }}
            >
              Equipped
            </div>
            {SLOTS.map((s) => (
              <div key={s} style={row}>
                <span style={{ opacity: 0.6 }}>{s}</span>
                <span>
                  {p.equipment?.[s] ?? "—"}
                  {p.equipment?.[s] && (
                    <button
                      style={{ ...small, marginLeft: 12 }}
                      onClick={() => changeState("player", unequip(p, s))}
                    >
                      Unequip
                    </button>
                  )}
                </span>
              </div>
            ))}
          </>
        )}

        {tab === "skills" && (
          <>
            <div
              style={{
                opacity: 0.5,
                letterSpacing: "0.1em",
                fontSize: "0.8em",
                textTransform: "uppercase",
              }}
            >
              Skills{p.skillPoints > 0 && ` · ${p.skillPoints} to spend`}
            </div>
            {Object.keys(p.skills).length === 0 && (
              <div style={{ opacity: 0.5 }}>
                No skills yet. A master opens the first path.
              </div>
            )}
            {Object.entries(p.skills).map(([k, v]) => (
              <div key={k} style={row}>
                <span>{k}</span>
                <span>
                  {v}
                  {p.skillPoints > 0 && (
                    <button
                      style={{ ...small, marginLeft: 12 }}
                      onClick={() => addSkill(k)}
                    >
                      +
                    </button>
                  )}
                </span>
              </div>
            ))}
          </>
        )}

        <div style={{ marginTop: 16, alignSelf: "center" }}>
          <MenuButton label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
