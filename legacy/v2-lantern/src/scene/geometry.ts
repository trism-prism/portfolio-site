import { pointInPolygon, type Point, type Rect, type Segment } from '../lib/visibility';

/**
 * The lantern scene as data. Everything sits on an 8-unit grid; diagonals are 45 degrees or stepped.
 * Each shape has two fills, one for the unlit night scene and one for the same surface in lantern light.
 * The scene is drawn twice and the lit copy is shown only inside the visibility polygon.
 * The same shapes draw the SVG and, where `occlude` is set, supply the wall segments for the light.
 */

/** [unlit, lit] */
export type Tone = readonly [string, string];

export const COLORS = {
  ground: '#1c1626',
  plum: '#6b3a6e',
  cyan: '#8fd8e0',
  lavender: '#b9a7e8',
  pink: '#e7a9cf',
  facetPearl: '#f1ece4',
  violet: '#7d6bd1',
  amber: '#e8a44a',
  core: '#f6cf8a',
} as const;

export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t);
  return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
}

/**
 * Unlit and lit colour for each surface. Unlit has three families: slate-teal stone, plum cloth and indigo for
 * the far sky. Lit colours are chosen by hand so every surface keeps its own hue. Sky and skyline are never lit.
 */
export const TONES = {
  sky: ['#241f3a', '#241f3a'],
  far: ['#37315c', '#37315c'],
  back: ['#243842', '#a47c5c'],
  backAlt: ['#2b434d', '#b08662'],
  wall: ['#32454f', '#bd9370'],
  wallLight: ['#3a505b', '#c99f77'],
  stone: ['#466069', '#d9b488'],
  stoneAlt: ['#3d555e', '#c8a27a'],
  shade: ['#18232b', '#7d5a50'],
  shaft: ['#38505a', '#c9a074'],
  shaftLit: ['#4f6a74', '#e8c797'],
  floor: ['#2a2542', '#6f5e78'],
  floorAlt: ['#332d4d', '#7b6985'],
  curb: ['#3f6b6b', '#8cb7a0'],
  iron: ['#1c1626', '#4d3643'],
  cloth: ['#6b3a6e', '#c0668f'],
  clothDeep: ['#4a2f5c', '#a05a82'],
  thread: ['#a49cb3', '#fbeed2'],
} as const satisfies Record<string, Tone>;

const facet = (c: string): Tone => [mix(c, COLORS.ground, 0.55), c];

export type Shape = {
  id: string;
  tone?: Tone;
  strokeTone?: Tone;
  strokeWidth?: number;
  /** Closed polygons, or open polylines when `open` is set. */
  rings: Point[][];
  open?: boolean;
  evenodd?: boolean;
  /** Blocks the lantern's light. */
  occlude?: boolean;
  /** Never lit: the sky and the far skyline are out of the lantern's reach. */
  unlitOnly?: boolean;
  /** Not drawn; only blocks light. */
  hidden?: boolean;
  /** On the back plane (floor and back wall): the surfaces that receive the pillars' shadows. */
  plane?: 'back';
};

export type SceneId = 'wide' | 'narrow';

/** Radii of a stepped ellipse, in scene units. */
export type Reach = { rx: number; ry: number };

export type Scene = {
  id: SceneId;
  w: number;
  h: number;
  /** Negative: how far the picture extends above y=0, so there is night sky above the cornice. */
  top: number;
  shapes: Shape[];
  /**
   * Pillars are in front of the wall, so their shadows are the pillar footprints projected from the lantern onto the
   * wall: scaled about the lantern by 1/shadowDepth. They are drawn as strips, not as cones.
   */
  casters: Rect[];
  shadowDepth: number;
  /** The light's outer pool (half strength) and core (full strength). */
  reach: { outer: Reach; inner: Reach };
  /** Lantern default and limits; the chain hangs from the iron rod at `rodY`. */
  lantern: { x: number; y: number; minX: number; maxX: number; minY: number; maxY: number; rodY: number };
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
    const spire = cw <= 24 && next() < 0.35 && x + cw < w;
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

/** Half-widths of a stepped semicircle of radius r, one per 8-unit row going up from the springing line. */
function archRows(r: number): number[] {
  return Array.from({ length: r / 8 }, (_, k) => Math.round(Math.sqrt(Math.max(0, r * r - (8 * k + 4) ** 2)) / 8) * 8);
}

/** Rows of a stepped ring between two arch radii, as rectangles. `skip` leaves out the listed rows on one side. */
function archRing(cx: number, springY: number, rIn: number, rOut: number): { y: number; k: number; left: Point[]; right: Point[] }[] {
  const inner = archRows(rIn);
  const outer = archRows(rOut);
  const rows: { y: number; k: number; left: Point[]; right: Point[] }[] = [];
  for (let k = 0; k < outer.length; k++) {
    const y = springY - 8 * (k + 1);
    const hi = k < inner.length ? inner[k] : 0;
    const ho = outer[k];
    if (ho <= hi) continue;
    if (k < inner.length) rows.push({ y, k, left: rect(cx - ho, y, ho - hi, 8), right: rect(cx + hi, y, ho - hi, 8) });
    else rows.push({ y, k, left: rect(cx - ho, y, 2 * ho, 8), right: [] });
  }
  return rows;
}

/** A single crystal prism: two cap facets on top, two body facets below. */
function crystal(id: string, cx: number, baseY: number, hw: number, bodyH: number, c: [string, string, string, string]): Shape[] {
  const apex = p(cx, baseY - bodyH - hw);
  const shL = p(cx - hw, baseY - bodyH);
  const shR = p(cx + hw, baseY - bodyH);
  const mid = p(cx, baseY - bodyH);
  return [
    { id: `${id}-a`, tone: facet(c[0]), rings: [[apex, shL, mid]] },
    { id: `${id}-b`, tone: facet(c[1]), rings: [[apex, mid, shR]] },
    { id: `${id}-c`, tone: facet(c[2]), rings: [[shL, mid, p(cx, baseY), p(cx - hw, baseY)]] },
    { id: `${id}-d`, tone: facet(c[3]), rings: [[mid, shR, p(cx + hw, baseY), p(cx, baseY)]] },
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
      strokeTone: TONES.thread,
      strokeWidth: 2,
      rings: [[p(cx, cy - half), p(cx + half, cy), p(cx, cy + half), p(cx - half, cy)]],
    });
    if (i < count - 1) {
      shapes.push({ id: `${id}-l${i}`, strokeTone: TONES.thread, strokeWidth: 2, open: true, rings: [[p(cx, cy + half), p(cx, cy + half + gap)]] });
    }
  }
  return shapes;
}

type Pedestal = { kind: 'urn' | 'obelisk' | 'plinth'; bay: number; dx: number; height: number };

type Spec = {
  id: SceneId;
  w: number;
  h: number;
  top: number;
  floorY: number;
  springY: number;
  firstPillar: number;
  bayWidths: number[];
  pedestals: Pedestal[];
  banner: { bay: number; dx: number; length: number };
  weathered: number; // bay with missing stones
  skySeed: number;
  skyTop: [number, number];
  lanternBay: number;
  lanternDx: number;
  lanternY: number;
  lanternRange: [number, number];
  reach: { outer: Reach; inner: Reach };
};

const PW = 32;
const ROD_Y = 44;

function build(s: Spec): Scene {
  const { w, h, floorY, springY } = s;

  // Pillar and bay positions.
  const pillars: number[] = [];
  const bays: { x0: number; x1: number; cx: number; r: number }[] = [];
  let x = s.firstPillar;
  s.bayWidths.forEach((bw) => {
    pillars.push(x);
    bays.push({ x0: x + PW, x1: x + PW + bw, cx: x + PW + bw / 2, r: bw / 2 });
    x += PW + bw;
  });
  pillars.push(x);

  const shapes: Shape[] = [
    { id: 'sky', tone: TONES.sky, unlitOnly: true, rings: [rect(0, s.top, w, h - s.top)] },
    { id: 'skyline', tone: TONES.far, unlitOnly: true, rings: [skyline(w, floorY, s.skyTop[0], s.skyTop[1], s.skySeed)] },
    { id: 'floor', tone: TONES.floor, plane: 'back', rings: [rect(0, floorY, w, h - floorY)] },
    { id: 'floor-joint', tone: TONES.floorAlt, plane: 'back', rings: [rect(0, floorY + 16, w, 8)] },
    { id: 'curb', tone: TONES.curb, plane: 'back', rings: [rect(0, floorY, w, 8)] },
  ];

  // The back wall: one masonry plane behind the whole arcade, with a small stepped window in each bay that shows
  // the night sky. This is the surface the light and the shadows are read on.
  const wb = floorY - 72; // window sills
  const wsp = springY - 16; // where the window arches start
  const windows: Point[][] = [];
  const frame: Point[][] = [];
  bays.forEach((b) => {
    const rw = (b.x1 - b.x0 - 64) / 2;
    const rows = archRows(rw);
    const poly: Point[] = [p(b.cx - rw, wb)];
    for (let k = 0; k < rows.length; k++) poly.push(p(b.cx - rows[k], wsp - 8 * k), p(b.cx - rows[k], wsp - 8 * (k + 1)));
    for (let k = rows.length - 1; k >= 0; k--) poly.push(p(b.cx + rows[k], wsp - 8 * (k + 1)), p(b.cx + rows[k], wsp - 8 * k));
    poly.push(p(b.cx + rw, wb));
    windows.push(poly);
    frame.push(rect(b.cx - rw - 8, wb, 2 * rw + 16, 8), rect(b.cx - rw - 8, wsp, 8, wb - wsp), rect(b.cx + rw, wsp, 8, wb - wsp));
    for (const row of archRing(b.cx, wsp, rw, rw + 8)) frame.push(row.left, ...(row.right.length ? [row.right] : []));
  });
  shapes.push(
    { id: 'back-wall', tone: TONES.back, plane: 'back', evenodd: true, rings: [rect(0, 32, w, floorY - 32), ...windows] },
    { id: 'back-courses', tone: TONES.backAlt, plane: 'back', rings: [rect(0, wb + 24, w, 16), rect(0, wb + 56, w, 16)] },
    { id: 'window-frames', tone: TONES.stone, plane: 'back', rings: frame },
  );

  // Mid plane: pedestals with urns, an obelisk and a crystal on a plinth. They cast shadows onto the back wall.
  const crystals: Shape[] = [];
  s.pedestals.forEach((pd, i) => {
    const b = bays[pd.bay];
    const cx = b.cx + pd.dx;
    const y = floorY;
    const top = y - pd.height;
    const base: Point[] = [p(cx - 20, y), p(cx - 20, y - 8), p(cx - 16, y - 8), p(cx - 16, y - 16), p(cx - 12, y - 16)];
    let ring: Point[];
    if (pd.kind === 'obelisk') {
      ring = [...base, p(cx - 12, top + 40), p(cx - 8, top + 40), p(cx - 8, top + 16), p(cx, top), p(cx + 8, top + 16), p(cx + 8, top + 40), p(cx + 12, top + 40)];
    } else if (pd.kind === 'urn') {
      ring = [
        ...base, p(cx - 12, top + 40), p(cx - 8, top + 40), p(cx - 8, top + 32), p(cx - 16, top + 32), p(cx - 16, top + 16), p(cx - 8, top + 16),
        p(cx - 8, top + 8), p(cx - 12, top + 8), p(cx - 12, top), p(cx + 12, top), p(cx + 12, top + 8), p(cx + 8, top + 8), p(cx + 8, top + 16),
        p(cx + 16, top + 16), p(cx + 16, top + 32), p(cx + 8, top + 32), p(cx + 8, top + 40), p(cx + 12, top + 40),
      ];
    } else {
      ring = [...base, p(cx - 12, top + 8), p(cx - 20, top + 8), p(cx - 20, top), p(cx + 20, top), p(cx + 20, top + 8), p(cx + 12, top + 8)];
    }
    const full = [...ring, ...ring.slice(0, 5).map((q) => p(2 * cx - q.x, q.y)).reverse()];
    shapes.push({ id: `pedestal-${i}`, tone: TONES.clothDeep, occlude: true, rings: [full] });
    if (pd.kind === 'plinth') {
      crystals.push(
        ...crystal(`crystal-l-${i}`, cx - 12, top, 8, 16, [COLORS.pink, COLORS.facetPearl, COLORS.lavender, COLORS.violet]),
        ...crystal(`crystal-r-${i}`, cx + 12, top, 8, 8, [COLORS.facetPearl, COLORS.cyan, COLORS.violet, COLORS.lavender]),
        ...crystal(`crystal-m-${i}`, cx, top, 12, 32, [COLORS.facetPearl, COLORS.cyan, COLORS.lavender, COLORS.violet]),
        // the middle prism throws a shadow too
        { id: `crystal-shadow-${i}`, hidden: true, occlude: true, rings: [[p(cx - 12, top), p(cx - 12, top - 32), p(cx, top - 44), p(cx + 12, top - 32), p(cx + 12, top)]] },
      );
    }
  });
  shapes.push(...crystals);

  // The front wall: one mass with a stepped semicircular opening per bay.
  const mass: Point[] = [p(0, 0), p(w, 0), p(w, springY)];
  for (let i = bays.length - 1; i >= 0; i--) {
    const b = bays[i];
    const rows = archRows(b.r);
    mass.push(p(b.x1, springY));
    for (let k = 0; k < rows.length; k++) mass.push(p(b.cx + rows[k], springY - 8 * k), p(b.cx + rows[k], springY - 8 * (k + 1)));
    for (let k = rows.length - 1; k >= 0; k--) mass.push(p(b.cx - rows[k], springY - 8 * (k + 1)), p(b.cx - rows[k], springY - 8 * k));
    mass.push(p(b.x0, springY));
  }
  mass.push(p(0, springY));
  shapes.push(
    { id: 'wall', tone: TONES.wall, rings: [mass] },
    { id: 'cornice', tone: TONES.wallLight, rings: [rect(0, 0, w, 24)] },
    { id: 'cornice-lip', tone: TONES.stone, rings: [rect(0, 24, w, 8)] },
    { id: 'cornice-shadow', tone: TONES.shade, rings: [rect(0, 32, w, 8)] },
  );

  bays.forEach((b, bi) => {
    // The inside of each arch: a band of shaded stone, so the opening reads as a vault with depth and is joined to its stones.
    const soffit: Point[][] = [];
    for (const row of archRing(b.cx, springY, b.r - 8, b.r)) soffit.push(row.left, ...(row.right.length ? [row.right] : []));
    shapes.push({ id: `soffit-${bi}`, tone: TONES.shade, rings: soffit });

    // Voussoirs: a ring of alternating stones round each arch, with a keystone. One arch has lost a few.
    const outer = archRows(b.r + 16);
    const a: Point[][] = [];
    const c: Point[][] = [];
    const voids: Point[][] = [];
    const missing = bi === s.weathered ? new Set([2, 3, outer.length - 3]) : new Set<number>();
    for (const row of archRing(b.cx, springY, b.r, b.r + 16)) {
      const target = (row.k >> 1) % 2 === 0 ? a : c;
      const inner = archRows(b.r);
      if (row.k < inner.length) {
        (missing.has(row.k) ? voids : target).push(row.left);
        (missing.has(row.k + 1) ? voids : target).push(row.right);
      } else {
        const ho = outer[row.k];
        if (ho > 8) target.push(rect(b.cx - ho, row.y, ho - 8, 8), rect(b.cx + 8, row.y, ho - 8, 8));
      }
    }
    shapes.push({ id: `vous-a-${bi}`, tone: TONES.stone, rings: a }, { id: `vous-b-${bi}`, tone: TONES.stoneAlt, rings: c });
    if (voids.length) shapes.push({ id: `vous-gap-${bi}`, tone: TONES.shade, rings: voids });
    const topY = springY - 8 * outer.length;
    shapes.push({ id: `keystone-${bi}`, tone: TONES.shaftLit, rings: [rect(b.cx - 8, topY - 8, 16, 24)] });
  });

  // Iron tie rod running the full width under the cornice; the lantern hangs from it.
  shapes.push({ id: 'rod', tone: TONES.iron, rings: [rect(0, ROD_Y, w, 4)] });

  // One banner, off centre, hanging from the rod.
  {
    const b = bays[s.banner.bay];
    const cx = b.cx + s.banner.dx;
    const top = ROD_Y + 4;
    const len = s.banner.length;
    shapes.push({ id: 'banner-pin', tone: TONES.iron, rings: [rect(cx - 24, ROD_Y - 4, 48, 8)] });
    shapes.push({
      id: 'banner',
      tone: TONES.cloth,
      occlude: true,
      rings: [[p(cx - 16, top), p(cx + 16, top), p(cx + 16, top + len), p(cx, top + len - 16), p(cx - 16, top + len)]],
    });
    shapes.push(...diamondChain('banner', cx, top + 8, Math.floor((len - 32) / 24) + 1, 8, 8));
  }

  // Pillars: plinth, three flat strips of shaft, a stepped capital. They are lit like everything else; their shadows
  // on the wall are projected strips (see `casters`).
  pillars.forEach((px, i) => {
    const t = springY;
    shapes.push(
      { id: `pillar-base-${i}`, tone: TONES.stone, rings: [rect(px - 8, floorY - 8, PW + 16, 8), rect(px - 4, floorY - 16, PW + 8, 8)] },
      { id: `pillar-shade-${i}`, tone: TONES.shade, rings: [rect(px, t + 16, 8, floorY - 16 - t - 16)] },
      { id: `pillar-mid-${i}`, tone: TONES.shaft, rings: [rect(px + 8, t + 16, 16, floorY - 16 - t - 16)] },
      { id: `pillar-lit-${i}`, tone: TONES.shaftLit, rings: [rect(px + 24, t + 16, 8, floorY - 16 - t - 16)] },
      { id: `pillar-abacus-${i}`, tone: TONES.stone, rings: [rect(px - 8, t, PW + 16, 8)] },
      { id: `pillar-echinus-${i}`, tone: TONES.wallLight, rings: [[p(px - 8, t + 8), p(px + PW + 8, t + 8), p(px + PW, t + 16), p(px, t + 16)]] },
    );
  });

  const lb = bays[s.lanternBay];
  return {
    id: s.id,
    w,
    h,
    top: s.top,
    shapes,
    casters: pillars.map((px) => ({ x: px + 4, y: springY, w: PW - 8, h: floorY - springY })),
    shadowDepth: 0.62,
    reach: s.reach,
    lantern: { x: lb.cx + s.lanternDx, y: s.lanternY, minX: 48, maxX: w - 48, minY: s.lanternRange[0], maxY: s.lanternRange[1], rodY: ROD_Y },
  };
}

export const wideScene = build({
  id: 'wide',
  w: 1280,
  h: 312,
  top: -24,
  floorY: 280,
  springY: 168,
  firstPillar: 24,
  bayWidths: [112, 144, 128, 208, 128, 144, 112],
  pedestals: [
    { kind: 'urn', bay: 1, dx: 24, height: 72 },
    { kind: 'urn', bay: 2, dx: -16, height: 56 },
    { kind: 'plinth', bay: 3, dx: 80, height: 48 },
    { kind: 'obelisk', bay: 4, dx: 8, height: 88 },
    { kind: 'urn', bay: 5, dx: -24, height: 64 },
    { kind: 'urn', bay: 6, dx: 8, height: 72 },
  ],
  banner: { bay: 5, dx: 16, length: 96 },
  weathered: 2,
  skySeed: 7,
  skyTop: [152, 192],
  lanternBay: 3,
  lanternDx: -24,
  lanternY: 160,
  lanternRange: [132, 232],
  reach: { outer: { rx: 560, ry: 184 }, inner: { rx: 320, ry: 128 } },
});

export const narrowScene = build({
  id: 'narrow',
  w: 368,
  h: 328,
  top: -24,
  floorY: 296,
  springY: 184,
  firstPillar: 8,
  bayWidths: [112, 144],
  pedestals: [
    { kind: 'plinth', bay: 1, dx: -56, height: 48 },
    { kind: 'obelisk', bay: 1, dx: 40, height: 80 },
  ],
  banner: { bay: 0, dx: -32, length: 80 },
  weathered: 0,
  skySeed: 21,
  skyTop: [168, 208],
  lanternBay: 1,
  lanternDx: -8,
  lanternY: 144,
  lanternRange: [120, 160],
  reach: { outer: { rx: 232, ry: 136 }, inner: { rx: 136, ry: 96 } },
});

export const scenes = { wide: wideScene, narrow: narrowScene } as const;

/** The lantern drawn around its centre (the light point). Always lit. */
export const LANTERN_IRON = '#3b2447';
export const LANTERN_TOP = 40; // distance from the light point up to the top of the ring
export const LANTERN_PARTS: { x: number; y: number; w: number; h: number; fill: string }[] = [
  { x: -4, y: -40, w: 8, h: 8, fill: LANTERN_IRON }, // ring
  { x: -16, y: -32, w: 32, h: 8, fill: LANTERN_IRON }, // cap
  { x: -12, y: -24, w: 24, h: 40, fill: COLORS.amber }, // glass
  { x: -4, y: -12, w: 8, h: 24, fill: COLORS.core }, // flame
  { x: -16, y: -24, w: 4, h: 40, fill: LANTERN_IRON }, // frame
  { x: 12, y: -24, w: 4, h: 40, fill: LANTERN_IRON },
  { x: -16, y: 16, w: 32, h: 8, fill: LANTERN_IRON }, // base
];

export function shapePath(shape: Shape): string {
  return shape.rings
    .map((r) => 'M' + r.map((q) => `${q.x} ${q.y}`).join('L') + (shape.open ? '' : 'Z'))
    .join('');
}

/** Wall segments for a light at `light`. A shape the light sits inside is left out, so the lantern can pass in front of it. */
export function occluders(scene: Scene, light: Point): Segment[] {
  const out: Segment[] = [];
  for (const shape of scene.shapes) {
    if (!shape.occlude) continue;
    if (pointInPolygon(light, shape.rings[0])) continue;
    for (const ring of shape.rings) {
      for (let i = 0; i < ring.length; i++) out.push({ a: ring[i], b: ring[(i + 1) % ring.length] });
    }
  }
  return out;
}

export function sceneBounds(scene: Scene): Rect {
  return { x: 0, y: scene.top, w: scene.w, h: scene.h - scene.top };
}

export const LIGHT_STEP = 8;

/** Stepped ellipse around the origin. Rows and half-widths are multiples of `step`; rx = ry gives a stepped disc. */
export function steppedEllipse(rx: number, ry: number, step: number): Point[] {
  const rows = Math.round(ry / step);
  const right: Point[] = [];
  for (let k = -rows; k < rows; k++) {
    const yMid = (k + 0.5) * step;
    const hw = Math.round((rx * Math.sqrt(Math.max(0, 1 - (yMid / ry) ** 2))) / step) * step;
    right.push(p(hw, k * step), p(hw, k * step + step));
  }
  const left = right.map((q) => p(-q.x, q.y)).reverse();
  return [...right, ...left];
}
