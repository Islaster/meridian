import { useState } from "react";
import { useGame } from "../../state/gamecontext";
import { SERIF, MenuButton } from "../../landing/cards";
import { Weapon, Armor, Consumable } from "../../data/items";
import { equip, unequip, itemByName, consume } from "../../systems/inventory";
import { xpToNext } from "../../systems/progression";
import {
  unmet,
  GLYPH,
  track,
  accept,
  whereOffered,
} from "../../systems/quests";
import { Quest } from "../../data/quests";
import { type GameState } from "../../state/types";
import { Skill } from "../../data/skills";

type Tab = "inventory" | "character" | "skills" | "journal";
const GROUPS = ["active", "offered", "done"] as const;
type Group = (typeof GROUPS)[number];
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
  const [group, setGroup] = useState<Group>("active");
  const p = state.player;

  // which section a quest belongs in — null = hidden (its next step now stands for the line)
  const section = (id: string, p: GameState["quests"][string]) => {
    const q = Quest.get(id);
    if (p.status === "notTaken") return "offered";
    if (p.status === "taken") return "active";
    const after = [q.next ?? []].flat();
    if (!after.length) return "done";
    return after.some((n) => state.quests[n]) ? null : "active";
  };

  const entries = Object.entries(state.quests).filter(
    ([id, p]) => section(id, p) === group
  );

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
          maxWidth: tab === "character" ? 960 : 640,
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
          {(["inventory", "character", "skills", "journal"] as Tab[]).map(
            (t) => (
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
            )
          )}
        </div>

        {tab === "inventory" && (
          <>
            <div style={row}>
              <span>Coin</span>
              <span>{state.bag.gold} gold</span>
            </div>
            {CATS.map((c) => (
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
                  {c === "consumables" ? "supplies" : c}
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
                      {def instanceof Consumable && (
                        <button
                          style={{
                            ...small,
                            opacity: p.hp >= p.maxHp ? 0.4 : 1,
                          }}
                          disabled={p.hp >= p.maxHp}
                          title={p.hp >= p.maxHp ? "unhurt" : ""}
                          onClick={() => {
                            const n = consume(state, def.id);
                            changeState("bag", n.bag);
                            changeState("player", n.player);
                          }}
                        >
                          Use
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}

        {tab === "character" && (
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
            <div
              style={{
                display: "flex",
                gap: 64,
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, minWidth: 320 }}>
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
                {p.weary && (
                  <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
                    weary · {p.weary.stat.toUpperCase()} −{p.weary.amount} until
                    you sleep properly
                  </div>
                )}
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
              </div>

              <div style={{ flex: 1, minWidth: 320 }}>
                <div
                  style={{
                    opacity: 0.5,
                    letterSpacing: "0.1em",
                    fontSize: "0.8em",
                    textTransform: "uppercase",
                  }}
                >
                  Equipped
                </div>
                {SLOTS.map((s) => (
                  <div key={s} style={row}>
                    <span style={{ opacity: 0.6 }}>
                      {s.replace(/([A-Z])/g, " $1").toLowerCase()}
                    </span>
                    <span style={{ whiteSpace: "nowrap" }}>
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
              </div>
            </div>
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
                <span>{Skill.get(k).name}</span>
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
        {tab === "journal" && (
          <>
            <div
              style={{
                display: "flex",
                gap: 16,
                fontSize: "0.85em",
                letterSpacing: "0.1em",
              }}
            >
              {GROUPS.map((g) => (
                <span
                  key={g}
                  onClick={() => setGroup(g)}
                  style={{
                    cursor: "pointer",
                    opacity: group === g ? 1 : 0.45,
                    textTransform: "uppercase",
                  }}
                >
                  {g}
                </span>
              ))}
            </div>
            {entries.length === 0 && <div style={{ opacity: 0.4 }}>—</div>}
            {entries.map(([id, p]) => {
              const q = Quest.get(id),
                why = unmet(state, q.acceptable);
              return (
                <div
                  key={id}
                  style={{ ...row, opacity: group === "done" ? 0.5 : 1 }}
                >
                  <span>
                    {GLYPH[q.kind]} {q.chain ?? q.name}
                    {p.status !== "complete" && (
                      <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
                        {q.objective}
                      </div>
                    )}
                    {group === "offered" && (
                      <div style={{ opacity: 0.6, fontSize: "0.9em" }}>
                        {whereOffered(state, id)}
                      </div>
                    )}
                  </span>
                  {p.status === "taken" && (
                    <button
                      style={small}
                      onClick={() =>
                        changeState("quests", track(state, id).quests)
                      }
                    >
                      {p.tracked ? "Tracked" : "Track"}
                    </button>
                  )}
                  {group === "offered" && (
                    <button
                      style={{ ...small, opacity: why ? 0.4 : 1 }}
                      disabled={!!why}
                      title={why ?? ""}
                      onClick={() =>
                        changeState("quests", accept(state, id).quests)
                      }
                    >
                      {why ? why : "Accept"}
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
        <div style={{ marginTop: 16, alignSelf: "center" }}>
          <MenuButton label="Close" onClick={onClose} />
        </div>
      </div>
    </div>
  );
}
