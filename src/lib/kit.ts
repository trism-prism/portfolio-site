// Small timing and geometry helpers shared by the cover, focus and footer scenes.

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** Position of `t` inside [a, b], clamped to 0..1. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
export const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
/** Cinematic curve, roughly cubic-bezier(.16,1,.3,1). */
export const easeCine = (p: number) => 1 - Math.pow(1 - p, 4);
/** Loop phase in seconds within a cycle of `period`. */
export const loop = (t: number, period: number) => ((t % period) + period) % period;
/** 0 → 1 → 0 pulse in [a, b]. */
export const pulse = (t: number, a: number, b: number) => {
  const p = seg(t, a, b);
  return Math.sin(p * Math.PI);
};
/** Fade in over [a, a+f], hold, fade out over [b-f, b]. */
export const window_ = (t: number, a: number, b: number, f = 0.25) =>
  Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));

export type P = [number, number];

/** Point along a polyline at progress p (by length). */
export function along(pts: P[], p: number): P {
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    lens.push(l);
    total += l;
  }
  let d = clamp(p) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const q = lens[i] ? d / lens[i] : 0;
      return [lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)];
    }
    d -= lens[i];
  }
  return pts[pts.length - 1];
}

/** Cubic Bezier point. */
export function cubic(p0: P, p1: P, p2: P, p3: P, t: number): P {
  const u = 1 - t;
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}

/** Arc-length-sampled cubic so packets move at constant speed along curves. */
export function cubicAtLength(p0: P, p1: P, p2: P, p3: P, p: number, samples = 48): P {
  const table: number[] = [0];
  let prev = p0;
  for (let i = 1; i <= samples; i++) {
    const q = cubic(p0, p1, p2, p3, i / samples);
    table.push(table[i - 1] + Math.hypot(q[0] - prev[0], q[1] - prev[1]));
    prev = q;
  }
  const target = clamp(p) * table[samples];
  let lo = 0, hi = samples;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (table[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const span = table[i] - table[i - 1] || 1;
  const t = (i - 1 + (target - table[i - 1]) / span) / samples;
  return cubic(p0, p1, p2, p3, t);
}

export const cubicPath = (p0: P, p1: P, p2: P, p3: P) => `M${p0[0]},${p0[1]} C${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`;

/** Deterministic PRNG for seeded layouts. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
