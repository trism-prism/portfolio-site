// A small browser sketch of 2D visibility: the region a point light can see among line-segment walls.
// It uses the classic "ray at every endpoint, plus a tiny angle either side" approach, which is simpler
// than the engine project's exact method. It also counts wall tests for brute force and for a uniform
// grid walked cell by cell (Amanatides-Woo), so the cover and demo can show the difference.

export type Pt = { x: number; y: number };
export type Seg = { a: Pt; b: Pt };

export type VisResult = {
  polygon: Pt[];
  rays: number;
  bruteTests: number;
  gridTests: number;
};

const EPS = 1e-4;

/** Ray (origin o, direction d) against segment s. Returns the ray parameter t, or null. */
export function raySeg(o: Pt, d: Pt, s: Seg): number | null {
  const ex = s.b.x - s.a.x;
  const ey = s.b.y - s.a.y;
  const den = d.x * ey - d.y * ex;
  if (Math.abs(den) < 1e-12) return null;
  const wx = s.a.x - o.x;
  const wy = s.a.y - o.y;
  const t = (wx * ey - wy * ex) / den;
  const u = (wx * d.y - wy * d.x) / den;
  if (t < 0 || u < -1e-9 || u > 1 + 1e-9) return null;
  return t;
}

export function boxWalls(w: number, h: number): Seg[] {
  const p = (x: number, y: number) => ({ x, y });
  return [
    { a: p(0, 0), b: p(w, 0) },
    { a: p(w, 0), b: p(w, h) },
    { a: p(w, h), b: p(0, h) },
    { a: p(0, h), b: p(0, 0) },
  ];
}

export type Grid = { size: number; cols: number; rows: number; cells: number[][] };

/** Registers each wall into every cell its segment passes through (sampled densely enough for these sizes). */
export function buildGrid(walls: Seg[], w: number, h: number, size: number): Grid {
  const cols = Math.max(1, Math.ceil(w / size));
  const rows = Math.max(1, Math.ceil(h / size));
  const cells: number[][] = Array.from({ length: cols * rows }, () => []);
  walls.forEach((s, i) => {
    const len = Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y);
    const steps = Math.max(2, Math.ceil(len / (size / 4)));
    for (let k = 0; k <= steps; k++) {
      const x = s.a.x + ((s.b.x - s.a.x) * k) / steps;
      const y = s.a.y + ((s.b.y - s.a.y) * k) / steps;
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(x / size)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(y / size)));
      const cell = cells[cy * cols + cx];
      if (cell[cell.length - 1] !== i && !cell.includes(i)) cell.push(i);
    }
  });
  return { size, cols, rows, cells };
}

/** Walks grid cells along the ray in order; returns nearest hit and how many wall tests it took. */
export function gridCast(o: Pt, d: Pt, walls: Seg[], g: Grid, visit?: (cx: number, cy: number) => void) {
  let cx = Math.min(g.cols - 1, Math.max(0, Math.floor(o.x / g.size)));
  let cy = Math.min(g.rows - 1, Math.max(0, Math.floor(o.y / g.size)));
  const stepX = d.x > 0 ? 1 : -1;
  const stepY = d.y > 0 ? 1 : -1;
  const tDeltaX = d.x !== 0 ? Math.abs(g.size / d.x) : Infinity;
  const tDeltaY = d.y !== 0 ? Math.abs(g.size / d.y) : Infinity;
  const nextX = (cx + (stepX > 0 ? 1 : 0)) * g.size;
  const nextY = (cy + (stepY > 0 ? 1 : 0)) * g.size;
  let tMaxX = d.x !== 0 ? (nextX - o.x) / d.x : Infinity;
  let tMaxY = d.y !== 0 ? (nextY - o.y) / d.y : Infinity;
  const seen = new Set<number>();
  let best = Infinity;
  let tests = 0;
  for (let guard = 0; guard < g.cols + g.rows + 4; guard++) {
    visit?.(cx, cy);
    for (const i of g.cells[cy * g.cols + cx]) {
      if (seen.has(i)) continue;
      seen.add(i);
      tests++;
      const t = raySeg(o, d, walls[i]);
      if (t !== null && t < best) best = t;
    }
    const cellExit = Math.min(tMaxX, tMaxY);
    if (best <= cellExit) break;
    if (tMaxX < tMaxY) {
      cx += stepX;
      tMaxX += tDeltaX;
    } else {
      cy += stepY;
      tMaxY += tDeltaY;
    }
    if (cx < 0 || cy < 0 || cx >= g.cols || cy >= g.rows) break;
  }
  return { t: best, tests };
}

export function visibility(light: Pt, walls: Seg[], grid?: Grid): VisResult {
  const angles: number[] = [];
  for (const s of walls) {
    for (const p of [s.a, s.b]) {
      const a = Math.atan2(p.y - light.y, p.x - light.x);
      angles.push(a - EPS, a, a + EPS);
    }
  }
  angles.sort((x, y) => x - y);
  const polygon: Pt[] = [];
  let bruteTests = 0;
  let gridTests = 0;
  for (const a of angles) {
    const d = { x: Math.cos(a), y: Math.sin(a) };
    let best = Infinity;
    for (const s of walls) {
      bruteTests++;
      const t = raySeg(light, d, s);
      if (t !== null && t < best) best = t;
    }
    if (grid) gridTests += gridCast(light, d, walls, grid).tests;
    if (best < Infinity) polygon.push({ x: light.x + d.x * best, y: light.y + d.y * best });
  }
  return { polygon, rays: angles.length, bruteTests, gridTests };
}

export function polyPath(pts: Pt[]): string {
  if (!pts.length) return '';
  return 'M' + pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('L') + 'Z';
}

export function polyArea(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    s += p.x * q.y - q.x * p.y;
  }
  return Math.abs(s) / 2;
}
