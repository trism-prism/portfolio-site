export type Point = { x: number; y: number };
export type Segment = { a: Point; b: Point };
export type Rect = { x: number; y: number; w: number; h: number };

const NUDGE = 1e-4; // radians; a ray this far either side of an endpoint slips past or into a corner
const EPS = 1e-9;
const TOUCH = 1e-3; // a wall this close to the light would swallow every ray, so it is ignored

function cross(ax: number, ay: number, bx: number, by: number) {
  return ax * by - ay * bx;
}

/** Liang-Barsky: the part of a segment inside the rectangle, or null. */
export function clipSegment(s: Segment, r: Rect): Segment | null {
  const dx = s.b.x - s.a.x;
  const dy = s.b.y - s.a.y;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [s.a.x - r.x, r.x + r.w - s.a.x, s.a.y - r.y, r.y + r.h - s.a.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        if (t > t1) return null;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return null;
        if (t < t1) t1 = t;
      }
    }
  }
  return {
    a: { x: s.a.x + t0 * dx, y: s.a.y + t0 * dy },
    b: { x: s.a.x + t1 * dx, y: s.a.y + t1 * dy },
  };
}

/** Distance from a point to a segment. */
export function distanceToSegment(p: Point, s: Segment): number {
  const dx = s.b.x - s.a.x;
  const dy = s.b.y - s.a.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - s.a.x) * dx + (p.y - s.a.y) * dy) / len2));
  return Math.hypot(p.x - (s.a.x + t * dx), p.y - (s.a.y + t * dy));
}

/** Even-odd point-in-polygon test. */
export function pointInPolygon(p: Point, poly: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * The region a point light can see: rays go to every wall endpoint and a hair to either side of it,
 * each stops at the nearest wall, and the hit points are sorted by angle.
 * The bounds rectangle closes the scene, so the polygon is always finite.
 */
export function visibilityPolygon(light: Point, bounds: Rect, walls: readonly Segment[]): Point[] {
  if (
    light.x < bounds.x ||
    light.x > bounds.x + bounds.w ||
    light.y < bounds.y ||
    light.y > bounds.y + bounds.h
  ) {
    return [];
  }
  const { x: bx, y: by, w, h } = bounds;
  const corners: Point[] = [
    { x: bx, y: by },
    { x: bx + w, y: by },
    { x: bx + w, y: by + h },
    { x: bx, y: by + h },
  ];
  const segs: Segment[] = corners.map((c, i) => ({ a: c, b: corners[(i + 1) % 4] }));
  for (const wall of walls) {
    const clipped = clipSegment(wall, bounds);
    if (clipped && distanceToSegment(light, clipped) > TOUCH) segs.push(clipped);
  }

  // One ray direction per distinct angle.
  const seen = new Set<string>();
  const angles: number[] = [];
  const addAngle = (a: number) => {
    const key = a.toFixed(7);
    if (!seen.has(key)) {
      seen.add(key);
      angles.push(a);
    }
  };
  for (const s of segs) {
    for (const p of [s.a, s.b]) {
      const dx = p.x - light.x;
      const dy = p.y - light.y;
      if (dx === 0 && dy === 0) continue;
      const a = Math.atan2(dy, dx);
      addAngle(a - NUDGE);
      addAngle(a);
      addAngle(a + NUDGE);
    }
  }
  angles.sort((m, n) => m - n);

  const out: Point[] = [];
  for (const a of angles) {
    const dx = Math.cos(a);
    const dy = Math.sin(a);
    let best = Infinity;
    for (const s of segs) {
      const sx = s.b.x - s.a.x;
      const sy = s.b.y - s.a.y;
      const denom = cross(dx, dy, sx, sy);
      if (Math.abs(denom) < EPS) continue; // parallel or collinear: this wall is edge-on
      const qx = s.a.x - light.x;
      const qy = s.a.y - light.y;
      const t = cross(qx, qy, sx, sy) / denom;
      const u = cross(qx, qy, dx, dy) / denom;
      if (t >= 0 && u >= -EPS && u <= 1 + EPS && t < best) best = t;
    }
    if (best !== Infinity) out.push({ x: light.x + dx * best, y: light.y + dy * best });
  }
  return out;
}

/** "x,y x,y ..." for an SVG polygon, rounded so server and client agree. */
export function toPoints(poly: readonly Point[]): string {
  return poly.map((p) => `${+p.x.toFixed(1)},${+p.y.toFixed(1)}`).join(' ');
}
