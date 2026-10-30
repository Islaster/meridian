import type { GameState } from "../state/types";
import {
  Npc,
  type Action,
  type Location,
  type Placed,
} from "../models/location";
import { Quest } from "../data/quests";
import { spotActions } from "./gather";

export const placed = (): Placed[] => [
  ...[...Quest.registry.values()].flatMap((q) => q.actions),
  ...[...Npc.registry.values()].flatMap((n) => n.actions),
];

export const actionsAt = (loc: Location, s: GameState): Action[] => [
  ...loc.actions,
  ...placed().filter((a) => a.at === loc.id),
  ...spotActions(loc.id, s),
];
