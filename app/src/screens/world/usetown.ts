import { useEffect, useRef, useState } from "react";
import { useGame } from "../../state/gamecontext";
import {
  Location,
  Npc,
  type Loadout,
  type Action,
  type Upgrade,
} from "../../data/world/locations";
import { Dungeon } from "../../data/world/land";
import { advance, timeNote } from "../../systems/time";
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

import { type Spoils } from "../../systems/combat";
import type { GameState } from "../../state/types";
import type { Note } from "../../systems/types";
import { leave } from "../../systems/classes";
import { current, dismiss } from "../../systems/tutorial";
import { night } from "../../systems/night";

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
  const cur = current(state);
  const tutorial =
    cur && !state.done.includes(`tut:${cur.step.id}`) ? cur : null; // the step, until "Got it"
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
        world: {
          ...state.world,
          dungeon: to,
          room: Dungeon.get(to).entrance,
          delve: 0,
        },
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
    const sworn = state.done.find((f) => f.startsWith("sworn:"))?.slice(6);
    if (a.oath && sworn) {
      const cur = sworn;
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
  // the night, from here: a bed if the place has one, the ground if midnight caught you out
  const sleepNow = (rough: boolean) => {
    const r = night(state, rough ? "rough" : "bed", loc.name.toLowerCase());
    apply(r.state);
    commit();
    setNotes(r.notes);
  };
  const rest = () => sleepNow(false);
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
  // midnight ends the day wherever you are: in a bed, late; anywhere else, on the ground
  useEffect(() => {
    if (state.time.hour >= 24 && !fight && !dead) sleepNow(!loc.canRest);
  }, [state.time.hour, fight, dead]); // eslint-disable-line react-hooks/exhaustive-deps

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
    tutorial,
    dismissTutorial,
    bench,
    setBench,
  };
}
export type Town = ReturnType<typeof useTown>;
