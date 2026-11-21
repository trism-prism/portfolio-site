'use client';

import { Person, LOOKS } from '@/components/footer/Cast';
import { PrismCharacter } from '@/components/ui/Prism';
import { boxWalls, polyPath, raySeg, visibility, type Pt, type Seg } from '@/lib/visibility';
import { mulberry32 } from '@/lib/kit';
import { dark } from './themeTokens';

// Static frames for the four night-sky footer scenes. Each keeps the interaction of the scene it replaces.
// Lab reference only; the real scenes are animated and live in src/components/footer.

const W = 720, H = 240;
const t = dark;
const mono = 'var(--font-jetbrains), monospace';

function NightSky({ seed, horizon = 196 }: { seed: number; horizon?: number }) {
  const r = mulberry32(seed);
  const stars = Array.from({ length: 140 }, () => ({ x: Math.round(r() * W), y: Math.round(r() * (horizon - 10)), s: r() < 0.08 ? 1.3 : 0.4 + r() * 0.6, o: 0.25 + r() * 0.6 }));
  const id = `ns${seed}`;
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0c1c" />
          <stop offset=".75" stopColor="#151735" />
          <stop offset="1" stopColor="#24204a" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-g)`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} />
      ))}
    </>
  );
}

const Hill = ({ d = `M0 200 Q 160 180 330 192 T 720 186 V240 H0Z`, fill = '#06070f' }: { d?: string; fill?: string }) => <path d={d} fill={fill} />;
const Label = ({ x, y, children, anchor = 'start', fill = '#8a879c' }: { x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; fill?: string }) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={mono} fontSize="9.5" letterSpacing=".14em" fill={fill}>
    {children}
  </text>
);

/* 1. Lantern among the stones (replaces Lightroom)
   The prism carries a lantern across a hilltop of standing stones; your pointer moves it. The lit area is a
   real visibility polygon (the engine project's idea). Whoever the light reaches waves; people in shadow doze. */
const sg = (ax: number, ay: number, bx: number, by: number): Seg => ({ a: { x: ax, y: ay }, b: { x: bx, y: by } });
const STONES: Seg[] = [
  sg(150, 120, 150, 196), sg(150, 120, 176, 120), sg(176, 120, 176, 196),
  sg(250, 150, 250, 196), sg(270, 150, 270, 196),
  sg(452, 112, 452, 196), sg(452, 112, 486, 112), sg(486, 112, 486, 196),
  sg(560, 140, 560, 196), sg(560, 140, 586, 140), sg(586, 140, 586, 196),
];
export function LanternScene() {
  const light: Pt = { x: 360, y: 150 };
  const walls = [...boxWalls(W, H), ...STONES];
  const vis = visibility(light, walls);
  const people: { x: number; look: number }[] = [
    { x: 92, look: 1 },
    { x: 210, look: 2 },
    { x: 520, look: 3 },
    { x: 640, look: 4 },
  ];
  const lit = (p: Pt) => {
    const d = { x: p.x - light.x, y: p.y - light.y };
    const len = Math.hypot(d.x, d.y);
    return !STONES.some((w) => {
      const tt = raySeg(light, { x: d.x / len, y: d.y / len }, w);
      return tt !== null && tt < len - 1;
    });
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
      <NightSky seed={1} />
      <defs>
        <radialGradient id="lantern" cx={light.x} cy={light.y} r="300" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" stopOpacity=".55" />
          <stop offset=".45" stopColor="#f59e0b" stopOpacity=".16" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={polyPath(vis.polygon)} fill="url(#lantern)" />
      <Hill />
      <g fill="#2a2740" stroke="#4b4670" strokeWidth="1">
        <rect x="150" y="120" width="26" height="80" rx="2" />
        <rect x="250" y="150" width="20" height="48" rx="2" />
        <path d="M452 196 V116 Q469 104 486 116 V196Z" />
        <rect x="560" y="140" width="26" height="58" rx="2" />
      </g>
      {people.map((p) => {
        const isLit = lit({ x: p.x, y: 160 });
        return (
          <g key={p.x} transform={`translate(${p.x} 198) scale(.6)`} opacity={isLit ? 1 : 0.55}>
            <Person look={LOOKS[p.look]} pose={isLit ? 'wave' : 'sit'} eyesClosed={!isLit} flip={p.x > 360} />
          </g>
        );
      })}
      <g transform={`translate(${light.x - 16} ${light.y + 2})`}>
        <PrismCharacter pose="idle" size={32} />
      </g>
      <circle cx={light.x} cy={light.y} r="4" fill="#fde68a" />
      <Label x={W - 12} y={20} anchor="end">MOVE YOUR POINTER · {vis.rays} RAYS</Label>
    </svg>
  );
}

/* 2. Star trails (replaces Game day)
   Scrolling the page is a long exposure: scroll velocity turns the sky around the pole star and the stars
   draw trails; scrolling back rewinds. The cast sit by a camera on a tripod; idle long enough and they lie
   back and the trails fade. */
export function TrailsScene() {
  const pole = { x: 560, y: 36 };
  const r = mulberry32(7);
  const sweep = 38; // degrees exposed so far
  const trails = Array.from({ length: 46 }, () => ({ rad: 20 + r() * 520, a0: r() * 360, o: 0.25 + r() * 0.6, hue: r() }));
  const col = (h: number) => (h > 0.9 ? t.kind.ai : h > 0.82 ? t.kind.systems : h > 0.76 ? t.route : '#ffffff');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
      <NightSky seed={2} />
      <g fill="none" strokeLinecap="round">
        {trails.map((s, i) => {
          const a0 = (s.a0 * Math.PI) / 180;
          const a1 = ((s.a0 + sweep) * Math.PI) / 180;
          const x0 = pole.x + Math.cos(a0) * s.rad, y0 = pole.y + Math.sin(a0) * s.rad;
          const x1 = pole.x + Math.cos(a1) * s.rad, y1 = pole.y + Math.sin(a1) * s.rad;
          return <path key={i} d={`M${x0.toFixed(1)},${y0.toFixed(1)} A${s.rad.toFixed(1)},${s.rad.toFixed(1)} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`} stroke={col(s.hue)} strokeOpacity={s.o} strokeWidth="1.2" />;
        })}
      </g>
      <circle cx={pole.x} cy={pole.y} r="2.6" fill="#fff" />
      <Hill d="M0 206 Q 200 186 380 200 T 720 196 V240 H0Z" />
      {/* tripod + camera */}
      <g stroke="#6b6790" strokeWidth="2">
        <line x1="240" y1="168" x2="226" y2="204" />
        <line x1="240" y1="168" x2="254" y2="204" />
        <line x1="240" y1="168" x2="240" y2="206" />
      </g>
      <rect x="228" y="156" width="26" height="14" rx="2" fill="#2a2740" stroke="#6b6790" />
      <circle cx="254" cy="163" r="4" fill="#1b1a33" stroke="#6b6790" />
      <g transform="translate(190 204) scale(.6)">
        <Person look={LOOKS[2]} pose="sit" />
      </g>
      <g transform="translate(300 204) scale(.6)">
        <Person look={LOOKS[0]} pose="think" flip />
      </g>
      <g transform="translate(330 172)">
        <PrismCharacter pose="sit" size={30} />
      </g>
      <Label x={12} y={20}>SCROLL TO EXPOSE · {sweep}° OF SKY</Label>
      <Label x={12} y={34} fill="#6f6c85">
        SCROLL BACK TO REWIND
      </Label>
    </svg>
  );
}

/* 3. Name the constellation (replaces Trivia)
   A few stars join into the shape of something from one of the projects; the visitor guesses which. A wrong
   guess dims; the right one lights the figure and sends a shooting star down to the email button. */
export function QuizScene() {
  // A point light and two walls with rays: the visibility engine, drawn as a constellation.
  const lightStar: Pt = { x: 470, y: 92 };
  const wallA: [Pt, Pt] = [{ x: 400, y: 60 }, { x: 430, y: 130 }];
  const wallB: [Pt, Pt] = [{ x: 520, y: 140 }, { x: 570, y: 120 }];
  const rays: Pt[] = [{ x: 560, y: 40 }, { x: 600, y: 80 }, { x: 380, y: 160 }, { x: 470, y: 170 }];
  const star = (p: Pt, big = false, c = '#eceaf3') => (
    <g key={`${p.x}-${p.y}`}>
      <circle cx={p.x} cy={p.y} r={big ? 9 : 6} fill={c} opacity=".22" />
      <circle cx={p.x} cy={p.y} r={big ? 3.6 : 2.4} fill={c} />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
      <NightSky seed={3} />
      <g stroke="#eceaf3" strokeOpacity=".45">
        <line x1={wallA[0].x} y1={wallA[0].y} x2={wallA[1].x} y2={wallA[1].y} />
        <line x1={wallB[0].x} y1={wallB[0].y} x2={wallB[1].x} y2={wallB[1].y} />
      </g>
      <g stroke="#fde68a" strokeOpacity=".35" strokeDasharray="3 4">
        {rays.map((p) => (
          <line key={p.x} x1={lightStar.x} y1={lightStar.y} x2={p.x} y2={p.y} />
        ))}
      </g>
      {[...wallA, ...wallB, ...rays].map((p) => star(p))}
      {star(lightStar, true, '#fde68a')}
      {/* the shooting star that the right answer releases (shown faint) */}
      <path d="M612 60 L690 190" stroke="url(#shoot)" strokeWidth="2" strokeLinecap="round" opacity=".5" />
      <defs>
        <linearGradient id="shoot" x1="612" y1="60" x2="690" y2="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <Hill />
      <g transform="translate(110 200) scale(.6)">
        <Person look={LOOKS[1]} pose="think" />
      </g>
      <g transform="translate(170 200) scale(.6)">
        <Person look={LOOKS[3]} pose="sit" />
      </g>
      <g transform="translate(236 168)">
        <PrismCharacter pose="wave" size={32} />
      </g>
      {/* question card */}
      <g>
        <rect x="24" y="22" width="250" height="118" rx="12" fill="rgba(17,18,32,.86)" stroke="rgba(255,255,255,.12)" />
        <text x="40" y="46" fontFamily={mono} fontSize="9.5" letterSpacing=".14em" fill="#8a879c">
          NAME THE CONSTELLATION
        </text>
        <text x="40" y="68" fontFamily="var(--font-bricolage)" fontWeight="700" fontSize="14" fill="#eceaf3">
          Which project does it chart?
        </text>
        {['Kiln', 'Visibility engine', 'Tripwire'].map((o, i) => (
          <g key={o} transform={`translate(${40 + [0, 44, 160][i]} 88)`}>
            <rect width={[38, 110, 66][i]} height="26" rx="13" fill="rgba(255,255,255,.04)" stroke={i === 0 ? 'rgba(244,114,182,.6)' : 'rgba(255,255,255,.2)'} />
            <text x={[38, 110, 66][i] / 2} y="17" textAnchor="middle" fontFamily="var(--font-inter)" fontSize="11.5" fill={i === 0 ? '#f472b6' : '#c9c6d6'}>
              {o}
            </text>
          </g>
        ))}
        <text x="40" y="130" fontFamily="var(--font-inter)" fontSize="10.5" fill="#f472b6" opacity=".9">
          Not that one: Kiln would be a flame.
        </text>
      </g>
      <Label x={W - 12} y={226} anchor="end">
        RIGHT ANSWER SENDS A SHOOTING STAR TO THE EMAIL BUTTON ↘
      </Label>
    </svg>
  );
}

/* 4. Orbit (kept, recast)
   The cast walk a ring around the prism on the hilltop under a slowly turning sky, scaled and layered by
   depth. Holding the email button speeds them up and the stars streak; idle, they slow and sit. */
export function OrbitScene() {
  const cast = LOOKS.slice(0, 6).map((l, i) => {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const depth = (Math.sin(a) + 1) / 2;
    return { l, i, x: 360 + Math.cos(a) * 230, y: 150 + Math.sin(a) * 34, depth };
  }).sort((p, q) => p.depth - q.depth);
  const r = mulberry32(11);
  const streaks = Array.from({ length: 34 }, () => ({ x: r() * W, y: r() * 120, len: 6 + r() * 22, o: 0.25 + r() * 0.5 }));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full">
      <NightSky seed={4} />
      <g stroke="#fff" strokeLinecap="round">
        {streaks.map((s, i) => (
          <line key={i} x1={s.x.toFixed(1)} y1={s.y.toFixed(1)} x2={(s.x + s.len).toFixed(1)} y2={(s.y - s.len * 0.18).toFixed(1)} strokeOpacity={s.o} strokeWidth=".9" />
        ))}
      </g>
      <Hill d="M0 196 Q 180 150 360 152 T 720 196 V240 H0Z" fill="#090a16" />
      <ellipse cx="360" cy="168" rx="236" ry="36" fill="none" stroke="rgba(255,255,255,.18)" strokeDasharray="4 6" />
      {cast
        .filter((p) => p.depth <= 0.5)
        .map((p) => (
          <g key={p.i} transform={`translate(${p.x.toFixed(1)} ${(p.y + 20).toFixed(1)}) scale(${(0.42 + p.depth * 0.3).toFixed(2)})`} opacity={0.6 + p.depth * 0.4}>
            <Person look={p.l} pose="run" phase={p.i * 0.17} flip={p.x < 360} />
          </g>
        ))}
      <g transform="translate(332 108)">
        <PrismCharacter pose="cheer" size={56} />
      </g>
      {cast
        .filter((p) => p.depth > 0.5)
        .map((p) => (
          <g key={p.i} transform={`translate(${p.x.toFixed(1)} ${(p.y + 20).toFixed(1)}) scale(${(0.42 + p.depth * 0.3).toFixed(2)})`}>
            <Person look={p.l} pose={p.depth > 0.85 ? 'cheer' : 'run'} phase={p.i * 0.17} flip={p.x > 360} />
          </g>
        ))}
      <Label x={12} y={20} fill="#fbbf24">
        HOLDING THE EMAIL BUTTON · FASTER
      </Label>
    </svg>
  );
}

export const footerConcepts = [
  {
    key: 'lantern',
    name: 'Lantern',
    replaces: 'Lightroom',
    Scene: LanternScene,
    interaction: 'Your pointer moves the prism’s lantern across a hilltop of standing stones. The lit area is a real visibility polygon, the idea behind the visibility engine project.',
    response: 'People the light reaches wake and wave; people left in shadow doze.',
    idle: 'With no pointer, the prism wanders slowly between the stones.',
    reduced: 'The lantern rests mid-hill; the lit area is still computed, so moving the pointer still works.',
  },
  {
    key: 'trails',
    name: 'Star trails',
    replaces: 'Game day',
    Scene: TrailsScene,
    interaction: 'Scrolling the page is a long exposure: scroll speed turns the sky around the pole star and the stars draw trails. Scrolling back rewinds them.',
    response: 'The counter shows how many degrees of sky are exposed; the cast glance up as the trails grow.',
    idle: 'After a while without input the cast lie back and the trails slowly fade.',
    reduced: 'A finished exposure of about 40° is shown; no scroll response.',
  },
  {
    key: 'quiz',
    name: 'Name the constellation',
    replaces: 'Trivia',
    Scene: QuizScene,
    interaction: 'Stars join into a shape drawn from one project (here, a light and two walls: the visibility engine). The visitor picks which project it charts.',
    response: 'A wrong guess dims with a one-line hint; the right one lights the figure and a shooting star falls to the email button, which pulses.',
    idle: 'Each visit picks a different project figure; "another" draws a new one.',
    reduced: 'The figure is fully drawn; answers work the same, without the shooting star.',
  },
  {
    key: 'orbit',
    name: 'Orbit',
    replaces: 'Orbit',
    Scene: OrbitScene,
    interaction: 'The cast walk a ring around the prism on a hilltop, scaled and layered by depth, hopping as they pass the front.',
    response: 'Holding the email button speeds them up and the stars streak into trails; releasing settles everything.',
    idle: 'After about 30 seconds they slow, sit and the prism dozes; any input wakes them with a cheer.',
    reduced: 'A still ring with everyone in place.',
  },
];

export function AllFooterConcepts() {
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
