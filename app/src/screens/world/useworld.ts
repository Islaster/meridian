import { useEffect, useState } from "react";
import { usePlay, useMidnight } from "@/screens/play/useplay";
import {
  Location,
  Npc,
  type Loadout,
  type Action,
} from "@/data/world/locations";
import { Dungeon } from "@/data/world/land";
import { advance, timeNote } from "@/systems/time";
import { progress, dispense, offer, accept } from "@/systems/quests";
import { signals } from "@/systems/signals";
import { perform } from "@/systems/actions";
import { lend } from "@/systems/inventory";
import { present, roaming } from "@/systems/presence";
import { enter } from "@/systems/dungeon";
import { leave } from "@/systems/classes";
import { current, dismiss } from "@/systems/tutorial";
import { valueOf } from "@/lib/flags";
import type { GameState } from "@/state/types";

// The world: a place, its pointers, and what each one does.
export function useWorld() {
  const play = usePlay();
  const { state, update, land } = play;
  const loc = Location.get(state.world.area);
  const [line, setLine] = useState<string | null>(null); // what someone just said
  const [loan, setLoan] = useState<Loadout[] | null>(null); // gear on offer
  const [prompt, setPrompt] = useState<string | null>(null); // a quest just offered
  const [focus, setFocus] = useState<string | null>(null); // what's open under the layout: an npc, "shop", "board", "bench"
  const [confirm, setConfirm] = useState<{
    text: string;
    go: () => void;
  } | null>(null);
  const sig = signals(state);
  const step = current(state);
  const tutorial =
    step && !state.done.includes(`tut:${step.step.id}`) ? step : null;

  // through one of the ways out: the next place, and the clock with it
  const go = (to: string) => {
    const e = loc.exits.find((x) => x.to === to);
    if (!e) return;
    const time = e.hours ? advance(state.time, e.hours) : state.time;
    if (Dungeon.registry.has(to))
      return update(enter({ ...state, time }, Dungeon.get(to)));
    setLine(null);
    setLoan(null);
    setFocus(null);
    const next = progress(
      { ...state, time, world: { ...state.world, area: to } },
      { kind: "visit", location: to }
    );
    const tn = timeNote(state.time.hour, next.time.hour);
    land(state, next, tn ? [{ kind: "story", text: tn }] : []);
  };

  const talk = (id: string) => {
    const n = Npc.get(id);
    setFocus(id);
    setLine(n.line);
    if (
      n.lends &&
      !state.player.equipment.weapon &&
      !state.done.some((f) => f.startsWith(`loan:${n.id}:`))
    )
      setLoan(n.lends);
    const next = dispense(progress(state, { kind: "talk", npc: id }), id);
    land(state, next);
    const mine = n.offers.find((q) => next.quests[q]?.status === "notTaken");
    if (mine) setPrompt(mine);
  };

  const take = (lo: Loadout) => {
    const npc = present(state, loc)
      .map((id) => Npc.get(id))
      .find((n) => n.lends === loan)!;
    const next = progress(lend(state, npc.id, lo), null);
    setLoan(null);
    land(state, next, [
      { kind: "reward", text: `Took ${lo.name.toLowerCase()}.` },
    ]);
  };

  // a pointer: a fight first if it has one; swearing elsewhere while sworn asks first
  const act = (a: Action, from: GameState = state) => {
    const sworn = valueOf(state.done, "sworn:");
    if (a.oath && sworn && sworn !== a.oath)
      return setConfirm({
        text: `You're sworn to ${
          Npc.get(sworn).name
        }. Taking this oath means walking out on them — and not every master forgives that. If you want that door kept open, ask their leave first.`,
        go: () => {
          setConfirm(null);
          act(a, leave(sworn, "betrayed")(state));
        },
      });
    if (a.fight)
      return play.setFight({
        monsters: a.fight,
        text: a.text,
        then: (s: GameState) => perform(s, a),
      });
    land(from, perform(from, a), [{ kind: "story", text: a.text }]);
  };

  const openBoard = () => {
    setFocus("board");
    if (state.player.rank >= 1) return;
    const r = loc.board?.onLocked?.(state);
    if (!r) return;
    setLine(r.say);
    if (r.next) land(state, progress(r.next, null));
  };
  // a box in the layout: a way out walks, a person talks, the rest opens under the layout
  const pick = (id: string) => {
    if (loc.exits.some((e) => e.to === id)) return go(id);
    if (focus === id) return setFocus(null);
    if (id === "board") return openBoard();
    if (id === "shop" || id === "bench") return setFocus(id);
    const a = loc.actions.find((x) => x.id === id);
    if (a) return act(a);
    talk(id);
  };
  const pickPosting = (id: string) => land(state, accept(offer(state, id), id));

  const wait = () => {
    const t = advance(state.time, 1);
    update({ ...state, time: t });
    const tn = timeNote(state.time.hour, t.hour);
    if (tn) play.setNotes([{ kind: "story", text: tn }]);
  };
  const rest = () => play.sleep("bed", loc.name.toLowerCase());
  const dismissTutorial = () => step && update(dismiss(state, step.step));

  // what roams here, when it roams, if the day dealt it and it hasn't been met yet
  useEffect(() => {
    const r = loc.roam;
    if (
      !r ||
      play.fight ||
      play.dead ||
      state.time.block !== r.when ||
      !roaming(state, loc)
    )
      return;
    if (state.done.includes(`act:roam-${loc.id}`)) return;
    play.setFight({
      monsters: r.monsters,
      text: r.text,
      then: (s) =>
        perform(s, { id: `roam-${loc.id}`, label: "", text: r.text }),
    });
  }, [state.world.area, state.time.hour]); // eslint-disable-line react-hooks/exhaustive-deps
  useMidnight(play, loc.canRest ? "bed" : "rough", loc.name.toLowerCase());

  return {
    play,
    state,
    loc,
    sig,
    line,
    loan,
    prompt,
    setPrompt,
    focus,
    setFocus,
    pick,
    confirm,
    setConfirm,
    tutorial,
    dismissTutorial,
    go,
    talk,
    take,
    act,
    openBoard,
    pickPosting,
    wait,
    rest,
  };
}
export type World = ReturnType<typeof useWorld>;
