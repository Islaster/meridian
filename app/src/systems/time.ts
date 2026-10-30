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
const TIME_LINES: Record<string, string> = {
  Morning: "Morning. The shutters along harbor row come up one by one.",
  Noon: "Noon. The square empties into what shade there is.",
  Evening: "Evening. The light goes long and copper over the water.",
  Night:
    "Night. Lamps in a few windows, and the Gull & Lamp's is the brightest.",
};
export const HOP = 0.25; // a street hop, in hours — sheet row
export const WEARY = 0.25; // share of your best stat lost to a late night (min 1)
export const PRACTICE_PROF = 2; // per session, to the medium
export const PRACTICE_CAP = 2; // sessions per day that count
export const clock = (h: number) =>
  `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
export const dur = (h: number) => {
  const m = Math.round(h * 60);
  return m < 60
    ? `${m}m`
    : m % 60
    ? `${Math.floor(m / 60)}h ${m % 60}m`
    : `${m / 60}h`;
};
export const NIGHT_START = 20,
  DAY_START = 6;

export const timeOfDay = (h: number) =>
  h >= 20 || h < 6 ? "Night" : h < 12 ? "Morning" : h < 17 ? "Noon" : "Evening";

export const timeNote = (before: number, after: number): string | null =>
  timeOfDay(before) !== timeOfDay(after) ? TIME_LINES[timeOfDay(after)] : null;

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
