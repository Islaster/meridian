// Weather: the darkening crossfade, smoke and silhouettes, the wave.
import { PALETTE } from "./config";
import { clamp01, smooth } from "./timeline";
import type { FrameContext } from "./types";

interface Puff {
  spawn: number;
  dx: number;
  rise: number;
  drift: number;
  size: number;
  a: number;
}
interface Shape {
  y: number;
  x0: number;
  spd: number;
  spawn: number;
}

// The light draining: day → half-dark → night, drawn over the day base plate.
export function drain(f: FrameContext): void {
  const { p } = f;
  f.drawPlate("halfdark", clamp01(p * 2));
  f.drawPlate("night", clamp01((p - 0.5) * 2));
}

export function smokeDrift(f: FrameContext): void {
  const { ctx, W, H, t, p, L, shot } = f;
  const puffs = f.memo<Puff[]>("smoke", () => {
    const r = f.rng("smoke");
    return Array.from({ length: 28 }, () => ({
      spawn: r(),
      dx: (r() - 0.5) * 0.04,
      rise: 0.05 + r() * 0.06,
      drift: 0.05 + r() * 0.05,
      size: 0.03 + r() * 0.05,
      a: 0.35 + r() * 0.3,
    }));
  });
  ctx.save();
  ctx.fillStyle = PALETTE.smoke;
  for (const q of puffs) {
    const age = t - q.spawn * shot.dur * 0.5;
    if (age < 0) continue;
    const x = L.tip.x + q.dx * W - age * q.drift * W;
    const y = L.tip.y - age * q.rise * H;
    const rad = W * (q.size + age * 0.025);
    ctx.globalAlpha = q.a * clamp01(age * 0.8) * clamp01(1.6 - age * 0.08);
    ctx.beginPath();
    ctx.arc(Math.round(x), Math.round(y), Math.round(rad), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 0.35 * smooth(p);
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Small dark shapes crossing RIGHT — against the smoke's leftward drift.
export function silhouettes(f: FrameContext): void {
  const { ctx, W, H, t, shot } = f;
  const list = f.memo<Shape[]>("silhouettes", () => {
    const r = f.rng("silhouettes");
    return Array.from({ length: 4 }, () => ({
      y: 0.12 + r() * 0.2,
      x0: -0.1 + r() * 0.3,
      spd: 0.04 + r() * 0.03,
      spawn: 0.2 + r() * 0.4,
    }));
  });
  ctx.fillStyle = "#000000";
  for (const s of list) {
    const age = t - s.spawn * shot.dur;
    if (age < 0) continue;
    const x = Math.round((s.x0 + age * s.spd) * W);
    const y = Math.round(s.y * H + Math.sin(age * 1.7) * 2);
    const wing = Math.floor(age * 3) % 2;
    ctx.globalAlpha = 0.5 * clamp01(age * 0.6);
    ctx.fillRect(x - 2, y - wing, 2, 1);
    ctx.fillRect(x, y, 1, 1);
    ctx.fillRect(x + 1, y - wing, 2, 1);
  }
  ctx.globalAlpha = 1;
}

// The wave rises from the horizon until it fills the frame; the crest light cycles.
export function wave(f: FrameContext): void {
  const { ctx, W, H, p, T, L } = f;
  const amp = smooth(p) * H * 0.98;
  if (amp < 1) return;
  const front: number[] = [];
  for (let x = 0; x <= W; x++)
    front.push(
      Math.round(
        L.horizon -
          amp +
          Math.sin(x * 0.08 + T * 3) * 3 +
          Math.sin(x * 0.021 - T) * 5
      )
    );
  ctx.fillStyle = PALETTE.seaDark;
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let x = 0; x <= W; x++) ctx.lineTo(x, front[x]);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PALETTE.crest;
  for (let x = 0; x < W; x += 2) {
    ctx.globalAlpha = 0.45 + 0.45 * Math.max(0, Math.sin(T * 6 + x * 0.3));
    ctx.fillRect(x, front[x], 2, 2);
  }
  ctx.globalAlpha = 1;
}
