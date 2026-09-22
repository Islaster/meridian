// Light: the false night's stars, the seam, the eruption's glow.
import { PALETTE } from "./config";
import { clamp01, smooth } from "./timeline";
import type { FrameContext, FxParams, Point } from "./types";

interface Star {
  x: number;
  y: number;
  ph: number;
  death: number;
  big: boolean;
}

function starField(f: FrameContext): Star[] {
  return f.memo<Star[]>("stars", () => {
    const r = f.rng("stars");
    const data = f.plateData("night");
    const { W, L } = f;
    const out: Star[] = [];
    for (let i = 0; i < 160 && out.length < 60; i++) {
      const x = Math.floor(r() * W),
        y = Math.floor(r() * L.horizon * 0.85);
      const k = (y * W + x) * 4;
      const lum =
        data.data[k] * 0.3 + data.data[k + 1] * 0.59 + data.data[k + 2] * 0.11;
      if (lum < 70) out.push({ x, y, ph: r(), death: r(), big: r() > 0.85 });
    }
    return out;
  });
}

function drawStar(ctx: CanvasRenderingContext2D, s: Star, a: number): void {
  ctx.globalAlpha = a;
  ctx.fillStyle = PALETTE.star;
  ctx.fillRect(s.x, s.y, 1, 1);
  if (s.big) {
    ctx.globalAlpha = a * 0.5;
    ctx.fillRect(s.x - 1, s.y, 1, 1);
    ctx.fillRect(s.x + 1, s.y, 1, 1);
    ctx.fillRect(s.x, s.y - 1, 1, 1);
    ctx.fillRect(s.x, s.y + 1, 1, 1);
  }
}

export function starsIn(f: FrameContext): void {
  const { ctx, p, T } = f;
  for (const s of starField(f)) {
    const a =
      clamp01((p - s.ph * 0.6) / 0.4) *
      (0.75 + 0.25 * Math.sin(T * 3 + s.ph * 6));
    if (a > 0) drawStar(ctx, s, a);
  }
  ctx.globalAlpha = 1;
}

export function starsOut(f: FrameContext): void {
  const { ctx, p, T } = f;
  for (const s of starField(f)) {
    const death = 0.15 + s.death * 0.7;
    if (p >= death) continue;
    drawStar(ctx, s, 0.7 + 0.3 * Math.sin(T * 3 + s.ph * 6));
  }
  ctx.globalAlpha = 1;
}

function seamPath(f: FrameContext): Point[] {
  return f.memo<Point[]>("seamPath", () => {
    const r = f.rng("seam");
    const { L, W } = f;
    const pts: Point[] = [];
    for (let i = 0; i <= 12; i++) {
      const q = i / 12;
      pts.push({
        x: L.tip.x + (r() - 0.5) * W * 0.06 * Math.sin(q * Math.PI),
        y: L.seamTop + (L.tip.y - L.seamTop) * q,
      });
    }
    pts[12] = { x: L.tip.x, y: L.tip.y };
    return pts;
  });
}

function strokePath(
  ctx: CanvasRenderingContext2D,
  pts: Point[],
  upTo: number,
  color: string,
  width: number,
  alpha: number,
  blur: number
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    if (i / (pts.length - 1) > upTo) break;
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

export function seamDescent(f: FrameContext, params: FxParams = {}): void {
  const { ctx, p, T } = f;
  const startP = params.startP ?? 0.55;
  const q = clamp01((p - startP) / (1 - startP));
  if (q <= 0) return;
  const jitter = Math.sin(T * 41) * 0.5;
  const moved = seamPath(f).map((pt) => ({ x: pt.x + jitter, y: pt.y }));
  strokePath(ctx, moved, q, PALETTE.seamGlow, 3, 0.35, 4);
  strokePath(ctx, moved, q, PALETTE.seamCore, 1, 0.95, 2);
}

export function seamBreathe(f: FrameContext): void {
  const { ctx, W, H, T } = f;
  const pulse = 0.5 + 0.5 * Math.sin(T * 2.2);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  strokePath(ctx, seamPath(f), 1, PALETTE.seamGlow, 3, 0.18 + 0.22 * pulse, 5);
  ctx.fillStyle = `rgba(159,180,255,${(0.035 * pulse).toFixed(3)})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function eruptionGlow(f: FrameContext): void {
  const { ctx, W, p, T, L } = f;
  const r =
    W * (0.05 + 0.08 * smooth(clamp01(p * 2))) * (1 + 0.06 * Math.sin(T * 3));
  const g = ctx.createRadialGradient(L.tip.x, L.tip.y, 0, L.tip.x, L.tip.y, r);
  g.addColorStop(0, "rgba(255,177,92,0.55)");
  g.addColorStop(0.4, "rgba(255,122,47,0.3)");
  g.addColorStop(1, "rgba(255,122,47,0)");
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(L.tip.x - r, L.tip.y - r, r * 2, r * 2);
  ctx.restore();
}
