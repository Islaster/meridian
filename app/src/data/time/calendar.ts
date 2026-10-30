export const WEEK = 7,
  SEASON = 4 * WEEK,
  YEAR = 4 * SEASON; // 28-day seasons, 112-day year
export const SEASONS = ["spring", "summer", "autumn", "winter"] as const;
export const season = (dayId: number) =>
  SEASONS[Math.floor(((dayId - 1) % YEAR) / SEASON)];
