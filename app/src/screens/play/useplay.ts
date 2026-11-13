import { useEffect, useState } from "react";
import { useGame } from "@/state/game";
import type { GameState } from "@/state/types";
import { narrate, type Note } from "@/systems/narrate";
import { night, type Bed } from "@/systems/night";
import { takeItem } from "@/systems/inventory";
import { gainXp } from "@/systems/progression";
import type { Spoils } from "@/systems/combat";
import type { MenuTab } from "@/data/tutorial";

// A fight the scene started, and what happens to the state when it's won.
export interface Encounter {
  monsters: string[];
  text?: string; // the line that opens it
  then: (s: GameState, sp: Spoils) => GameState;
}
// what a fight hands back: who fell (as spoils), hp left, consumables spent
export interface Outcome {
  spoils: Spoils;
  hp: number;
  used: Record<string, number>;
}

// Everything a scene needs to play: the store, the log, the menu, the fight, death,
// and the one way every change lands — its lines, then its state.
export function usePlay() {
  const { state, update, commit, rollback } = useGame();
  const [notes, setNotes] = useState<Note[]>([]);
  const [menu, setMenu] = useState<MenuTab | null>(null);
  const [fight, setFight] = useState<Encounter | null>(null);
  const [dead, setDead] = useState(false);

  const land = (from: GameState, next: GameState, lead: Note[] = []) => {
    setNotes([...lead, ...narrate(from, next)]);
    update(next);
  };
  const clear = (kind: Note["kind"]) =>
    setNotes((n) => n.filter((x) => x.kind !== kind));

  // a night: the state after, committed as the morning you'd wake to
  const sleep = (bed: Bed, where: string) => {
    const r = night(state, bed, where);
    update(r.state);
    commit();
    setNotes(r.notes);
  };

  // the fight is over: hp and spent items settle, the fallen pay out; a win runs the scene's `then`
  const settle = (o: Outcome): GameState => {
    let bag = state.bag;
    for (const [id, n] of Object.entries(o.used)) bag = takeItem(bag, id, n);
    return {
      ...state,
      bag,
      player: gainXp({ ...state.player, hp: o.hp }, o.spoils.xp),
    };
  };
  const won = (o: Outcome) => {
    const f = fight!;
    setFight(null);
    land(
      state,
      f.then(settle(o), o.spoils),
      f.text ? [{ kind: "story", text: f.text }] : []
    );
  };
  const fled = (o: Outcome) => {
    setFight(null);
    land(state, settle(o));
  };

  return {
    state,
    update,
    commit,
    rollback,
    notes,
    setNotes,
    land,
    clear,
    menu,
    setMenu,
    fight,
    setFight,
    won,
    fled,
    dead,
    setDead,
    sleep,
  };
}
export type Play = ReturnType<typeof usePlay>;

// midnight ends the day wherever you stand: the scene says what kind of bed that is
export const useMidnight = (play: Play, bed: Bed, where: string) =>
  useEffect(() => {
    if (play.state.time.hour >= 24 && !play.fight && !play.dead)
      play.sleep(bed, where);
  }, [play.state.time.hour, play.fight, play.dead]); // eslint-disable-line react-hooks/exhaustive-deps
