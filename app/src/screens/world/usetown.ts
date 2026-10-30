import { useEffect, useRef, useState } from "react";
import { useGame } from "../../state/gamecontext";
import {
  Location,
  Npc,
  type Loadout,
  type Action,
  type Upgrade,
} from "../../data/locations";
import { Dungeon } from "../../data/land";
import { advance, sleep, timeNote, WEARY } from "../../systems/time";
import {
  progress,
  signals,
  narrate,
  dispense,
  offer as offerQuest,
  accept,
} from "../../systems/quests";
import { lend, giveItem } from "../../systems/inventory";
import { present, roaming } from "../../systems/presence";
import { build } from "../../systems/property";

import { type Spoils, refresh } from "../../systems/combat";
import type { GameState } from "../../state/types";
import type { Note } from "../../systems/types";
import { PlayerClass } from "../../data/classes";
import { leave } from "../../systems/classes";
import { current, dismiss } from "../../systems/tutorial";

export type Tab = "inventory" | "character" | "skills" | "journal";

export function useTown() {
  const { state, changeState, commit, rollback } = useGame();
  const loc = Location.get(state.world.area);
  const [line, setLine] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [offer, setOffer] = useState<Loadout[] | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [shop, setShop] = useState(false);
  const [menu, setMenu] = useState<Tab | null>(null);
  const [board, setBoard] = useState(false);
  const [bench, setBench] = useState(false);
  const [fight, setFight] = useState<Action | null>(null);
  const [dead, setDead] = useState(false);
  const before = useRef<GameState>(state);
  const [confirm, setConfirm] = useState<{
    text: string;
    go: () => void;
  } | null>(null);
  const tut = current(state);
  const tutorial =
    tut && !state.done.includes(`tut:${tut.step.id}`) ? tut : null;
  const cur = current(state);
  const tutorialSeen = !!cur && state.done.includes(`tut:${cur.step.id}`);
  const dismissTutorial = () => cur && apply(dismiss(state, cur.step));
  const sig = signals(state);
  const apply = (n: GameState) =>
    (Object.keys(n) as (keyof GameState)[]).forEach((k) =>
      changeState(k, n[k])
    );

  // every change lands the same way: notes, a prompt for anything newly offered, apply
  const land = (from: GameState, next: GameState, lead: Note[] = []) => {
    setNotes([...lead, ...narrate(from, next)]);
    apply(next);
  };

  const go = (to: string, hours: number) => {
    const time = hours ? advance(state.time, hours) : state.time;
    if (Dungeon.registry.has(to))
      return apply({
        ...state,
        time,
        world: { ...state.world, dungeon: to, room: Dungeon.get(to).entrance },
      });
    setLine(null);
    setOffer(null);
    const next = progress(
      { ...state, time, world: { ...state.world, area: to } },
      { kind: "visit", location: to }
    );
    const tn = timeNote(state.time.hour, next.time.hour);
    land(state, next, tn ? [{ kind: "story", text: tn }] : []);
  };

  const talk = (id: string) => {
    const n = Npc.get(id);
    setLine(n.line);
    if (
      n.lends &&
      !state.player.equipment?.mainWeapon &&
      !state.done.some((f) => f.startsWith(`loan:${n.id}:`))
    )
      setOffer(n.lends);
    const next = dispense(progress(state, { kind: "talk", npc: id }), id);
    land(state, next);
    const mine = (n.offers ?? []).find(
      (q) => next.quests[q]?.status === "notTaken"
    );
    if (mine) setPrompt(mine);
  };

  const take = (lo: Loadout) => {
    const npc = present(state, loc)
      .map((id) => Npc.get(id))
      .find((n) => n.lends === offer)!;
    const next = progress(lend(state, npc.id, lo), null);
    setOffer(null);
    land(state, next, [
      {
        kind: "reward",
        text: `Took ${lo.name.toLowerCase()}. Equipped: ${
          next.player.equipment?.mainWeapon
        }.`,
      },
    ]);
  };

  // what an action does once it's earned — directly, or after its fight is won
  const perform = (a: Action, from: GameState = state) => {
    const flag = `act:${a.id}`;
    const base = {
      ...from,
      done: a.repeat ? from.done : [...from.done, flag],
      bag: a.gold ? { ...from.bag, gold: from.bag.gold - a.gold } : from.bag,
      time: a.hours ? advance(from.time, a.hours) : from.time,
    };
    land(
      before.current,
      progress(a.effect ? a.effect(base) : base, { kind: "flag", flag }),
      [{ kind: "story", text: a.text }]
    );
  };
  const act = (a: Action) => {
    before.current = state;
    if (a.oath && state.done.includes("sworn")) {
      const cur = PlayerClass.get(state.player.class!).master; // the current master is the current class's
      return setConfirm({
        text: `You're sworn to ${
          Npc.get(cur).name
        }. Taking this oath means walking out on them — and not every master forgives that. If you want that door kept open, ask their leave first.`,
        go: () => {
          setConfirm(null);
          perform(a, leave(cur, "betrayed")(state));
        },
      });
    }
    a.fight ? setFight(a) : perform(a);
  };
  const won = (sp: Spoils) => {
    const a = fight!;
    let bag = { ...state.bag, gold: state.bag.gold + sp.gold };
    for (const id of sp.items) bag = giveItem(bag, id, 1);
    setFight(null);
    perform(a, { ...state, bag });
  };

  const openBoard = () => {
    if (state.player.rank >= 1) return setBoard(true);
    const r = loc.board?.onLocked?.(state);
    if (!r) return;
    setLine(r.say);
    if (r.next) land(state, progress(r.next, null));
  };
  const pickPosting = (id: string) =>
    land(state, accept(offerQuest(state, id), id));
  const raise = (u: Upgrade) => {
    setNotes([{ kind: "story", text: u.text }]);
    apply(build(state, u));
  };

  const wait = () => {
    const t = advance(state.time, 1);
    changeState("time", t);
    const tn = timeNote(state.time.hour, t.hour);
    if (tn) setNotes([{ kind: "story", text: tn }]);
  };
  const rest = () => {
    const late = state.time.hour < 6 || state.time.hour >= 24; // past midnight
    let player = {
      ...state.player,
      hp: state.player.maxHp,
      mp: state.player.maxMp,
    };
    // yesterday's weariness lifts
    if (player.weary) {
      const { stat, amount } = player.weary;
      player = {
        ...player,
        stats: { ...player.stats, [stat]: player.stats[stat] + amount },
        weary: undefined,
      };
    }
    let note: Note | null = null;
    if (late) {
      const [stat, value] = Object.entries(player.stats).sort(
        (a, b) => b[1] - a[1]
      )[0];
      const amount = Math.max(1, Math.round(value * WEARY));
      player = {
        ...player,
        stats: { ...player.stats, [stat]: value - amount },
        weary: { stat, amount },
      };
      note = {
        kind: "story",
        text: `You slept past midnight and it shows. ${stat.toUpperCase()} is down ${amount} until you sleep properly.`,
      };
    }
    changeState("player", player);
    changeState("time", sleep(state.time));
    changeState("done", refresh(state.done, state.time.dayId + 1));
    commit();
    setNotes(note ? [note] : []);
  };
  const clearLevelUp = () =>
    setNotes(notes.filter((n) => n.kind !== "levelup"));

  // what roams here, when it roams, if the day dealt it and it hasn't been met yet
  useEffect(() => {
    const r = loc.roam;
    if (
      !r ||
      fight ||
      dead ||
      state.time.block !== r.when ||
      !roaming(state, loc)
    )
      return;
    if (state.done.includes(`act:roam-${loc.id}`)) return;
    before.current = state;
    setFight({
      id: `roam-${loc.id}`,
      label: "",
      text: r.text,
      fight: r.monsters,
    });
  }, [state.world.area, state.time.hour]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    loc,
    sig,
    rollback,
    line,
    notes,
    setNotes,
    offer,
    prompt,
    setPrompt,
    shop,
    setShop,
    menu,
    setMenu,
    board,
    setBoard,
    fight,
    setFight,
    dead,
    setDead,
    go,
    talk,
    take,
    act,
    won,
    openBoard,
    pickPosting,
    raise,
    wait,
    rest,
    clearLevelUp,
    confirm,
    setConfirm,
    tut,
    tutorial,
    dismissTutorial,
    cur,
    tutorialSeen,
    bench,
    setBench,
  };
}
export type Town = ReturnType<typeof useTown>;
