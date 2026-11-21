'use client';

// The four night-sky footer scenes, each recast around the moth (the only character):
//   Lantern             pointer carries a lantern; a real visibility polygon lights carved standing stones
//   Star trails         scroll speed is a long exposure; the moth sits on a survey pillar looking up
//   Name the constellation  pick the project a star figure charts; the moth flies to its brightest star
//   Orbit               the moth circles an armillary sphere; holding the email button speeds it up
// Drawing and spec text come from the approved lab frames (src/components/lab/FooterMoth.tsx), recomposed at 720 × 240.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { boxWalls, polyPath, raySeg, visibility, type Pt, type Seg } from '@/lib/visibility';
import { clamp, easeInOut, easeOut, lerp, mulberry32, seg } from '@/lib/kit';
import { FW, FH, GROUND, GOLD, OUT, STONE, LAB, Sky, Hills, Note, Flying, Seated, Spark, makeStars, r1 } from './Night';

export { FW, FH };
export type FooterSceneProps = { t: number; reduced: boolean; hold: number; idle: boolean };

/* ---------------- 1. Lantern ----------------
   The pointer carries a lantern across a hilltop of standing stones. The lit area is a real visibility
   polygon among the stones' edges; stones the light reaches show their carved constellation in gold.
   The moth circles the light; with no pointer the lantern settles on the tallest stone and the moth rests. */
type Stone = { x: number; w: number; h: number; lean: number; glyph: [number, number][] };
const STONES: Stone[] = [
  { x: 91, w: 31, h: 64, lean: -3, glyph: [[14, 22], [30, 34], [22, 52], [34, 66]] },
  { x: 207, w: 26, h: 47, lean: 2, glyph: [[12, 18], [26, 28], [18, 44]] },
  { x: 424, w: 35, h: 77, lean: -1, glyph: [[14, 20], [36, 30], [26, 50], [40, 70], [18, 86]] },
  { x: 552, w: 25, h: 43, lean: 3, glyph: [[10, 16], [26, 26], [16, 42]] },
  { x: 631, w: 30, h: 59, lean: -2, glyph: [[12, 20], [30, 30], [20, 52], [32, 64]] },
];

function stonePts(s: Stone): Pt[] {
  const base = GROUND + 2;
  return [
    { x: s.x, y: base },
    { x: s.x + s.w, y: base },
    { x: r1(s.x + s.w - 3 + s.lean), y: base - s.h },
    { x: r1(s.x + 4 + s.lean), y: r1(base - s.h - 4.5) },
  ];
}
const STONE_PTS = STONES.map(stonePts);
const STONE_WALLS: Seg[][] = STONE_PTS.map((p) => p.map((a, i) => ({ a, b: p[(i + 1) % p.length] })));
const ROOM: Seg[] = [...boxWalls(FW, FH), ...STONE_WALLS.flat()];
const STONE_CENTRES: Pt[] = STONE_PTS.map((p) => ({ x: p.reduce((s, q) => s + q.x, 0) / 4, y: p.reduce((s, q) => s + q.y, 0) / 4 }));
const TALLEST = STONES.reduce((best, s, i) => (s.h > STONES[best].h ? i : best), 0);
/** How far the lantern's glow reaches a stone's centre (the lab frame lights stones within about 170 units). */
const LIT_RANGE = 170;

/** The same ray test the visibility polygon uses, from the light to a stone's centre, ignoring the stone's own edges. */
function litStone(light: Pt, i: number) {
  const c = STONE_CENTRES[i];
  const d = { x: c.x - light.x, y: c.y - light.y };
  const len = Math.hypot(d.x, d.y);
  if (len > LIT_RANGE) return false;
  const dir = { x: d.x / len, y: d.y / len };
  for (let k = 0; k < ROOM.length; k++) {
    if (k >= 4 + i * 4 && k < 8 + i * 4) continue;
    const t = raySeg(light, dir, ROOM[k]);
    if (t !== null && t < len - 1) return false;
  }
  return true;
}

function inside(poly: Pt[], p: Pt) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

/** Keep the lamp on the stage and out of the stones (a light inside a stone would only see the stone). */
function placeLamp(p: Pt): Pt {
  const q = { x: clamp(p.x, 6, FW - 6), y: clamp(p.y, 12, GROUND - 6) };
  for (let i = 0; i < STONE_PTS.length; i++) if (inside(STONE_PTS[i], q)) return { x: q.x, y: Math.min(STONE_PTS[i][3].y, STONE_PTS[i][2].y) - 3 };
  return q;
}

const RT = STONE_PTS[TALLEST];
const TOP_Y = r1((RT[2].y + RT[3].y) / 2);
const TOP_X = r1((RT[2].x + RT[3].x) / 2);
/** Resting places: on the tallest stone (live), or mid-hill (Reduced motion). */
const REST = { lamp: { x: r1(TOP_X - 5), y: r1(TOP_Y - 11) }, moth: { x: r1(TOP_X + 7), base: TOP_Y, size: 30 } };
const REST_REDUCED = { lamp: { x: 330, y: 191 }, moth: { x: 362, base: 203, size: 30 } };

type Mode = { follow: boolean; at: number; lamp0: Pt; m0: number };

/** Lantern position and how far the moth has landed (0 circling, 1 seated), at time t. */
function lampState(mode: Mode, pointer: Pt, t: number) {
  if (mode.follow) {
    const lamp = { x: lerp(mode.lamp0.x, pointer.x, easeOut(seg(t, mode.at, mode.at + 0.35))), y: lerp(mode.lamp0.y, pointer.y, easeOut(seg(t, mode.at, mode.at + 0.35))) };
    return { lamp, m: lerp(mode.m0, 0, easeOut(seg(t, mode.at, mode.at + 0.5))) };
  }
  const p = easeInOut(seg(t, mode.at, mode.at + 1.2));
  const lamp = { x: lerp(mode.lamp0.x, REST.lamp.x, p), y: lerp(mode.lamp0.y, REST.lamp.y, p) };
  return { lamp, m: lerp(mode.m0, 1, easeInOut(seg(t, mode.at + 0.8, mode.at + 1.8))) };
}

export function Lantern({ t, reduced, idle }: FooterSceneProps) {
  const id = useId().replace(/:/g, '');
  const root = useRef<SVGGElement>(null);
  const [ptr, setPtr] = useState<{ p: Pt; in: boolean }>({ p: REST.lamp, in: false });
  const [mode, setMode] = useState<Mode>({ follow: false, at: -99, lamp0: REST.lamp, m0: 1 });

  useEffect(() => {
    const el = root.current?.ownerSVGElement;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setPtr({ p: { x: ((e.clientX - r.left) / r.width) * FW, y: ((e.clientY - r.top) / r.height) * FH }, in: true });
    };
    const leave = () => setPtr((s) => ({ ...s, in: false }));
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave, { passive: true });
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  // Following the pointer starts and stops as it enters, leaves or the page goes idle; each change restarts the easing
  // from wherever the lantern and moth are at that moment (derived state, adjusted during render).
  const follow = ptr.in && !idle && !reduced;
  if (mode.follow !== follow) {
    const cur = lampState(mode, placeLamp(ptr.p), t);
    setMode({ follow, at: t, lamp0: cur.lamp, m0: cur.m });
  }

  const target = placeLamp(ptr.p);
  let lamp: Pt;
  let m: number;
  if (reduced) {
    lamp = ptr.in ? target : REST_REDUCED.lamp;
    m = 1;
  } else {
    ({ lamp, m } = lampState(mode, target, t));
  }
  const light = { x: r1(lamp.x), y: r1(lamp.y) };
  const vis = visibility(light, ROOM);

  // The moth: a tilted ellipse around the lantern, one lap per 6 s, then down onto its resting place.
  const a = (t * Math.PI * 2) / 6;
  const tilt = (-10 * Math.PI) / 180;
  const ex = 64 * Math.cos(a);
  const ey = 24 * Math.sin(a);
  const orbit = { x: light.x + ex * Math.cos(tilt) - ey * Math.sin(tilt), y: light.y - 4 + ex * Math.sin(tilt) + ey * Math.cos(tilt) };
  const spot = reduced ? REST_REDUCED.moth : REST.moth;
  const landed = reduced || m >= 1;
  const e = easeInOut(m);
  const mothFly = { x: lerp(orbit.x, spot.x, e), y: lerp(orbit.y, spot.base - 16, e) };
  const goingLeft = Math.sin(a) > 0;

  return (
    <g ref={root}>
      <defs>
        <radialGradient id={`lan-${id}`} cx={light.x} cy={light.y} r="290" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD} stopOpacity=".42" />
          <stop offset=".4" stopColor={GOLD} stopOpacity=".14" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <Sky seed={11} />
      <Hills />
      <path d={polyPath(vis.polygon)} fill={`url(#lan-${id})`} />
      {STONES.map((s, i) => {
        const p = STONE_PTS[i];
        const lit = litStone(light, i);
        const pts = p.map((q) => `${q.x},${q.y}`).join(' ');
        return (
          <g key={s.x}>
            <polygon points={pts} fill={STONE} stroke={OUT} strokeWidth="1" />
            {lit && <polygon points={pts} fill={GOLD} opacity=".1" />}
            <g transform={`translate(${p[3].x} ${p[3].y}) scale(${LAB})`}>
              <polyline points={s.glyph.map((g) => g.join(',')).join(' ')} fill="none" stroke={lit ? GOLD : '#343c66'} strokeWidth="1.4" opacity={lit ? 0.9 : 0.8} />
              {s.glyph.map(([gx, gy]) => (
                <circle key={gx * gy} cx={gx} cy={gy} r={lit ? 3.2 : 2.4} fill={lit ? '#ffe6a6' : '#343c66'} />
              ))}
            </g>
          </g>
        );
      })}
      {/* the lantern */}
      <g transform={`translate(${light.x} ${light.y}) scale(${LAB})`}>
        <circle r="30" fill={GOLD} opacity=".22" />
        <circle cy="-30" r="5" fill="none" stroke="#8a8fb5" strokeWidth="1.6" />
        <path d="M-13 -18 L13 -18 L8 -25 L-8 -25Z" fill="#3a4170" stroke={OUT} />
        <rect x="-11" y="-18" width="22" height="30" rx="4" fill={GOLD} stroke={OUT} strokeWidth="1.4" />
        <ellipse cy="-2" rx="4" ry="7" fill="#fffbe8" />
        <rect x="-13" y="12" width="26" height="5" rx="2" fill="#3a4170" stroke={OUT} />
      </g>
      {landed ? (
        <Seated cx={spot.x} base={spot.base} size={spot.size} pose={idle ? 'sleep' : 'sit'} />
      ) : (
        <Flying cx={r1(mothFly.x)} cy={r1(mothFly.y)} w={56} rot={goingLeft ? -12 : 12} flip={goingLeft} />
      )}
      <Note>YOUR POINTER CARRIES THE LANTERN</Note>
    </g>
  );
}

/* ---------------- 2. Star trails ----------------
   Scrolling the page is a long exposure: scroll speed turns the sky around the pole star and the stars draw
   trails; scrolling back rewinds them. The moth on an old survey pillar watches. */
const POLE = { x: 500, y: 60 };
const SPEC = ['#5eead4', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'];
const PILLAR_X = 200;
/** Degrees of exposure added per px/ms of scroll speed, per 66 ms sample. */
const EXPOSURE_GAIN = 4;

/** An arc of `sweep` radians around the pole from angle `a0`, split in two when it is longer than a half turn. */
function arcPath(rad: number, a0: number, sweep: number) {
  const at = (a: number) => `${r1(POLE.x + rad * Math.cos(a))} ${r1(POLE.y + rad * Math.sin(a))}`;
  const r = r1(rad);
  if (sweep <= Math.PI) return `M${at(a0)} A${r} ${r} 0 0 1 ${at(a0 + sweep)}`;
  return `M${at(a0)} A${r} ${r} 0 0 1 ${at(a0 + sweep / 2)} A${r} ${r} 0 0 1 ${at(a0 + sweep)}`;
}

export function StarTrails({ t, reduced, idle }: FooterSceneProps) {
  const [exp, setExp] = useState(40);
  const [cheerAt, setCheerAt] = useState(-9);
  const [prevK, setPrevK] = useState(0);
  const lastT = useRef(t);

  // Scroll speed is the exposure: down adds in proportion to speed, up rewinds (same 15 Hz sampling as before).
  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    const on = () => {
      const now = performance.now();
      if (now - lastTime < 66) return;
      const v = (window.scrollY - lastY) / (now - lastTime);
      lastY = window.scrollY;
      lastTime = now;
      setExp((e) => clamp(e + v * EXPOSURE_GAIN, 0, 360));
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [reduced]);

  // Idle: the exposure fades back to nothing over about four seconds.
  useEffect(() => {
    const dt = clamp(t - lastT.current, 0, 0.1);
    lastT.current = t;
    if (idle && dt) setExp((e) => (e < 0.4 ? 0 : e * Math.exp(-dt * 1.2)));
  }, [t, idle]);

  const k = Math.floor(exp / 90);
  if (k !== prevK) {
    if (k > prevK && !reduced) setCheerAt(t);
    setPrevK(k);
  }

  const shown = reduced ? 40 : exp;
  const stars = useMemo(() => {
    const rnd = mulberry32(27);
    return makeStars(5, 100).map(([x, y, s, o], i) => {
      const dx = x - POLE.x;
      const dy = y - POLE.y;
      return { x, y, rad: Math.max(Math.hypot(dx, dy), 4), a0: Math.atan2(dy, dx), w: r1(0.5 + rnd() * 0.6), o: r1(0.25 + rnd() * 0.55), c: i % 9 === 0 ? SPEC[i % 5] : '#fff', s, dot: o };
    });
  }, []);
  const trails = useMemo(() => {
    const sweep = (shown * Math.PI) / 180;
    return stars.map((s, i) => <path key={i} d={sweep > 0.002 ? arcPath(s.rad, s.a0, sweep) : ''} stroke={s.c} strokeWidth={s.w} opacity={s.o} />);
  }, [stars, shown]);

  const cheering = !reduced && !idle && t - cheerAt < 0.9;
  const cap = r1(GROUND - 86 * LAB);
  return (
    <g>
      <defs>
        <clipPath id="trails-sky">
          <rect width={FW} height={GROUND} />
        </clipPath>
      </defs>
      <Sky seed={5} stars={false} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={s.c} opacity={s.dot} />
      ))}
      <g clipPath="url(#trails-sky)" fill="none" strokeLinecap="round">
        {trails}
      </g>
      <circle cx={POLE.x} cy={POLE.y} r="9" fill="#fff" opacity=".12" />
      <Spark x={POLE.x} y={POLE.y} s={5} c="#fff" />
      <Hills />
      {/* an old survey pillar */}
      <g transform={`translate(${PILLAR_X} ${GROUND}) scale(${LAB})`}>
        <polygon points="-20,2 20,2 14,-78 -14,-78" fill={STONE} stroke={OUT} strokeWidth="1.4" />
        <rect x="-18" y="-86" width="36" height="9" rx="2" fill="#2f3762" stroke={OUT} strokeWidth="1.2" />
        <rect x="-7" y="-54" width="14" height="9" rx="1.5" fill={GOLD} opacity=".75" />
        <path d="M0 -52 L4 -47 H-4Z" fill={OUT} opacity=".6" />
      </g>
      {cheering ? (
        <Flying cx={PILLAR_X} cy={r1(cap - 26)} w={64} pose="cheer" />
      ) : (
        <Seated cx={PILLAR_X} base={cap} size={58} pose={idle ? 'sleep' : 'sit'} />
      )}
      <Note>EXPOSURE {Math.round(shown)}° · SCROLL SPEED TURNS THE SKY</Note>
    </g>
  );
}

export const footerScenes = [
  {
    id: 'lantern',
    name: 'Lantern',
    Scene: Lantern,
    label: 'Your pointer carries a lantern across a hilltop of standing stones; the lit area is a real visibility polygon, the idea behind the visibility engine project.',
  },
  {
    id: 'trails',
    name: 'Star trails',
    Scene: StarTrails,
    label: 'Scrolling the page is a long exposure: scroll speed turns the sky around the pole star and the stars draw trails. Scrolling back rewinds them.',
  },
] as const;
