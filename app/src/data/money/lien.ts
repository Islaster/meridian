import { SEASON, YEAR } from "../world/calendar";

export const LIEN = {
  amount: 12000,
  due: 1 + YEAR, // one year from the wake you inherit
  tiers: [
    [SEASON, 3],
    [2 * SEASON, 2],
    [YEAR, 1],
  ] as const, // paid by day → Guild standing
};
