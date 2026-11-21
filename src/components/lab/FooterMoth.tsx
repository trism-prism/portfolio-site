// Static frames for the four night-sky footer scenes, recast around the moth (the only character).
// Each keeps the interaction of the scene it replaces. Lab reference only.

import { projects } from '@/data/projects';
import { mulberry32 } from '@/lib/kit';
import { Moth } from './Mascots';
import { dark } from './themeTokens';

const W = 1104;
const H = 400;
const GROUND = 342;
const GOLD = '#f5c45e';
const LAV = '#cfc9f5';
const OUT = '#12122a';
const STONE = '#232a4a';
const mono = 'var(--font-jetbrains), monospace';
const r1 = (v: number) => Math.round(v * 10) / 10;

export const footerGround = '#0b0e20';

function Sky({ seed, streak = 0, pole }: { seed: number; streak?: number; pole?: [number, number] }) {
  const r = mulberry32(seed);
  const id = `fm-${seed}`;
  const stars = Array.from({ length: 230 }, () => ({ x: r() * W, y: r() * (GROUND - 30), s: r() < 0.07 ? 1.5 : 0.45 + r() * 0.65, o: 0.25 + r() * 0.6 }));
  const [px, py] = pole ?? [W / 2, 230];
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080f" />
          <stop offset=".7" stopColor="#10142c" />
          <stop offset="1" stopColor="#1c2350" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-g)`} />
      <g fill="none" stroke="rgba(255,255,255,.045)">
        {[380, 520, 660].map((rr) => (
          <circle key={rr} cx={W * 0.86} cy={H * 1.5} r={rr + 200} />
        ))}
      </g>
      {stars.map((s, i) => {
        if (!streak) return <circle key={i} cx={r1(s.x)} cy={r1(s.y)} r={r1(s.s)} fill="#fff" opacity={r1(s.o)} />;
        // streaks: short arcs around the scene's centre, as if the sky were turning fast
        const dx = s.x - px;
        const dy = s.y - py;
        const rad = Math.hypot(dx, dy);
        const a0 = Math.atan2(dy, dx);
        const a1 = a0 + streak / Math.max(rad, 60);
        return (
          <path
            key={i}
            d={`M${r1(px + rad * Math.cos(a0))} ${r1(py + rad * Math.sin(a0))} A${r1(rad)} ${r1(rad)} 0 0 1 ${r1(px + rad * Math.cos(a1))} ${r1(py + rad * Math.sin(a1))}`}
            stroke="#fff"
            strokeWidth={r1(s.s)}
            strokeLinecap="round"
            fill="none"
            opacity={r1(s.o)}
          />
        );
      })}
    </>
  );
}

function Hills({ near = `M0 ${GROUND + 6} Q 260 ${GROUND - 18} 560 ${GROUND - 4} T ${W} ${GROUND - 10} V${H} H0Z` }: { near?: string }) {
  return (
    <>
      <path d={`M0 318 Q 200 292 420 306 T 840 298 T ${W} 302 V${H} H0Z`} fill="#141a3a" />
      <path d={near} fill={footerGround} />
    </>
  );
}

function Note({ children, x = 28, y = 34 }: { children: React.ReactNode; x?: number; y?: number }) {
  return (
    <text x={x} y={y} fontFamily={mono} fontSize="11" letterSpacing="2" fill="#8a879c">
      {children}
    </text>
  );
}

function Spark({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  const k = s * 0.28;
  return <path d={`M${x} ${y - s} L${r1(x + k)} ${r1(y - k)} L${x + s} ${y} L${r1(x + k)} ${r1(y + k)} L${x} ${y + s} L${r1(x - k)} ${r1(y + k)} L${x - s} ${y} L${r1(x - k)} ${r1(y - k)}Z`} fill={c} />;
}

/** The moth in flight, centred on (cx, cy). */
function Flying({ cx, cy, w, rot = 0, eyes = 'open' as const }: { cx: number; cy: number; w: number; rot?: number; eyes?: 'open' | 'up' }) {
  const h = (w * 120) / 160;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <Moth pose="hero" w={w} x={r1(cx - w / 2)} y={r1(cy - h / 2)} eyes={eyes} />
    </g>
  );
}

/** The moth sitting, its feet at (cx, base). */
function Sitting({ cx, base, w, eyes = 'open' }: { cx: number; base: number; w: number; eyes?: 'open' | 'closed' | 'up' }) {
  return <Moth pose="sit" w={w} x={r1(cx - w / 2)} y={r1(base - (w * 117) / 120)} eyes={eyes} />;
}

/* ---------------- 1. Lantern (revisited) ---------------- */
type Stone = { x: number; w: number; h: number; lean: number; glyph: [number, number][] };
const STONES: Stone[] = [
  { x: 140, w: 48, h: 98, lean: -4, glyph: [[14, 22], [30, 34], [22, 52], [34, 66]] },
  { x: 318, w: 40, h: 72, lean: 3, glyph: [[12, 18], [26, 28], [18, 44]] },
  { x: 650, w: 54, h: 118, lean: -2, glyph: [[14, 20], [36, 30], [26, 50], [40, 70], [18, 86]] },
  { x: 846, w: 38, h: 66, lean: 4, glyph: [[10, 16], [26, 26], [16, 42]] },
  { x: 968, w: 46, h: 90, lean: -3, glyph: [[12, 20], [30, 30], [20, 52], [32, 64]] },
];

function stonePts(s: Stone): [number, number][] {
  const base = GROUND + 4;
  return [
    [s.x, base],
    [s.x + s.w, base],
    [s.x + s.w - 5 + s.lean, base - s.h],
    [s.x + 6 + s.lean, base - s.h - 7],
  ];
}

function LanternScene() {
  const L: [number, number] = [500, 226];
  const proj = ([x, y]: [number, number]): [number, number] => {
    const dx = x - L[0];
    const dy = y - L[1];
    const k = 1500 / Math.hypot(dx, dy);
    return [r1(x + dx * k), r1(y + dy * k)];
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-hidden>
      <defs>
        <radialGradient id="lantern-light" cx={L[0]} cy={L[1]} r="440" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={GOLD} stopOpacity=".42" />
          <stop offset=".4" stopColor={GOLD} stopOpacity=".14" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        {/* the visibility polygon: the glow minus one shadow quad per stone edge */}
        <mask id="lantern-vis" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <rect width={W} height={H} fill="#fff" />
          {STONES.map((s) => {
            const p = stonePts(s);
            return p.map((a, i) => {
              const b = p[(i + 1) % p.length];
              return <polygon key={`${s.x}-${i}`} points={[a, b, proj(b), proj(a)].map((q) => q.join(',')).join(' ')} fill="#000" />;
            });
          })}
        </mask>
      </defs>
      <Sky seed={11} />
      <Hills />
      <rect width={W} height={H} fill="url(#lantern-light)" mask="url(#lantern-vis)" />
      {STONES.map((s) => {
        const p = stonePts(s);
        const lit = Math.abs(s.x + s.w / 2 - L[0]) < 260;
        const top = p[3];
        return (
          <g key={s.x}>
            <polygon points={p.map((q) => q.join(',')).join(' ')} fill={STONE} stroke={OUT} strokeWidth="1.4" />
            {lit && <polygon points={p.map((q) => q.join(',')).join(' ')} fill={GOLD} opacity=".1" />}
            <g transform={`translate(${top[0]} ${top[1]})`}>
              <polyline points={s.glyph.map((g) => g.join(',')).join(' ')} fill="none" stroke={lit ? GOLD : '#343c66'} strokeWidth="1" opacity={lit ? 0.9 : 0.8} />
              {s.glyph.map(([gx, gy]) => (
                <circle key={gx * gy} cx={gx} cy={gy} r={lit ? 2.2 : 1.6} fill={lit ? '#ffe6a6' : '#343c66'} />
              ))}
            </g>
          </g>
        );
      })}
      {/* lantern on the pointer */}
      <circle cx={L[0]} cy={L[1]} r="30" fill={GOLD} opacity=".22" />
      <g stroke="#8a8fb5" strokeWidth="1.6" fill="none">
        <circle cx={L[0]} cy={L[1] - 30} r="5" />
      </g>
      <path d={`M${L[0] - 13} ${L[1] - 18} L${L[0] + 13} ${L[1] - 18} L${L[0] + 8} ${L[1] - 25} L${L[0] - 8} ${L[1] - 25}Z`} fill="#3a4170" stroke={OUT} />
      <rect x={L[0] - 11} y={L[1] - 18} width="22" height="30" rx="4" fill={GOLD} stroke={OUT} strokeWidth="1.4" />
      <ellipse cx={L[0]} cy={L[1] - 2} rx="4" ry="7" fill="#fffbe8" />
      <rect x={L[0] - 13} y={L[1] + 12} width="26" height="5" rx="2" fill="#3a4170" stroke={OUT} />
      {/* the moth circling the light */}
      <ellipse cx={L[0]} cy={L[1] - 6} rx="104" ry="40" transform={`rotate(-10 ${L[0]} ${L[1]})`} fill="none" stroke={LAV} strokeOpacity=".35" strokeDasharray="2 7" />
      <Flying cx={598} cy={186} w={98} rot={14} eyes="open" />
      <Note>YOUR POINTER CARRIES THE LANTERN</Note>
    </svg>
  );
}

/* ---------------- 2. Star trails ---------------- */
function TrailsScene() {
  const P: [number, number] = [770, 92];
  const r = mulberry32(27);
  const sweep = (40 * Math.PI) / 180;
  const arcs = Array.from({ length: 150 }, (_, i) => {
    const rad = 26 + r() * 780;
    const a0 = r() * Math.PI * 2;
    const a1 = a0 + sweep;
    const c = i % 9 === 0 ? dark.spectrum[i % 5] : '#fff';
    return {
      d: `M${r1(P[0] + rad * Math.cos(a0))} ${r1(P[1] + rad * Math.sin(a0))} A${r1(rad)} ${r1(rad)} 0 0 1 ${r1(P[0] + rad * Math.cos(a1))} ${r1(P[1] + rad * Math.sin(a1))}`,
      w: r1(0.5 + r() * 1.1),
      o: r1(0.25 + r() * 0.55),
      c,
    };
  });
  const px = 300;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-hidden>
      <defs>
        <clipPath id="trails-sky">
          <rect width={W} height={GROUND} />
        </clipPath>
      </defs>
      <Sky seed={5} />
      <g clipPath="url(#trails-sky)" fill="none" strokeLinecap="round">
        {arcs.map((a, i) => (
          <path key={i} d={a.d} stroke={a.c} strokeWidth={a.w} opacity={a.o} />
        ))}
      </g>
      <circle cx={P[0]} cy={P[1]} r="14" fill="#fff" opacity=".12" />
      <Spark x={P[0]} y={P[1]} s={7} c="#fff" />
      <Hills />
      {/* an old survey pillar with the moth on top, looking up */}
      <polygon points={`${px - 20},${GROUND + 2} ${px + 20},${GROUND + 2} ${px + 14},${GROUND - 78} ${px - 14},${GROUND - 78}`} fill={STONE} stroke={OUT} strokeWidth="1.4" />
      <rect x={px - 18} y={GROUND - 86} width="36" height="9" rx="2" fill="#2f3762" stroke={OUT} strokeWidth="1.2" />
      <rect x={px - 7} y={GROUND - 54} width="14" height="9" rx="1.5" fill={GOLD} opacity=".75" />
      <path d={`M${px} ${GROUND - 52} L${px + 4} ${GROUND - 47} H${px - 4}Z`} fill={OUT} opacity=".6" />
      <Sitting cx={px} base={GROUND - 86} w={92} eyes="up" />
      <Note>EXPOSURE 40° · SCROLL SPEED TURNS THE SKY</Note>
    </svg>
  );
}

/* ---------------- 3. Name the constellation ---------------- */
function QuizScene() {
  const Lt: [number, number] = [540, 118];
  const walls: [number, number][][] = [
    [
      [404, 96],
      [446, 196],
    ],
    [
      [636, 176],
      [712, 124],
    ],
  ];
  const visible = `${Lt.join(',')} 404,96 446,196 ${Lt.join(',')} 636,176 712,124`;
  const chips = projects.slice(0, 4).reduce<{ title: string; state: string; x: number; w: number }[]>((acc, p, i) => {
    const prev = acc[acc.length - 1];
    acc.push({ title: p.title, state: i === 0 ? 'right' : i === 2 ? 'wrong' : 'idle', x: prev ? prev.x + prev.w + 10 : 28, w: Math.round(p.title.length * 6.9 + 34) });
    return acc;
  }, []);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-hidden>
      <defs>
        <linearGradient id="quiz-shoot" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".95" />
        </linearGradient>
      </defs>
      <Sky seed={8} />
      <polygon points={visible} fill={LAV} opacity=".07" />
      <g stroke={LAV} strokeWidth="1" strokeDasharray="3 5" opacity=".55">
        {walls.flat().map(([x, y]) => (
          <line key={x} x1={Lt[0]} y1={Lt[1]} x2={x} y2={y} />
        ))}
      </g>
      {walls.map((wl) => (
        <line key={wl[0][0]} x1={wl[0][0]} y1={wl[0][1]} x2={wl[1][0]} y2={wl[1][1]} stroke={LAV} strokeWidth="2.4" strokeLinecap="round" />
      ))}
      {walls.flat().map(([x, y]) => (
        <g key={`s${x}`}>
          <circle cx={x} cy={y} r="8" fill={LAV} opacity=".18" />
          <circle cx={x} cy={y} r="3.2" fill="#fff" />
        </g>
      ))}
      <circle cx={Lt[0]} cy={Lt[1]} r="20" fill={GOLD} opacity=".22" />
      <Spark x={Lt[0]} y={Lt[1]} s={9} c={GOLD} />
      <text x="560" y="250" textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="22" fill={dark.accentSerif}>
        the Visibility Engine
      </text>
      {/* shooting star toward the email button */}
      <line x1="760" y1="96" x2="990" y2="318" stroke="url(#quiz-shoot)" strokeWidth="2" strokeLinecap="round" />
      <Spark x={990} y={318} s={6} c="#fff" />
      <Hills />
      {/* the moth flies up to the brightest star */}
      <path d="M200 310 C 230 260 280 230 318 206" fill="none" stroke={LAV} strokeOpacity=".35" strokeDasharray="2 7" />
      <Flying cx={340} cy={190} w={86} rot={18} eyes="up" />
      {chips.map((c) => {
        const { x, w } = c;
        const right = c.state === 'right';
        const wrong = c.state === 'wrong';
        return (
          <g key={c.title} opacity={wrong ? 0.45 : 1}>
            <rect x={x} y={356} width={w} height="30" rx="15" fill={right ? 'rgba(94,234,212,.14)' : 'rgba(17,18,32,.8)'} stroke={right ? dark.kind.software : 'rgba(255,255,255,.14)'} />
            <text x={x + w / 2} y={375.5} textAnchor="middle" fontSize="12.5" fontFamily="var(--font-inter), sans-serif" fill={dark.ink} textDecoration={wrong ? 'line-through' : undefined}>
              {c.title}
            </text>
          </g>
        );
      })}
      <text x="28" y="344" fontSize="12" fontFamily="var(--font-inter), sans-serif" fill={dark.ink3}>
        Not quite: think about what a light can see.
      </text>
      <rect x={958} y={352} width="118" height="36" rx="18" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="5" />
      <rect x={962} y={356} width="110" height="28" rx="14" fill={dark.buttonBg} />
      <text x={1017} y={374.5} textAnchor="middle" fontSize="12.5" fontWeight="600" fontFamily="var(--font-inter), sans-serif" fill={dark.buttonFg}>
        Email me
      </text>
      <Note>WHICH PROJECT DO THESE STARS CHART?</Note>
    </svg>
  );
}

/* ---------------- 4. Orbit ---------------- */
function OrbitScene() {
  const C: [number, number] = [552, 222];
  const near = `M0 ${GROUND + 10} Q 300 ${GROUND} 552 ${GROUND - 40} Q 800 ${GROUND} ${W} ${GROUND + 8} V${H} H0Z`;
  const pt = (deg: number, rx = 236, ry = 66): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [r1(C[0] + rx * Math.cos(a)), r1(C[1] + 6 + ry * Math.sin(a))];
  };
  const trail = Array.from({ length: 22 }, (_, i) => {
    const [x, y] = pt(44 + i * 4);
    return { x, y, o: r1(0.75 - i * 0.032), s: r1(2.6 - i * 0.09) };
  });
  const [mx, my] = pt(40);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-hidden>
      <Sky seed={19} streak={34} pole={[C[0], 40]} />
      <Hills near={near} />
      {/* back half of the orbit */}
      <ellipse cx={C[0]} cy={C[1] + 6} rx="236" ry="66" fill="none" stroke={LAV} strokeOpacity=".3" strokeDasharray="2 7" />
      {/* armillary sphere on a stone plinth */}
      <path d={`M${C[0] - 24} ${GROUND - 38} L${C[0] + 24} ${GROUND - 38} L${C[0] + 18} ${C[1] + 46} L${C[0] - 18} ${C[1] + 46}Z`} fill={STONE} stroke={OUT} strokeWidth="1.4" />
      <rect x={C[0] - 26} y={C[1] + 40} width="52" height="9" rx="2" fill="#2f3762" stroke={OUT} strokeWidth="1.2" />
      <circle cx={C[0]} cy={C[1]} r="22" fill={GOLD} opacity=".25" />
      <Spark x={C[0]} y={C[1]} s={9} c="#fff" />
      <g fill="none" strokeWidth="2">
        <circle cx={C[0]} cy={C[1]} r="36" stroke={GOLD} />
        <ellipse cx={C[0]} cy={C[1]} rx="36" ry="11" stroke={GOLD} transform={`rotate(-22 ${C[0]} ${C[1]})`} />
        <ellipse cx={C[0]} cy={C[1]} rx="12" ry="36" stroke={LAV} transform={`rotate(-22 ${C[0]} ${C[1]})`} />
        <line x1={C[0] - 18} y1={C[1] - 46} x2={C[0] + 18} y2={C[1] + 46} stroke={GOLD} strokeOpacity=".7" strokeWidth="1.4" />
      </g>
      {/* the moth's light trail along the front of the orbit */}
      {trail.map((d) => (
        <circle key={d.x} cx={d.x} cy={d.y} r={d.s} fill={LAV} opacity={d.o} />
      ))}
      <Flying cx={mx} cy={my - 10} w={100} rot={-18} eyes="open" />
      <Note>HOLDING THE EMAIL BUTTON · FASTER</Note>
    </svg>
  );
}

export const footerConcepts = [
  {
    key: 'lantern',
    name: 'Lantern',
    replaces: 'Lightroom',
    Scene: LanternScene,
    interaction: 'Your pointer carries a lantern across a hilltop of standing stones. The lit area is a real visibility polygon, the idea behind the visibility engine project.',
    response: 'The moth follows the light and circles it; stones the light reaches show the constellations carved into them.',
    idle: 'With no pointer the lantern settles on the tallest stone and the moth rests beside it.',
    reduced: 'The lantern rests mid-hill and the moth sits still; the lit area is still computed, so the pointer still works.',
  },
  {
    key: 'trails',
    name: 'Star trails',
    replaces: 'Game day',
    Scene: TrailsScene,
    interaction: 'Scrolling the page is a long exposure: scroll speed turns the sky around the pole star and the stars draw trails. Scrolling back rewinds them.',
    response: 'A small counter shows how many degrees of sky are exposed; the moth on the old survey pillar looks up and its wing stars brighten as the trails grow.',
    idle: 'After a while without input the moth folds its wings and dozes, and the trails slowly fade.',
    reduced: 'A finished exposure of about 40° is shown; no scroll response.',
  },
  {
    key: 'quiz',
    name: 'Name the constellation',
    replaces: 'Trivia',
    Scene: QuizScene,
    interaction: 'Stars join into a figure drawn from one project (here, a light and two walls: the visibility engine). The visitor picks which project it charts.',
    response: 'A wrong guess dims with a one-line hint and the moth shakes its antennae; the right one lights the figure, the moth flies up to its brightest star and a shooting star falls to the email button.',
    idle: 'Each visit picks a different project figure; "another" draws a new one.',
    reduced: 'The figure is fully drawn; answers work the same; the moth hops instead of flying and there is no shooting star.',
  },
  {
    key: 'orbit',
    name: 'Orbit',
    replaces: 'Orbit',
    Scene: OrbitScene,
    interaction: 'The moth circles an old armillary sphere on the hilltop, scaled and layered by depth as it passes in front and behind.',
    response: 'Holding the email button speeds it up and the stars streak into trails; releasing settles everything.',
    idle: 'After about 30 seconds it lands on the sphere and dozes; any input wakes it.',
    reduced: 'The moth sits on the sphere and the rings are still.',
  },
];

export function AllFooterConcepts({ sigFamily }: { sigFamily: string }) {
  return (
    <>
      {footerConcepts.map((c, i) => (
        <section key={c.key} data-sheet={c.key} className="relative" style={{ width: 1440, background: '#07080d', color: '#eceaf3' }}>
          <div className="mx-auto max-w-[1152px] px-6 py-14">
            <p className="font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: '#8a879c' }}>
              Footer scene {i + 1} of 4 · replaces {c.replaces}
            </p>
            <h2 className="mt-2 font-display text-[40px] font-bold tracking-[-0.03em]">{c.name}</h2>
            <div className="mt-6 overflow-hidden rounded-2xl border" style={{ borderColor: 'rgba(255,255,255,.1)' }}>
              <c.Scene />
              <div className="flex items-end justify-between px-7 pb-5 pt-1 text-[13px]" style={{ background: footerGround, color: '#c9c6d6' }}>
                <span>© 2026 Tristan Morton</span>
                <span style={{ fontFamily: sigFamily, fontSize: 30, color: '#eceaf3', lineHeight: 1 }}>Tristan Morton</span>
                <span>Back to top ↑</span>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-4 gap-6 text-[14px] leading-relaxed">
              {(
                [
                  ['Interaction', c.interaction],
                  ['Response', c.response],
                  ['Idle', c.idle],
                  ['Reduced motion', c.reduced],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: '#8a879c' }}>
                    {k}
                  </dt>
                  <dd className="mt-1.5" style={{ color: '#c9c6d6' }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ))}
    </>
  );
}
