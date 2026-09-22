// Palette-cycling-style pixel ops on the frame buffer (f.img). Predicates pick pixels by color and region.
import { cellNoise, clamp01 } from "./timeline";
import type { FrameContext, FxParams } from "./types";

const clampB = (v: number): number => (v < 0 ? 0 : v > 255 ? 255 : v | 0);

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Dither dissolve into another plate over the tail of the shot. Pixels swap in a Bayer weave — always crisp.
export function dissolve(f: FrameContext, params: FxParams = {}): void {
  const { img, W, H, p } = f;
  if (!img || !params.plate) return;
  const startP = params.startP ?? 0.7;
  const k = clamp01((p - startP) / (1 - startP));
  if (k <= 0) return;
  const src = f.plateData(params.plate).data;
  const d = img.data;
  for (let y = 0; y < H; y++) {
    const row = BAYER4[y & 3];
    for (let x = 0; x < W; x++) {
      if (k <= (row[x & 3] + 0.5) / 16) continue;
      const i = (y * W + x) * 4;
      d[i] = src[i];
      d[i + 1] = src[i + 1];
      d[i + 2] = src[i + 2];
    }
  }
}

// Light pixels in the sea region brighten in a traveling wave.
export function shimmer(f: FrameContext, params: FxParams = {}): void {
  const { img, W, H, T, L } = f;
  if (!img) return;
  const amp = params.amp ?? 0.2;
  const d = img.data;
  const y0 = Math.max(0, Math.floor(L.horizon) + 1);
  for (let y = y0; y < H; y++) {
    const ph = T * 3.5 + y * 0.7;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      if (b > r + 15 && r + g + b > 210) {
        const m = 1 + amp * Math.sin(ph + x * 0.45);
        d[i] = clampB(r * m);
        d[i + 1] = clampB(g * m);
        d[i + 2] = clampB(b * m);
      }
    }
  }
}

// Warm pixels outside the town flow downward: lava and embers.
export function lavaFlow(f: FrameContext, params: FxParams = {}): void {
  const { img, W, H, T, L } = f;
  if (!img) return;
  const amp = params.amp ?? 0.3;
  const d = img.data;
  const tw = L.town;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (x >= tw.x0 && x <= tw.x1 && y >= tw.y0 && y <= tw.y1) continue;
      const i = (y * W + x) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      if (r > 140 && r > g + 50 && b < 90) {
        const m = 1 + amp * Math.sin(T * 6 - y * 0.6 + x * 0.2);
        d[i] = clampB(r * m);
        d[i + 1] = clampB(g * m);
        d[i + 2] = clampB(b * m);
      }
    }
  }
}

// Warm pixels inside the town flicker like lamplight, quantized to ~8 fps.
export function windowFlicker(f: FrameContext): void {
  const { img, W, T, L } = f;
  if (!img) return;
  const d = img.data;
  const tw = L.town;
  const tick = Math.floor(T * 8);
  for (let y = Math.floor(tw.y0); y <= tw.y1; y++) {
    for (let x = Math.floor(tw.x0); x <= tw.x1; x++) {
      const i = (y * W + x) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      if (r > 140 && r > g + 30 && b < 120) {
        const m = 0.8 + 0.3 * cellNoise(x * 7 + y * 13 + tick * 31);
        d[i] = clampB(r * m);
        d[i + 1] = clampB(g * m);
        d[i + 2] = clampB(b * m);
      }
    }
  }
}

const isSmoke = (r: number, g: number, b: number): boolean => {
  const lum = r * 0.3 + g * 0.59 + b * 0.11;
  return (
    lum > 10 &&
    lum < 130 &&
    Math.max(r, g, b) - Math.min(r, g, b) < 26 &&
    b - r < 12
  ); // neutral = smoke, blue = sky
};

// Lava underlight: smoke near the vent warms toward ember, fading with distance, breathing with the glow.
export function smokeGlow(f: FrameContext, params: FxParams = {}): void {
  const { img, W, H, T, L } = f;
  if (!img) return;
  const strength = params.amp ?? 0.6;
  const radius = (params.radius ?? 0.3) * H;
  const pulse = 0.75 + 0.25 * Math.sin(T * 3); // same rhythm as eruptionGlow
  const d = img.data;
  const yMax = Math.min(H, Math.floor(L.tip.y + radius * 0.35));
  for (let y = 0; y < yMax; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = d[i],
        g = d[i + 1],
        b = d[i + 2];
      if (!isSmoke(r, g, b)) continue;
      const dx = x - L.tip.x,
        dy = y - L.tip.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;
      const w = (1 - dist / radius) ** 2 * strength * pulse;
      d[i] = clampB(r + (255 - r) * w);
      d[i + 1] = clampB(g + (122 - g) * w);
      d[i + 2] = clampB(b + (47 - b) * w * 0.6);
    }
  }
}

interface Flash {
  t0: number;
  period: number;
  x: number;
  y: number;
  r: number;
  dur: number;
}

// Volcanic lightning: brief cold flashes inside the plume, lighting the smoke from within. No bolt is drawn.
export function smokeFlash(f: FrameContext, params: FxParams = {}): void {
  const { img, W, H, t, L, shot } = f;
  if (!img) return;
  const strength = params.amp ?? 0.9;
  const flashes = f.memo<Flash[]>("flashes", () => {
    const r = f.rng("flashes");
    const n = params.sparse ? 3 : 6;
    const period0 = n / (params.rate ?? 1);
    const rg = params.region ?? {
      x0: L.tip.x / W - 0.21,
      y0: L.tip.y / H - 0.25,
      x1: L.tip.x / W + 0.09,
      y1: L.tip.y / H,
    };
    return Array.from({ length: n }, (_, i) => {
      const period = period0 * (0.7 + r() * 0.6);
      return {
        t0: params.loop ? (i === 0 ? 0 : r() * period) : r() * shot.dur, // loop: first fires on frame 0
        period,
        x: (rg.x0 + r() * (rg.x1 - rg.x0)) * W,
        y: (rg.y0 + r() * (rg.y1 - rg.y0)) * H,
        r: H * (0.4 + r() * 0.6) * (params.radius ?? 0.14),
        dur: 0.08 + r() * 0.16,
      };
    });
  });
  const d = img.data;
  for (const fl of flashes) {
    const age = params.loop
      ? (((t - fl.t0) % fl.period) + fl.period) % fl.period
      : t - fl.t0;
    if (age < 0 || age > fl.dur) continue;
    const k = strength * (1 - age / fl.dur);
    const x0 = Math.max(0, Math.floor(fl.x - fl.r)),
      x1 = Math.min(W - 1, Math.ceil(fl.x + fl.r));
    const y0 = Math.max(0, Math.floor(fl.y - fl.r)),
      y1 = Math.min(H - 1, Math.ceil(fl.y + fl.r));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const i = (y * W + x) * 4;
        const r = d[i],
          g = d[i + 1],
          b = d[i + 2];
        if (!isSmoke(r, g, b)) continue;
        const dx = x - fl.x,
          dy = y - fl.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > fl.r) continue;
        const w = (1 - dist / fl.r) * k;
        d[i] = clampB(r + (238 - r) * w);
        d[i + 1] = clampB(g + (243 - g) * w);
        d[i + 2] = clampB(b + (255 - b) * w);
      }
    }
  }
}
