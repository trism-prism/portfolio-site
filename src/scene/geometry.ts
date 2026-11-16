import { pointInPolygon, type Point, type Rect, type Segment } from '../lib/visibility';

/**
 * The lantern scene as data. Everything sits on an 8-unit grid; diagonals are 45 degrees or stepped.
 * The same shapes draw the SVG and, where `occlude` is set, supply the wall segments for the light.
 */

export const COLORS = {
  ground: '#1c1626',
  indigo: '#2a2440',
  amethyst: '#4a2f5c',
  plum: '#6b3a6e',
  slate: '#3d4a5c',
  teal: '#3f6b6b',
  haze: '#55648a',
  pearl: '#e6dccb',
  cyan: '#8fd8e0',
  lavender: '#b9a7e8',
  pink: '#e7a9cf',
  facetPearl: '#f1ece4',
  violet: '#7d6bd1',
  amber: '#e8a44a',
  core: '#f6cf8a',
} as const;

export type Shape = {
  id: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  /** Closed polygons, or open polylines when `open` is set. */
  rings: Point[][];
  open?: boolean;
  evenodd?: boolean;
  /** Blocks the lantern's light. */
  occlude?: boolean;
};

export type SceneId = 'wide' | 'narrow';

export type Scene = {
  id: SceneId;
  w: number;
  h: number;
  /** Drawn before the light. */
  back: Shape[];
  /** Drawn over the light. */
  front: Shape[];
  /** Lantern limits and default; the chain hangs from the rail. */
  lantern: { x: number; y: number; minX: number; maxX: number; minY: number; maxY: number; railY: number };
};

const p = (x: number, y: number): Point => ({ x, y });
const rect = (x: number, y: number, w: number, h: number): Point[] => [p(x, y), p(x + w, y), p(x + w, y + h), p(x, y + h)];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Far skyline: flat-topped columns on the grid, a few with 45 degree spires. */
function skyline(w: number, baseY: number, topMin: number, topMax: number, seed: number): Point[] {
  const next = rng(seed);
  const widths = [16, 24, 32, 40, 48];
  const pts: Point[] = [p(0, baseY)];
  let x = 0;
  let prevTop = -1;
  while (x < w) {
    const cw = Math.min(widths[Math.floor(next() * widths.length)], w - x);
    const steps = (topMax - topMin) / 8;
    let top = topMin + Math.floor(next() * (steps + 1)) * 8;
    if (top === prevTop) top = Math.min(topMax, top + 16);
    const spire = cw <= 24 && cw >= 16 && next() < 0.35 && x + cw < w;
    if (spire) top = Math.max(topMin - 16, top - 24);
    pts.push(p(x, top));
    if (spire) pts.push(p(x + cw / 2, top - cw / 2));
    pts.push(p(x + cw, top));
    prevTop = top;
    x += cw;
  }
  pts.push(p(w, baseY));
  return pts;
}

/** A single crystal prism: two cap facets on top, two body facets below. */
function crystal(id: string, cx: number, baseY: number, hw: number, bodyH: number, c: [string, string, string, string]): Shape[] {
  const apex = p(cx, baseY - bodyH - hw);
  const shL = p(cx - hw, baseY - bodyH);
  const shR = p(cx + hw, baseY - bodyH);
  const mid = p(cx, baseY - bodyH);
  return [
    { id: `${id}-a`, fill: c[0], rings: [[apex, shL, mid]] },
    { id: `${id}-b`, fill: c[1], rings: [[apex, mid, shR]] },
    { id: `${id}-c`, fill: c[2], rings: [[shL, mid, p(cx, baseY), p(cx - hw, baseY)]] },
    { id: `${id}-d`, fill: c[3], rings: [[mid, shR, p(cx + hw, baseY), p(cx, baseY)]] },
  ];
}

/** Hollow diamond chain: the embroidery motif, as strokes. */
export function diamondChain(id: string, cx: number, y0: number, count: number, half = 8, gap = 8): Shape[] {
  const shapes: Shape[] = [];
  const pitch = half * 2 + gap;
  for (let i = 0; i < count; i++) {
    const cy = y0 + i * pitch + half;
    shapes.push({
      id: `${id}-d${i}`,
      stroke: COLORS.pearl,
      strokeWidth: 2,
      rings: [[p(cx, cy - half), p(cx + half, cy), p(cx, cy + half), p(cx - half, cy)]],
    });
    if (i < count - 1) {
      shapes.push({
        id: `${id}-l${i}`,
        stroke: COLORS.pearl,
        strokeWidth: 2,
        open: true,
        rings: [[p(cx, cy + half), p(cx, cy + half + gap)]],
      });
    }
  }
  return shapes;
}

type Spec = {
  id: SceneId;
  w: number;
  h: number;
  floorY: number;
  springY: number;
  pillarXs: number[];
  banners: number[]; // bay indexes
  obelisks: [number, number][]; // [bay, x offset from the bay centre]
  crystalBay: number;
  skySeed: number;
  skyTop: [number, number];
  lanternBay: number;
  lanternY: number;
  lanternRange: [number, number];
  railY: number;
};

const PILLAR_W = 32;

function build(s: Spec): Scene {
  const { w, h, floorY, springY, pillarXs } = s;
  const shoulderY = springY - 24;
  const bays = pillarXs.slice(0, -1).map((px, i) => {
    const x0 = px + PILLAR_W;
    const x1 = pillarXs[i + 1];
    return { x0, x1, cx: (x0 + x1) / 2, half: (x1 - x0) / 2 };
  });
  const apexY = shoulderY - bays[0].half;

  const back: Shape[] = [
    { id: 'sky', fill: COLORS.indigo, rings: [rect(0, 0, w, h)] },
    { id: 'skyline', fill: COLORS.slate, rings: [skyline(w, floorY, s.skyTop[0], s.skyTop[1], s.skySeed)] },
    { id: 'floor', fill: COLORS.indigo, rings: [rect(0, floorY, w, h - floorY)] },
    { id: 'curb', fill: COLORS.teal, rings: [rect(0, floorY, w, 8)] },
  ];

  const front: Shape[] = [];

  // Mid plane, behind the pillars: a row of capped stone posts in each bay (a balustrade with the rail
  // left out, so light and shadow stripe across the floor) and a few stepped obelisks.
  bays.forEach((b, i) => {
    const top = floorY - 56;
    const posts = Math.floor((b.x1 - b.x0 - 32) / 32) + 1;
    const used = (posts - 1) * 32 + 16;
    const left = b.x0 + (b.x1 - b.x0 - used) / 2 + 8;
    for (let k = 0; k < posts; k++) {
      const cx = left + k * 32;
      front.push({
        id: `post-${i}-${k}`,
        fill: COLORS.amethyst,
        occlude: true,
        rings: [[p(cx - 8, top), p(cx + 8, top), p(cx + 8, top + 8), p(cx + 4, top + 8), p(cx + 4, floorY), p(cx - 4, floorY), p(cx - 4, top + 8), p(cx - 8, top + 8)]],
      });
    }
  });
  s.obelisks.forEach(([bi, dx], i) => {
    const cx = bays[bi].cx + dx;
    const y = floorY;
    front.push({
      id: `obelisk-${i}`,
      fill: COLORS.amethyst,
      occlude: true,
      rings: [
        [
          p(cx - 16, y), p(cx - 16, y - 16), p(cx - 12, y - 16), p(cx - 12, y - 64), p(cx - 16, y - 64), p(cx - 16, y - 72),
          p(cx - 8, y - 72), p(cx - 8, y - 88), p(cx, y - 96), p(cx + 8, y - 88), p(cx + 8, y - 72), p(cx + 16, y - 72),
          p(cx + 16, y - 64), p(cx + 12, y - 64), p(cx + 12, y - 16), p(cx + 16, y - 16), p(cx + 16, y),
        ],
      ],
    });
  });

  // Crystal cluster standing on the floor in one bay.
  const cb = bays[s.crystalBay];
  const cBase = floorY + 40;
  front.push(
    ...crystal('crystal-l', cb.cx - 40, cBase, 16, 24, [COLORS.pink, COLORS.facetPearl, COLORS.lavender, COLORS.violet]),
    ...crystal('crystal-r', cb.cx + 40, cBase - 8, 16, 16, [COLORS.facetPearl, COLORS.cyan, COLORS.violet, COLORS.lavender]),
    ...crystal('crystal-m', cb.cx, cBase, 24, 40, [COLORS.facetPearl, COLORS.cyan, COLORS.lavender, COLORS.violet]),
  );

  // Cloth banners hanging in some bays, with the embroidery chain down the middle.
  s.banners.forEach((bi) => {
    const b = bays[bi];
    const rodY = apexY + 32;
    const rodHalf = rodY - apexY; // the arch is 45 degrees, so the opening is this wide at rod height
    front.push({ id: `rod-${bi}`, fill: COLORS.plum, rings: [rect(b.cx - rodHalf, rodY, rodHalf * 2, 8)] });
    const top = rodY + 8;
    front.push({
      id: `banner-${bi}`,
      fill: COLORS.plum,
      occlude: true,
      rings: [[p(b.cx - 16, top), p(b.cx + 16, top), p(b.cx + 16, top + 80), p(b.cx, top + 64), p(b.cx - 16, top + 80)]],
    });
    front.push(...diamondChain(`banner-${bi}`, b.cx, top + 8, 2, 8, 8));
  });

  // Wall mass above the arches: a 45 degree pointed arch cut into each bay.
  const mass: Point[] = [p(0, 0), p(w, 0), p(w, springY)];
  for (let i = bays.length - 1; i >= 0; i--) {
    const b = bays[i];
    mass.push(p(b.x1, springY), p(b.x1, shoulderY), p(b.cx, apexY), p(b.x0, shoulderY), p(b.x0, springY));
  }
  mass.push(p(0, springY));
  front.push({ id: 'spandrel', fill: COLORS.ground, rings: [mass] });

  // Pillars: shaft, capital and base as one stepped outline.
  pillarXs.forEach((x, i) => {
    const t = springY;
    front.push({
      id: `pillar-${i}`,
      fill: COLORS.ground,
      rings: [
        [
          p(x - 8, floorY), p(x - 8, floorY - 16), p(x, floorY - 16), p(x, t + 16), p(x - 8, t + 16), p(x - 8, t),
          p(x + PILLAR_W + 8, t), p(x + PILLAR_W + 8, t + 16), p(x + PILLAR_W, t + 16), p(x + PILLAR_W, floorY - 16),
          p(x + PILLAR_W + 8, floorY - 16), p(x + PILLAR_W + 8, floorY),
        ],
      ],
    });
  });

  // Rail and its end brackets, under the top band.
  front.push(
    { id: 'rail', fill: COLORS.plum, rings: [rect(24, s.railY, w - 48, 8)] },
    { id: 'bracket-l', fill: COLORS.plum, rings: [rect(8, s.railY - 8, 16, 24)] },
    { id: 'bracket-r', fill: COLORS.plum, rings: [rect(w - 24, s.railY - 8, 16, 24)] },
  );

  const lb = bays[s.lanternBay];
  return {
    id: s.id,
    w,
    h,
    back,
    front,
    lantern: { x: lb.cx, y: s.lanternY, minX: 48, maxX: w - 48, minY: s.lanternRange[0], maxY: s.lanternRange[1], railY: s.railY },
  };
}

export const wideScene = build({
  id: 'wide',
  w: 1280,
  h: 384,
  floorY: 312,
  springY: 160,
  pillarXs: Array.from({ length: 8 }, (_, i) => 8 + 176 * i),
  banners: [1, 5],
  obelisks: [[0, 32], [3, -24], [6, 8]],
  crystalBay: 2,
  skySeed: 7,
  skyTop: [152, 232],
  lanternBay: 4,
  lanternY: 200,
  lanternRange: [176, 232],
  railY: 40,
});

export const narrowScene = build({
  id: 'narrow',
  w: 368,
  h: 416,
  floorY: 344,
  springY: 184,
  pillarXs: [8, 168, 328],
  banners: [0],
  obelisks: [[1, 48]],
  crystalBay: 0,
  skySeed: 21,
  skyTop: [176, 264],
  lanternBay: 1,
  lanternY: 232,
  lanternRange: [200, 264],
  railY: 48,
});

export const scenes = { wide: wideScene, narrow: narrowScene } as const;

/** The lantern drawn around its centre (the light point). */
export const LANTERN_PARTS: { x: number; y: number; w: number; h: number; fill: string }[] = [
  { x: -4, y: -32, w: 8, h: 8, fill: COLORS.plum }, // ring
  { x: -12, y: -24, w: 24, h: 8, fill: COLORS.plum }, // cap
  { x: -8, y: -16, w: 16, h: 32, fill: COLORS.amber }, // glass
  { x: -4, y: -8, w: 8, h: 16, fill: COLORS.core }, // flame
  { x: -12, y: -16, w: 4, h: 32, fill: COLORS.plum }, // frame
  { x: 8, y: -16, w: 4, h: 32, fill: COLORS.plum },
  { x: -12, y: 16, w: 24, h: 8, fill: COLORS.plum }, // base
];

export function shapePath(shape: Shape): string {
  return shape.rings
    .map((r) => 'M' + r.map((q) => `${q.x} ${q.y}`).join('L') + (shape.open ? '' : 'Z'))
    .join('');
}

/** Wall segments for a light at `light`. A shape the light sits inside is left out, so the lantern can pass in front of it. */
export function occluders(scene: Scene, light: Point): Segment[] {
  const out: Segment[] = [];
  for (const shape of scene.front) {
    if (!shape.occlude) continue;
    if (pointInPolygon(light, shape.rings[0])) continue;
    for (const ring of shape.rings) {
      for (let i = 0; i < ring.length; i++) out.push({ a: ring[i], b: ring[(i + 1) % ring.length] });
    }
  }
  return out;
}

export function sceneBounds(scene: Scene): Rect {
  return { x: 0, y: 0, w: scene.w, h: scene.h };
}

/** Stepped disc (8-unit rows) around the origin, used to cut the light into flat bands. */
export function steppedDisc(r: number): Point[] {
  const rows = r / 4; // rows of 8 each side of centre
  const right: Point[] = [];
  for (let k = -rows / 2; k < rows / 2; k++) {
    const yMid = (k + 0.5) * 8;
    const hw = Math.floor(Math.sqrt(Math.max(0, r * r - yMid * yMid)) / 8) * 8;
    right.push(p(hw, k * 8), p(hw, k * 8 + 8));
  }
  const left = right.map((q) => p(-q.x, q.y)).reverse();
  return [...right, ...left];
}

/** Light bands: radius in units and the opacity of that flat step. */
export const LIGHT_BANDS = [
  { r: 480, opacity: 0.2, fill: COLORS.amber },
  { r: 320, opacity: 0.18, fill: COLORS.amber },
  { r: 160, opacity: 0.26, fill: COLORS.core },
] as const;
