// The one hash. Same string, same number, forever — the day seed everything deterministic rides on.
export const seed = (str: string): number => {
  let h = 2166136261;
  for (const c of str) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296; // 0..1
};
