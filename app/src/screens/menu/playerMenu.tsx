import { useEffect, useState } from "react";
import { useGame } from "../../state/gamecontext";
import { SERIF, MenuButton } from "../../ui/cards";
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
import GearDetail from "./geardetail";
import { GRADE_NAME, graded } from "../../ui/grade";
import Coachmark from "../../ui/coachmark";
import { currentIn, dismiss } from "../../systems/tutorial";

//types
type Tab = "inventory" | "character" | "skills" | "journal";
type Group = (typeof GROUPS)[number];
type Cat = (typeof CATS)[number];
type Sort = "name" | "power" | "worth" | "count";

//const variables
const GROUPS = ["active", "offered", "done"] as const;
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
const HEADING: Record<Cat, string> = {
  equipment: "gear",
  consumables: "supplies",
  materials: "materials",
  questItems: "Quest Items",
};
const SORTS: Record<Cat, Sort[]> = {
  equipment: ["power", "worth", "name"],
  consumables: ["power", "count", "worth"],
  materials: ["count", "worth", "name"],
  questItems: ["name"],
};
const chip = (on: boolean) => ({
  cursor: "pointer",
  opacity: on ? 1 : 0.45,
  fontSize: "0.85em",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
});

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
  const [cat, setCat] = useState<Cat>("equipment");
  const [sort, setSort] = useState<Sort>("power");
  const [kind, setKind] = useState<string>("all"); // a slot (gear) or a material group; "all" = everything
  const [pick, setPick] = useState<string | null>(null); // the piece of gear open in the side panel
  const p = state.player;
  const walk = currentIn(state, "menu"); // the menu's own walkthrough, the first time it's open; while a step names a tab, that tab is the one shown

  useEffect(() => {
    if (walk?.step.tab) setTab(walk.step.tab);
  }, [walk?.step.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (pick) setPick(null);
      else onClose();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [pick, onClose]);

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
          maxWidth:
            tab === "character" || (tab === "inventory" && pick) ? 960 : 640,
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
              <div style={{ display: "flex", gap: 16 }} data-tut="shelves">
                {CATS.map((c) => (
                  <span
                    key={c}
                    style={chip(cat === c)}
                    onClick={() => {
                      setCat(c);
                      setSort(SORTS[c][0]);
                      setKind("all");
                    }}
                  >
                    {HEADING[c]}
                  </span>
                ))}
              </div>
              {(() => {
                const list = (state.bag[cat] ?? []).map((it) => ({
                  it,
                  def: itemByName(it.name),
                }));
                // what a shelf can be narrowed to: gear by slot, materials by group
                const kinds = [
                  ...new Set(
                    list.map(({ def }) =>
                      cat === "equipment"
                        ? def?.slot ?? ""
                        : cat === "materials"
                        ? def?.tags[1] ?? ""
                        : ""
                    )
                  ),
                ].filter(Boolean);
                const power = (def?: ReturnType<typeof itemByName>) =>
                  def instanceof Weapon
                    ? def.damage
                    : def instanceof Armor
                    ? def.defense
                    : def instanceof Consumable
                    ? def.heal
                    : 0;
                const shown = list
                  .filter(({ def }) => {
                    if (kind === "all") return true;
                    return cat === "equipment"
                      ? def?.slot === kind
                      : def?.tags[1] === kind;
                  })
                  .sort((a, b) =>
                    sort === "name"
                      ? a.it.name.localeCompare(b.it.name)
                      : sort === "count"
                      ? b.it.qty - a.it.qty
                      : sort === "worth"
                      ? (b.def?.price ?? 0) - (a.def?.price ?? 0)
                      : power(b.def) - power(a.def)
                  );
                return (
                  <>
                    {(SORTS[cat].length > 1 || kinds.length > 1) && (
                      <div style={{ ...row, borderBottom: "none", padding: 0 }}>
                        <span style={{ display: "flex", gap: 12 }}>
                          {kinds.length > 1 &&
                            ["all", ...kinds].map((k) => (
                              <span
                                key={k}
                                style={chip(kind === k)}
                                onClick={() => setKind(k)}
                              >
                                {k}
                              </span>
                            ))}
                        </span>
                        <span style={{ display: "flex", gap: 12 }}>
                          {SORTS[cat].length > 1 &&
                            SORTS[cat].map((o) => (
                              <span
                                key={o}
                                style={chip(sort === o)}
                                onClick={() => setSort(o)}
                              >
                                {o}
                              </span>
                            ))}
                        </span>
                      </div>
                    )}
                    {shown.length === 0 && (
                      <div style={{ opacity: 0.4 }}>—</div>
                    )}
                    {shown.map(({ it, def }) => {
                      const gear =
                        def instanceof Weapon || def instanceof Armor;
                      const detail = [
                        def && def.grade !== "normal" && GRADE_NAME[def.grade],
                        def instanceof Weapon && `dmg ${def.damage}`,
                        def instanceof Armor && `def ${def.defense}`,
                        def instanceof Consumable && `+${def.heal} hp`,
                        gear && def.slot,
                        cat === "materials" && def?.tags[1],
                        def?.price ? `${def.price}g` : "",
                        ...(gear
                          ? Object.entries(def.reqStats).map(
                              ([k, n]) => `${k} ${n}`
                            )
                          : []),
                      ]
                        .filter(Boolean)
                        .join(" · ");
                      return (
                        <div key={it.name} style={row}>
                          <span
                            style={
                              gear
                                ? {
                                    cursor: "pointer",
                                    textDecoration:
                                      pick === it.name ? "underline" : "none",
                                  }
                                : undefined
                            }
                            onClick={() =>
                              gear && setPick(pick === it.name ? null : it.name)
                            }
                          >
                            <span style={graded(def?.grade)}>{it.name}</span>
                            {it.qty > 1 && (
                              <span style={{ opacity: 0.5 }}> ×{it.qty}</span>
                            )}
                            {detail && (
                              <span
                                style={{ opacity: 0.5, fontSize: "0.85em" }}
                              >
                                {" "}
                                · {detail}
                              </span>
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
                  </>
                );
              })()}
            </div>
            {pick &&
            (state.bag.equipment ?? []).some((it) => it.name === pick) ? (
              <GearDetail name={pick} onClose={() => setPick(null)} />
            ) : null}
          </div>
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
                  <span data-tut="stats">
                    Stats{p.statPoints > 0 && ` · ${p.statPoints} to spend`}
                  </span>
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
              <span data-tut="skills">
                Skills{p.skillPoints > 0 && ` · ${p.skillPoints} to spend`}
              </span>
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
              data-tut="journal"
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
        {walk && (
          <Coachmark
            title={walk.tutorial.title}
            text={walk.step.text}
            target={walk.step.target}
            showText
            onDone={() => changeState("done", dismiss(state, walk.step).done)}
          />
        )}
      </div>
    </div>
  );
}
