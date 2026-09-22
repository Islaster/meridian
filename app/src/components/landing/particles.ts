// Particles: gulls, chimney smoke, embers, ash. Stateless — position is a pure function of time.
import { PALETTE } from "./config";
import { clamp01 } from "./timeline";
import type { FrameContext, FxParams } from "./types";

interface Gull {
  x0: number;
  y: number;
  spd: number;
  ph: number;
}
interface Ember {
  i: number;
  spawn: number;
  vx: number;
  vy: number;
  life: number;
  hot: boolean;
}
interface Flake {
  x: number;
  y: number;
  spd: number;
  sway: number;
  ph: number;
  a: number;
}

export function gulls(f: FrameContext, params: FxParams = {}): void {
  const { ctx, W, H, t } = f;
  const birds = f.memo<Gull[]>("gulls", () => {
    const r = f.rng("gulls");
    return Array.from({ length: 4 }, () => ({
      x0: r() * W,
      y: H * (0.16 + r() * 0.16),
      spd: (6 + r() * 5) * (r() > 0.5 ? 1 : -1),
      ph: r() * 6.28,
    }));
  });
  ctx.fillStyle = PALETTE.gull;
  for (const b of birds) {
    let x: number, y: number;
    if (params.flee) {
      const away = Math.sign(b.x0 - W / 2) || 1;
      x = b.x0 + away * t * 40;
      y = b.y - t * 6;
    } else {
      const span = W + 10;
      x = ((((b.x0 + b.spd * t) % span) + span) % span) - 5;
      y = b.y + Math.sin(t * 0.8 + b.ph) * 2;
    }
    const wing = Math.floor((t * 4 + b.ph) % 2) === 0;
    x = Math.round(x);
    y = Math.round(y);
    if (x < -3 || x > W + 3 || y < -3) continue;
    ctx.fillRect(x - 1, y + (wing ? 0 : -1), 1, 1);
    ctx.fillRect(x, y - (wing ? 1 : 0), 1, 1);
    ctx.fillRect(x + 1, y + (wing ? 0 : -1), 1, 1);
  }
}

export function chimney(f: FrameContext): void {
  const { ctx, t, L } = f;
  for (const c of L.chimneys) {
    for (let k = 0; k < 5; k++) {
      const age = (t * 0.6 + k * 0.9) % 4;
      const y = c.y - age * 3;
      const x = c.x + Math.sin(age * 1.5 + k) * 1.2;
      ctx.fillStyle = `rgba(140,146,160,${(0.4 * (1 - age / 4)).toFixed(3)})`;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
    }
  }
}

export function embers(f: FrameContext, params: FxParams = {}): void {
  const { ctx, W, H, t, L, shot } = f;
  const list = f.memo<Ember[]>("embers", () => {
    const r = f.rng("embers");
    return Array.from({ length: 120 }, (_, i) => {
      const ang = -Math.PI / 2 + (r() - 0.5) * 1.4;
      const spd = 0.25 + r() * 0.55;
      return {
        i,
        spawn: r() * 0.8,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 1.4 + r() * 2.2,
        hot: r() > 0.7,
      };
    });
  });
  for (const m of list) {
    if (params.sparse && m.i % 3) continue;
    const age = t - m.spawn * shot.dur;
    if (age < 0 || age > m.life) continue;
    const x = L.tip.x + m.vx * age * W * 0.35;
    const y = L.tip.y + m.vy * age * H * 0.5 + 0.5 * 0.09 * age * age * H;
    ctx.fillStyle = m.hot ? PALETTE.emberBright : PALETTE.ember;
    ctx.globalAlpha = clamp01((1 - age / m.life) * 0.9);
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  ctx.globalAlpha = 1;
}

export function ash(f: FrameContext): void {
  const { ctx, W, H, T } = f;
  const flakes = f.memo<Flake[]>("ash", () => {
    const r = f.rng("ash");
    return Array.from({ length: 90 }, () => ({
      x: r(),
      y: r(),
      spd: 0.02 + r() * 0.035,
      sway: 0.004 + r() * 0.01,
      ph: r() * 6.28,
      a: 0.25 + r() * 0.4,
    }));
  });
  ctx.fillStyle = PALETTE.ash;
  for (const k of flakes) {
    const y = ((k.y + T * k.spd) % 1) * H;
    const x = (k.x + Math.sin(T * 0.6 + k.ph) * k.sway) * W;
    ctx.globalAlpha = k.a;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
  }
  ctx.globalAlpha = 1;
}
