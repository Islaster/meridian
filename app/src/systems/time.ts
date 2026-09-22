import type { GameState } from "../state/types";
import type { Hours } from "../data/models/location";

type Time = GameState["time"];
const WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export const NIGHT_START = 20,
  DAY_START = 6;

export function advance(t: Time, hours: number): Time {
  const hour = Math.min(24, t.hour + hours);
  return {
    ...t,
    hour,
    block: hour >= NIGHT_START || hour < DAY_START ? "night" : "day",
  };
}
export function sleep(t: Time): Time {
  const dayId = t.dayId + 1;
  return { day: WEEK[dayId % 7], hour: DAY_START, block: "day", dayId };
}
export function isOpen(hours: Hours | undefined, t: Time): boolean {
  return !hours || (t.hour >= hours.open && t.hour < hours.close);
}
