// Timeline math: shot lookup, easing, transitions, seeded randomness.
import type { PlateShot, Shot, ShotHit, Timeline, TimelineShot } from "./types";

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;
export const easeOut = (t: number): number => 1 - (1 - t) * (1 - t);
export const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const smooth = (t: number): number => t * t * (3 - 2 * t);

export function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++)
    h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Deterministic per-cell noise for flicker: 0..1
export function cellNoise(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function buildTimeline(shots: Shot[]): Timeline {
  let t = 0;
  const list: TimelineShot[] = shots.map((s) => {
    const start = t;
    t += s.dur;
    return { ...s, start, end: t };
  });
  return { list, total: t };
}

export function shotAt(timeline: Timeline, T: number): ShotHit {
  for (const s of timeline.list) {
    if (T < s.end)
      return {
        shot: s,
        t: T - s.start,
        p: clamp01((T - s.start) / s.dur),
        done: false,
      };
  }
  const last = timeline.list[timeline.list.length - 1];
  return { shot: last, t: last.dur, p: 1, done: true };
}

// 1 = iris fully open. Shrinks toward 0 at a shot's edges when in/out === "iris".
export function irisRadius(shot: PlateShot, t: number, dur: number): number {
  let r = 1;
  if (shot.in === "iris") r = Math.min(r, clamp01(t / dur));
  if (shot.out === "iris") r = Math.min(r, clamp01((shot.dur - t) / dur));
  return r;
}

export function flashAlpha(shot: PlateShot, t: number, dur: number): number {
  return shot.in === "flash" ? clamp01(1 - t / dur) : 0;
}
