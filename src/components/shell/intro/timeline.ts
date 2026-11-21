// The intro's one timeline. Pure: introState(t) returns every animated value for time t (seconds) as plain numbers,
// and the renderer only reads that. Nine beats from the approved storyboard (docs/design/mockups/mothsky-02-intro-storyboard.png);
// each beat's progress is eased (cubic in-out) and starts 0.15 s before its nominal start so neighbours blend.

export const INTRO_SECONDS = 4.2;

/** Nominal [start, end] of the nine beats, in seconds. */
export const BEATS: readonly (readonly [number, number])[] = [
  [0.0, 0.4],
  [0.4, 1.0],
  [1.0, 1.5],
  [1.5, 1.9],
  [1.9, 2.3],
  [2.3, 2.8],
  [2.8, 3.3],
  [3.3, 3.6],
  [3.6, 4.2],
];
/** How early each beat (after the first) starts. */
export const BEAT_LEAD = 0.15;
/** The page behind switches from data-intro='on' to 'landing' here (the start of beat 9). */
export const LANDING_AT = 3.6;
/** The nav logo fades in over the last 0.1 s, as the flying moth arrives. */
export const ARRIVE_AT = 4.1;
/** The eight wing stars light from the body outward; `wingStars` is the fraction lit. */
export const WING_STAR_COUNT = 8;
/** Points of the chrysalis outline (see Chrysalis.tsx); `drawn` runs 0..CHRYSALIS_POINTS (the last step closes the outline). */
export const CHRYSALIS_POINTS = 8;

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
/** Progress of the range [a, b] at t, 0..1, not eased. */
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (t: number, a: number, b: number) => easeInOutCubic(seg(t, a, b));

/** Eased progress of beat `i` (0-based) at time t. */
export function beatProgress(i: number, t: number): number {
  const [s, e] = BEATS[i];
  const from = i === 0 ? s : s - BEAT_LEAD;
  return easeInOutCubic(clamp01((t - from) / (e - from)));
}

export type IntroState = {
  /** Beat 1: the sky's stars, 0..1. */
  stars: number;
  /** Opacity of the single anchor star. */
  anchor: number;
  /** The thread from the anchor down to the first chrysalis point, 0..1. */
  thread: number;
  /** Chrysalis points drawn, 0..8: point k is lit as `drawn` goes k..k+1 and the line reaches it at k; 8 closes the outline. */
  drawn: number;
  /** Facet fill and white outline, 0..1. */
  facets: number;
  /** Lavender glow behind the chrysalis: opacity, and its scale (1 → 1.06 → 1). */
  glow: number;
  glowScale: number;
  /** The seam's width (0..1) and its wide bloom's opacity. */
  seam: number;
  bloom: number;
  /** Whole-chrysalis scale: two small pulses. */
  pulse: number;
  /** How far the halves have parted, in stage units (3 for the slot, 14 once they swing out). */
  halves: number;
  /** The halves falling away and fading, 0..1. */
  fall: number;
  /** 1 while the facets are opaque enough to hide the moth behind them (beat 5). */
  solid: number;
  /** Drifting shards of the broken facets, 0..1 (renderer fades them in and out). */
  shards: number;
  /** The spectrum rays' flash, 0..1..0. */
  rays: number;
  /** The head rising through the opening, 0..1 (also drives the reveal clip). */
  head: number;
  antL: number;
  antR: number;
  /** MothEmerging's whole-body scale in stage units per box unit, and the y of its head. */
  mothScale: number;
  mothY: number;
  /** MothEmerging props: wing opening and the lit fraction of wing stars. */
  wings: number;
  wingStars: number;
  /** MothConstellation's draw (its `progress`). */
  constellation: number;
  goldGlow: number;
  /** Opacity of everything on the stage except the moth, ring and sky: it dissolves with the night. */
  stage: number;
  /** The ring of light's radius as a fraction of its final radius. */
  ring: number;
  /** The night sky's opacity. */
  night: number;
  /** Flight to the nav logo, 0..1. */
  flight: number;
  /** The flying moth's opacity (it fades out as the logo's moth fades in). */
  mothOpacity: number;
};

export function introState(time: number): IntroState {
  const t = Math.min(INTRO_SECONDS, Math.max(0, time));
  const p = BEATS.map((_, i) => beatProgress(i, t));
  const [p1, , p3, p4, p5, p6, p7, p8] = p;
  const glowBreath = Math.sin(Math.PI * seg(t, 1.0, 1.55));
  const wingbeat = Math.sin(Math.PI * seg(t, LANDING_AT, 3.95));
  return {
    stars: p1,
    anchor: 0.6 * p1 + 0.4 * ease(t, 0.4, 0.7),
    thread: ease(t, 0.4, 0.62),
    drawn: CHRYSALIS_POINTS * easeOutQuad(seg(t, 0.5, 1.15)),
    facets: ease(t, 0.9, 1.5),
    glow: (0.08 * ease(t, 0.95, 1.4) + 0.04 * glowBreath) * (1 - ease(t, 2.35, 2.9)),
    glowScale: 1 + 0.06 * glowBreath,
    seam: p4 * (1 - p5),
    bloom: p4 * (1 - p6),
    pulse: 1 + 0.03 * Math.pow(Math.sin(2 * Math.PI * seg(t, 1.5, 1.9)), 2),
    halves: 3 * p5 + 11 * p6,
    fall: p6,
    solid: p5 * (1 - p6),
    shards: ease(t, 2.3, 3.1),
    rays: Math.sin(Math.PI * seg(t, 2.3, 2.85)),
    head: p5,
    antL: ease(t, 1.85, 2.4),
    antR: ease(t, 1.97, 2.52),
    mothScale: 0.5 + 0.2 * p6 + 0.3 * p7,
    mothY: 100 - 36 * p5 + 20 * p6 + 16 * p7,
    wings: p7 * (1 - 0.3 * wingbeat),
    wingStars: ease(t, 2.9, 3.4),
    constellation: p8,
    goldGlow: ease(t, 3.2, 3.6) * (1 - ease(t, 3.7, 4.2)),
    stage: 1 - ease(t, 3.65, 4.0),
    ring: ease(t, 3.62, INTRO_SECONDS),
    night: 1 - ease(t, LANDING_AT, INTRO_SECONDS),
    flight: ease(t, 3.78, INTRO_SECONDS),
    mothOpacity: 1 - seg(t, ARRIVE_AT, INTRO_SECONDS),
  };
}
