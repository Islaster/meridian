export const TIER_COLORS = [
  "grey",
  "ember",
  "amber",
  "gold",
  "green",
  "blue",
  "violet",
  "black",
] as const;

// A gate has no depth — edge-on it's a line. Face-on it grows with tier: 10 × 3 ft at tier 1.
export const gateSize = (tier: number) => ({
  h: 10 + Math.max(0, tier - 1) * 2,
  w: 3 + Math.max(0, tier - 1),
});
