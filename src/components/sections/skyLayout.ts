// Layout for the Projects sky map: one small constellation per project kind, generated from the data so a
// new project joins the map with no code change. Pure and deterministic (no Math.random, no DOM), so the
// server and the browser agree and the tests can pin it down.
//
// Each star's position depends only on its own slug (an FNV hash seeds a point inside its kind's cell).
// Stars are placed oldest first; a star that lands within MIN_GAP of one already placed steps along a fixed
// spiral until it is clear. So adding a project never moves an older star unless the two collide.

import type { Project, ProjectKind } from '@/data/projects';
import { filters } from '@/lib/search';
import { fnv1a } from '@/lib/fnv';

export const CELL_W = 276;
/** Smallest allowed distance between two stars, in view-box units. */
export const MIN_GAP = 30;
const INSET_X = 36;
const INSET_TOP = 36;
const INSET_BOTTOM = 44; // kept clear for the kind label
const LABEL_FROM_BOTTOM = 16; // label centre, measured up from the cell's bottom edge

export const KINDS: ProjectKind[] = filters.map((f) => f.id).filter((id): id is ProjectKind => id !== 'all' && id !== 'featured');

export type Cell = { x: number; y: number; w: number; h: number };
export type SkyStar = { slug: string; kind: ProjectKind; x: number; y: number; featured: boolean; spotlight: boolean; date: string };
export type SkyGroup = {
  kind: ProjectKind;
  count: number;
  cell: Cell;
  /** The area stars may occupy: the cell inset on every side, with extra room kept clear at the bottom. */
  inner: { x0: number; y0: number; x1: number; y1: number };
  /** Centre of the kind label. */
  label: { x: number; y: number };
  /** Stars in date order (oldest first). */
  stars: SkyStar[];
  /** The stars' points joined in date order, as an SVG `points` string. Null for a kind with one project. */
  line: string | null;
};
export type SkyMapLayout = { width: number; height: number; cols: 4 | 2; groups: SkyGroup[] };

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Uniform number in [0, 1) from a string: FNV-1a, then a final mix so near-identical slugs spread out. */
function unit(input: string): number {
  let h = parseInt(fnv1a(input, 8), 16) >>> 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const byTime = (a: Project, b: Project) => (a.date !== b.date ? (a.date < b.date ? -1 : 1) : a.id - b.id);

function cellFor(index: number, cols: 4 | 2): Cell {
  if (cols === 4) return { x: index * CELL_W, y: 0, w: CELL_W, h: 210 };
  return { x: (index % 2) * CELL_W, y: Math.floor(index / 2) * 190, w: CELL_W, h: 190 };
}

const GOLDEN = 2.399963229728653;
const STEP = 6;
const MAX_STEPS = 1500;

function place(slug: string, inner: SkyGroup['inner'], placed: { x: number; y: number }[]): { x: number; y: number } {
  const w = inner.x1 - inner.x0;
  const h = inner.y1 - inner.y0;
  const sx = r1(inner.x0 + unit(`${slug}:x`) * w);
  const sy = r1(inner.y0 + unit(`${slug}:y`) * h);
  const clear = (x: number, y: number) => placed.every((p) => Math.hypot(p.x - x, p.y - y) >= MIN_GAP);
  if (clear(sx, sy)) return { x: sx, y: sy };
  // A fixed outward spiral (golden angle, widening radius); candidates outside the area are skipped.
  for (let k = 1; k <= MAX_STEPS; k++) {
    const a = k * GOLDEN;
    const d = STEP * Math.sqrt(k);
    const x = r1(sx + Math.cos(a) * d);
    const y = r1(sy + Math.sin(a) * d);
    if (x < inner.x0 || x > inner.x1 || y < inner.y0 || y > inner.y1) continue;
    if (clear(x, y)) return { x, y };
  }
  // The kind is full (about two dozen stars): keep the seeded point rather than loop forever.
  return { x: sx, y: sy };
}

/** `cols` = 4 for one row of four kinds (1104 × 210), 2 for a 2 × 2 grid (552 × 380). */
export function layoutSkyMap(projects: Project[], cols: 4 | 2): SkyMapLayout {
  const groups = KINDS.map((kind, i): SkyGroup => {
    const cell = cellFor(i, cols);
    const inner = { x0: cell.x + INSET_X, y0: cell.y + INSET_TOP, x1: cell.x + cell.w - INSET_X, y1: cell.y + cell.h - INSET_BOTTOM };
    const placed: { x: number; y: number }[] = [];
    const stars = projects
      .filter((p) => p.kind === kind)
      .sort(byTime)
      .map((p): SkyStar => {
        const pt = place(p.slug, inner, placed);
        placed.push(pt);
        return { slug: p.slug, kind, x: pt.x, y: pt.y, featured: p.featured, spotlight: !!p.spotlight, date: p.date };
      });
    return {
      kind,
      count: stars.length,
      cell,
      inner,
      label: { x: r1(cell.x + cell.w / 2), y: r1(cell.y + cell.h - LABEL_FROM_BOTTOM) },
      stars,
      line: stars.length > 1 ? stars.map((s) => `${s.x},${s.y}`).join(' ') : null,
    };
  });
  return cols === 4 ? { width: CELL_W * 4, height: 210, cols, groups } : { width: CELL_W * 2, height: 380, cols, groups };
}
