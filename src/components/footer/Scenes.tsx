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
import { emit } from '@/lib/nav';
import { projects } from '@/data/projects';
import { figures } from './figures';
import { FW, FH, GROUND, GOLD, LAV, OUT, STONE, LAB, Sky, Hills, Note, Flying, Seated, Spark, makeStars, r1 } from './Night';

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
  const [clock, setClock] = useState(t);

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

  // Idle: the exposure fades back to nothing over about four seconds. Advanced on the scene clock while rendering
  // (a state update from an effect on every frame would chain passive updates).
  if (clock !== t) {
    const dt = clamp(t - clock, 0, 0.1);
    setClock(t);
    if (idle && dt) setExp((e) => (e < 0.4 ? 0 : e * Math.exp(-dt * 1.2)));
  }

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

/* ---------------- 3. Name the constellation ----------------
   Stars join into a figure drawn from one project; the visitor picks which project it charts. A wrong guess
   dims the chip, shows a hint and the moth crouches; the right one lights the figure, the moth flies to its
   brightest star and a shooting star falls toward the email button, which then pulses. */
const SEAT = { x: 652, base: 203, size: 44 };
const CHIPS_Y = 208;

/** Seeded shuffle so the answer order is the same on server and client. */
function shuffled<T>(items: readonly T[], seed: number): T[] {
  const r = mulberry32(seed);
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const dayNumber = () => Math.floor(Date.now() / 86400000);

export function NameTheConstellation({ t, reduced, idle }: FooterSceneProps) {
  const id = useId().replace(/:/g, '');
  const [idx, setIdx] = useState(() => dayNumber() % figures.length);
  const [figAt, setFigAt] = useState(0);
  const [wrongSlugs, setWrongSlugs] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [solvedAt, setSolvedAt] = useState(0);
  const [bump, setBump] = useState<'crouch' | 'hop' | null>(null);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const fig = figures[idx];
  const answer = projects.find((p) => p.slug === fig.slug)!;
  // The right title plus two shorter others, so the row of chips always fits the frame.
  const others = shuffled(projects.filter((p) => p.slug !== fig.slug && p.title.length <= 26), dayNumber() * 7 + idx).slice(0, 2);
  const choices = shuffled([answer, ...others], dayNumber() * 13 + idx);

  const choose = (slug: string) => {
    if (solved) return;
    window.clearTimeout(timer.current);
    if (slug === fig.slug) {
      setSolved(true);
      setSolvedAt(t);
      if (reduced) {
        setBump('hop');
        timer.current = window.setTimeout(() => setBump(null), 420);
      } else setBump(null);
    } else {
      setWrongSlugs((w) => (w.includes(slug) ? w : [...w, slug]));
      setBump('crouch');
      timer.current = window.setTimeout(() => setBump(null), 400);
    }
  };
  const another = () => {
    window.clearTimeout(timer.current);
    setIdx((i) => (i + 1) % figures.length);
    setFigAt(t);
    setWrongSlugs([]);
    setSolved(false);
    setBump(null);
  };

  const since = solved ? t - solvedAt : 0;
  // The email button pulses once the shooting star has landed (at once in Reduced motion).
  const landed = solved && (reduced || since >= 2.4);
  useEffect(() => {
    if (landed) emit({ type: 'email-pulse' });
  }, [landed, idx]);

  const pts = fig.points;
  const bright = pts[fig.brightest];
  const drawn = reduced ? 1 : seg(t - figAt, 0, 1.6);
  const lineOpacity = solved ? 1 : 0.34;

  // The moth: seated by the chips; after the right answer it jumps to the brightest star and cheers there.
  const target = { x: bright[0] + 40, y: bright[1] + 16 };
  const home = { x: SEAT.x, y: SEAT.base - 20 };
  const flying = !reduced && solved;
  const f = flying ? easeInOut(seg(since, 0, 1.7)) : 0;
  const flightX = lerp(home.x, target.x, f);
  const flightY = lerp(home.y, target.y, f) - Math.sin(f * Math.PI) * 38;
  const arrived = flying && since >= 1.7;

  // The shooting star leaves the brightest star toward the lower right while the moth settles.
  const shoot = flying ? seg(since, 1.3, 2.4) : 0;
  const sx0 = bright[0] + 8, sy0 = bright[1] + 6;
  const dx = 150, dy = 135;
  const hx = sx0 + dx * shoot, hy = sy0 + dy * shoot;
  const tail = Math.min(shoot, 0.45);
  const tx = hx - dx * tail, ty = hy - dy * tail;

  const wiggle = bump === 'crouch' ? Math.sin(t * 60) * 3 : 0;
  const mid = pts.reduce((m, q) => m + q[0], 0) / pts.length;
  const chip = { height: 24, padding: '0 11px', borderRadius: 999, fontSize: 11, lineHeight: '22px', whiteSpace: 'nowrap', fontFamily: 'var(--font-inter), sans-serif' } as const;
  const ring = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#cfc9f5]';

  return (
    <g>
      <defs>
        <linearGradient id={`qs-${id}`} gradientUnits="userSpaceOnUse" x1={r1(tx)} y1={r1(ty)} x2={r1(hx)} y2={r1(hy)}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <Sky seed={8} />
      {/* the figure */}
      <g strokeLinecap="round" fill="none">
        {fig.lines.map((l, i) => {
          const o = clamp(drawn * fig.lines.length - i, 0, 1) * lineOpacity;
          const A = pts[l.a], B = pts[l.b];
          return <line key={`${idx}-${i}`} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={LAV} strokeWidth={l.dashed ? 1 : 1.6} strokeDasharray={l.dashed ? '3 5' : undefined} opacity={r1(o)} />;
        })}
      </g>
      {pts.map((q, i) => {
        const o = r1(clamp(drawn * 3 - (i / pts.length) * 1.5, 0, 1));
        return i === fig.brightest ? (
          <g key={`${idx}-${i}`} opacity={o}>
            <circle cx={q[0]} cy={q[1]} r="13" fill={GOLD} opacity=".22" />
            <Spark x={q[0]} y={q[1]} s={7} c={GOLD} />
          </g>
        ) : (
          <g key={`${idx}-${i}`} opacity={o}>
            <circle cx={q[0]} cy={q[1]} r="5" fill={LAV} opacity=".18" />
            <circle cx={q[0]} cy={q[1]} r="2" fill="#fff" />
          </g>
        );
      })}
      {solved && (
        <text x={r1(mid)} y="168" textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="20" fill={LAV} opacity={reduced ? 1 : r1(seg(since, 0.2, 0.9))}>
          {fig.name}
        </text>
      )}
      {shoot > 0 && shoot < 1 && (
        <g opacity={r1(1 - shoot * shoot * 0.9)}>
          <line x1={r1(tx)} y1={r1(ty)} x2={r1(hx)} y2={r1(hy)} stroke={`url(#qs-${id})`} strokeWidth="1.6" strokeLinecap="round" />
          <Spark x={hx} y={hy} s={4} c="#fff" />
        </g>
      )}
      <Hills />
      {/* the moth */}
      {flying ? (
        arrived ? (
          <Flying cx={r1(target.x)} cy={r1(target.y + Math.sin(t * 2.2) * 2)} w={56} pose="cheer" />
        ) : (
          <Flying cx={r1(flightX)} cy={r1(flightY)} w={56} pose="jump" rot={r1(-18 * Math.sin(f * Math.PI))} />
        )
      ) : (
        <g transform={wiggle ? `rotate(${r1(wiggle)} ${SEAT.x} ${SEAT.base})` : undefined}>
          <Seated cx={SEAT.x} base={SEAT.base} size={SEAT.size} pose={bump ? 'crouch' : idle ? 'sleep' : 'sit'} />
        </g>
      )}
      {wrongSlugs.length > 0 && !solved && (
        <text x="18" y="199" fontSize="11" fontFamily="var(--font-inter), sans-serif" fill="#a9a6bd">
          Not quite: {fig.hint.charAt(0).toLowerCase() + fig.hint.slice(1)}
        </text>
      )}
      <foreignObject x="18" y={CHIPS_Y} width="684" height="26">
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', height: 26 }}>
          {choices.map((p) => {
            const wrong = wrongSlugs.includes(p.slug);
            const right = solved && p.slug === fig.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => choose(p.slug)}
                disabled={wrong || solved}
                className={ring}
                style={{
                  ...chip,
                  color: '#eceaf3',
                  background: right ? 'rgba(94,234,212,.14)' : 'rgba(17,18,32,.8)',
                  border: `1px solid ${right ? '#5eead4' : 'rgba(255,255,255,.14)'}`,
                  opacity: wrong ? 0.45 : 1,
                  textDecoration: wrong ? 'line-through' : undefined,
                  cursor: wrong || solved ? 'default' : 'pointer',
                }}
              >
                {p.title}
              </button>
            );
          })}
          <button type="button" onClick={another} className={ring} style={{ ...chip, marginLeft: 'auto', color: '#a9a6bd', background: 'transparent', border: '1px solid rgba(255,255,255,.14)', cursor: 'pointer' }}>
            Another
          </button>
        </div>
      </foreignObject>
      <Note>WHICH PROJECT DO THESE STARS CHART?</Note>
    </g>
  );
}

/* ---------------- 4. Orbit ----------------
   The moth circles an armillary sphere on the hill crest, scaled and layered by depth as it passes behind and in
   front. Holding the email button speeds it up and streaks the stars; releasing settles both. After 30 s idle it
   lands on the sphere and dozes; any input wakes it with a cheer. */
const OC = { x: 360, y: 136 };
const ORBIT = { rx: 150, ry: 42, tilt: -7 };
const ORBIT_NEAR = 'M0 352 Q 300 342 552 302 Q 800 342 1104 350 V400 H0Z';
/** Radians per second at rest (one lap in about 16 s); up to 4× with the button held. */
const ORBIT_W = (Math.PI * 2) / 16;
const SPHERE_TOP = OC.y - 24;
const toRad = (d: number) => (d * Math.PI) / 180;

/** A point on the tilted orbit at angle a (screen y grows downward, so sin a > 0 is the front half). */
function orbitAt(a: number) {
  const ex = ORBIT.rx * Math.cos(a);
  const ey = ORBIT.ry * Math.sin(a);
  const k = toRad(ORBIT.tilt);
  return { x: OC.x + ex * Math.cos(k) - ey * Math.sin(k), y: OC.y + 4 + ex * Math.sin(k) + ey * Math.cos(k) };
}

type Landing = { idle: boolean; at: number; l0: number };
const landOf = (s: Landing, t: number) => {
  if (s.idle) return lerp(s.l0, 1, easeInOut(seg(t, s.at, s.at + 2)));
  const delay = s.l0 > 0.5 ? 0.9 : 0; // a cheer first, then take off
  return lerp(s.l0, 0, easeInOut(seg(t, s.at + delay, s.at + delay + 0.8)));
};

export function Orbit({ t, reduced, hold, idle }: FooterSceneProps) {
  const [st, setSt] = useState({ t, a: 0.6, boost: 0 });
  const [landing, setLanding] = useState<Landing>({ idle: false, at: -99, l0: 0 });

  // Angle and the eased hold, integrated on the scene clock while rendering (no effect, so no chained passive
  // updates); releasing the button settles over about 0.8 s.
  if (st.t !== t) {
    const dt = reduced ? 0 : clamp(t - st.t, 0, 0.1);
    const boost = st.boost + (hold - st.boost) * (1 - Math.exp(-dt / 0.25));
    setSt({ t, boost, a: st.a - (idle ? 0 : dt * ORBIT_W * (1 + 3 * boost)) });
  }

  if (!reduced && landing.idle !== idle) setLanding({ idle, at: t, l0: landOf(landing, t) });

  const land = reduced ? 1 : landOf(landing, t);
  const { a, boost } = st;
  const sinA = Math.sin(a);
  const depth = (sinA + 1) / 2;
  const orbit = orbitAt(a);
  const e = easeInOut(land);
  const wakeCheer = !reduced && !idle && landing.l0 > 0.5 && t - landing.at < 0.9;
  const flyW = (64 * (0.8 + 0.3 * depth)) * (1 - e) + 64 * e;
  const mx = lerp(orbit.x, OC.x, e);
  const my = lerp(orbit.y - 6, SPHERE_TOP - 16, e);
  const landedFor = idle && landing.idle ? t - landing.at - 2 : 0;
  const seated = reduced || (idle && land >= 1);
  const moth = seated ? (
    <Seated cx={OC.x} base={r1(SPHERE_TOP + 1)} size={36} pose={reduced || landedFor < 1.2 ? 'sit' : 'sleep'} />
  ) : wakeCheer ? (
    <Flying cx={OC.x} cy={r1(SPHERE_TOP - 16)} w={64} pose="cheer" />
  ) : (
    <Flying cx={r1(mx)} cy={r1(my)} w={r1(flyW)} rot={r1(sinA > 0 ? 14 : -14) * (1 - e)} flip={sinA > 0} />
  );
  const mothBack = !seated && !wakeCheer && sinA <= 0;

  // The stars: dots at rest, short arcs around the top of the frame while the button is held.
  const stars = useMemo(() => makeStars(19, 120), []);
  const streak = reduced ? 0 : Math.round(boost * 50) / 50;
  const sky = useMemo(
    () =>
      stars.map(([x, y, s, o], i) => {
        if (streak * 22 < 0.6) return <circle key={i} cx={x} cy={y} r={s} fill="#fff" opacity={o} />;
        const px = FW / 2, py = 8;
        const rad = Math.max(Math.hypot(x - px, y - py), 40);
        const a0 = Math.atan2(y - py, x - px);
        const a1 = a0 + (streak * 22) / rad;
        return (
          <path key={i} d={`M${r1(px + rad * Math.cos(a0))} ${r1(py + rad * Math.sin(a0))} A${r1(rad)} ${r1(rad)} 0 0 1 ${r1(px + rad * Math.cos(a1))} ${r1(py + rad * Math.sin(a1))}`} stroke="#fff" strokeWidth={r1(s * 1.6)} strokeLinecap="round" fill="none" opacity={o} />
        );
      }),
    [stars, streak],
  );

  // A fading trail of lavender dots behind the moth, drawn on each half of the orbit in its own layer.
  const trail = reduced || seated || wakeCheer
    ? []
    : Array.from({ length: 20 }, (_, i) => {
        const aa = a + toRad(5 + i * 4);
        const p = orbitAt(aa);
        return { x: r1(p.x), y: r1(p.y - 6), o: r1(0.7 - i * 0.032) * (1 - e), s: r1(1.8 - i * 0.05), front: Math.sin(aa) > 0 };
      });
  const dots = (front: boolean) => trail.filter((d) => d.front === front).map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={LAV} opacity={r1(d.o)} />);

  const ringTilt = r1(-22 + (reduced ? 0 : (a * 180) / Math.PI) * 0.3);
  return (
    <g>
      <Sky seed={19} stars={false} />
      {sky}
      <Hills near={ORBIT_NEAR} />
      <ellipse cx={OC.x} cy={OC.y + 4} rx={ORBIT.rx} ry={ORBIT.ry} transform={`rotate(${ORBIT.tilt} ${OC.x} ${OC.y + 4})`} fill="none" stroke={LAV} strokeOpacity=".3" strokeDasharray="2 6" />
      {dots(false)}
      {mothBack && moth}
      {/* armillary sphere on a stone plinth */}
      <path d={`M${OC.x - 16} 183 L${OC.x + 16} 183 L${OC.x + 12} ${OC.y + 30} L${OC.x - 12} ${OC.y + 30}Z`} fill={STONE} stroke={OUT} strokeWidth="1" />
      <rect x={OC.x - 17} y={OC.y + 26} width="34" height="6" rx="1.5" fill="#2f3762" stroke={OUT} strokeWidth=".8" />
      <g transform={`translate(${OC.x} ${OC.y}) scale(${LAB})`}>
        <circle r="22" fill={GOLD} opacity=".25" />
        <Spark x={0} y={0} s={9} c="#fff" />
        <g fill="none" strokeWidth="2">
          <circle r="36" stroke={GOLD} />
          <ellipse rx="36" ry="11" stroke={GOLD} transform={`rotate(${ringTilt})`} />
          <ellipse rx="12" ry="36" stroke={LAV} transform={`rotate(${ringTilt})`} />
          <line x1="-18" y1="-46" x2="18" y2="46" stroke={GOLD} strokeOpacity=".7" strokeWidth="1.4" />
        </g>
      </g>
      {!mothBack && moth}
      {dots(true)}
      <Note>{reduced ? 'THE MOTH RESTS ON THE SPHERE' : boost > 0.05 || hold > 0.05 ? 'HOLDING THE EMAIL BUTTON · FASTER' : idle ? 'RESTING · MOVE TO WAKE' : 'HOLD THE EMAIL BUTTON TO SPEED UP'}</Note>
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
  {
    id: 'quiz',
    name: 'Name the constellation',
    Scene: NameTheConstellation,
    label: 'Stars join into a figure drawn from one project; pick which project it charts. A right answer lights the figure and a shooting star falls toward the email button.',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    Scene: Orbit,
    label: 'The moth circles an old armillary sphere on the hilltop; holding the email button speeds it up and streaks the stars.',
  },
] as const;
