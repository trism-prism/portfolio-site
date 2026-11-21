'use client';

// The Moth constellation (featured projects drawn as a moth) and the intro storyboard. Lab reference only.

import { mulberry32 } from '@/lib/kit';
import { MothCharacter } from '@/components/ui/Moth';
import { dark, twilight, type Tokens } from './themeTokens';

const r1 = (v: number) => Math.round(v * 10) / 10;
const LAV = '#cfc9f5';
const GOLD = '#f5c45e';
const mono = 'var(--font-jetbrains), monospace';
const serif = 'var(--font-instrument), serif';

/* ---------------- the figure ---------------- */
type P = [number, number];
type Star = { id: string; p: P };

// Front view, wings spread, in a 400 × 260 box (variant A, approved). No project meaning.
const SPREAD: Star[] = [
  { id: 'head', p: [200, 66] },
  { id: 'antL', p: [176, 34] },
  { id: 'antR', p: [224, 34] },
  { id: 'thorax', p: [200, 100] },
  { id: 'mid', p: [200, 146] },
  { id: 'tail', p: [200, 196] },
  { id: 'foreL', p: [70, 52] },
  { id: 'foreLlow', p: [112, 134] },
  { id: 'foreR', p: [330, 52] },
  { id: 'foreRlow', p: [288, 134] },
  { id: 'hindL', p: [128, 214] },
  { id: 'hindR', p: [272, 214] },
];
const LINES: [string, string][] = [
  ['antL', 'head'],
  ['antR', 'head'],
  ['head', 'thorax'],
  ['thorax', 'mid'],
  ['mid', 'tail'],
  ['thorax', 'foreL'],
  ['foreL', 'foreLlow'],
  ['foreLlow', 'thorax'],
  ['thorax', 'foreR'],
  ['foreR', 'foreRlow'],
  ['foreRlow', 'thorax'],
  ['foreLlow', 'hindL'],
  ['hindL', 'mid'],
  ['foreRlow', 'hindR'],
  ['hindR', 'mid'],
];

const SOFT: Record<string, number> = { foreL: 2, foreR: 0, hindL: 3, hindR: 1, tail: 4 };

/** The Moth constellation: soft spectrum stars with no meaning attached, the head the brightest. */
export function MothFigure({ t, stars, scale = 1, x = 0, y = 0, name = true }: { t: Tokens; stars: Star[]; scale?: number; x?: number; y?: number; name?: boolean }) {
  const at = (id: string) => stars.find((s) => s.id === id)!.p;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {LINES.map(([a, b]) => {
        const [x1, y1] = at(a);
        const [x2, y2] = at(b);
        return <line key={a + b} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.constellation} strokeWidth={1 / scale} />;
      })}
      {stars.map((s) => {
        const [sx, sy] = s.p;
        if (s.id === 'head')
          return (
            <g key={s.id}>
              <circle cx={sx} cy={sy} r={13} fill={t.star} opacity=".16" />
              <circle cx={sx} cy={sy} r={4.6} fill={t.star} stroke={t.starHalo} strokeWidth="1.5" />
            </g>
          );
        const k = SOFT[s.id];
        if (k !== undefined)
          return (
            <g key={s.id}>
              <circle cx={sx} cy={sy} r={9} fill={t.spectrum[k]} opacity=".18" />
              <circle cx={sx} cy={sy} r={3.4} fill={t.spectrum[k]} opacity=".85" />
            </g>
          );
        return <circle key={s.id} cx={sx} cy={sy} r={2} fill={t.star} opacity=".75" stroke={t.starHalo} />;
      })}
      {name && (
        <text x={200} y={250} textAnchor="middle" fontFamily={serif} fontStyle="italic" fontSize={20} fill={t.accentSerif}>
          the Moth
        </text>
      )}
    </g>
  );
}

function SkyRect({ t, w, h, seed, n = 90 }: { t: Tokens; w: number; h: number; seed: number; n?: number }) {
  const r = mulberry32(seed);
  const id = `ms-${t.name}-${seed}`;
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.skyTop} />
          <stop offset=".6" stopColor={t.skyMid} />
          <stop offset="1" stopColor={t.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id})`} />
      {Array.from({ length: n }, (_, i) => (
        <circle key={i} cx={r1(r() * w)} cy={r1(r() * h)} r={r1(0.4 + r() * 0.8)} fill={t.star} opacity={r1(0.25 + r() * 0.55)} stroke={t.starHalo} strokeWidth=".6" />
      ))}
    </>
  );
}

export function ConstellationSheet() {
  return (
    <section data-sheet="moth-constellation" style={{ width: 1440, background: '#07080d', color: dark.ink }} className="px-16 py-14">
      <p className="font-mono text-[11px] uppercase tracking-[.18em]" style={{ color: dark.ink3 }}>
        The Moth constellation · variant A, no project labels, soft spectrum
      </p>
      <h2 className="mt-2 font-display text-[40px] font-bold tracking-[-0.03em]">
        The <span className="font-serif font-normal italic" style={{ color: dark.accentSerif }}>Moth</span>
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-8">
        {[dark, twilight].map((t) => (
          <div key={t.name}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: dark.ink3 }}>
              Hero · {t.name}
            </p>
            <div className="overflow-hidden rounded-2xl border" style={{ borderColor: dark.cardBorder }}>
              <svg viewBox="0 0 620 340" width="100%" style={{ display: 'block' }} aria-hidden>
                <SkyRect t={t} w={620} h={340} seed={9} />
                <MothFigure t={t} stars={SPREAD} x={110} y={40} />
              </svg>
            </div>
          </div>
        ))}
      </div>
      <p className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: dark.ink3 }}>
        Footer · same in both themes
      </p>
      <div className="w-[660px] overflow-hidden rounded-2xl border" style={{ borderColor: dark.cardBorder }}>
        <svg viewBox="0 0 660 380" width="100%" style={{ display: 'block' }} aria-hidden>
          <SkyRect t={dark} w={660} h={380} seed={21} />
          <MothFigure t={dark} stars={SPREAD} scale={0.8} x={170} y={56} />
          <path d="M0 330 Q 160 300 330 316 T 660 306 V380 H0Z" fill="#0b0e20" />
        </svg>
      </div>
    </section>
  );
}

/* ---------------- intro storyboard ---------------- */
const FW = 420;
const FH = 236;
const CHRYS: P[] = [
  [210, 66],
  [230, 90],
  [236, 124],
  [224, 158],
  [210, 170],
  [196, 158],
  [184, 124],
  [190, 90],
];

function Frame({ i, time, title, children, note }: { i: number; time: string; title: string; children: React.ReactNode; note: string }) {
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border" style={{ borderColor: dark.cardBorder }}>
        <svg viewBox={`0 0 ${FW} ${FH}`} width="100%" style={{ display: 'block' }} aria-hidden>
          <SkyRect t={dark} w={FW} h={FH} seed={40 + i} n={i === 1 ? 30 : 70} />
          {children}
          <g opacity={i < 9 ? 1 : 0}>
            <rect x={FW - 86} y={FH - 32} width="74" height="22" rx="11" fill="rgba(17,18,32,.8)" stroke="rgba(255,255,255,.16)" />
            <text x={FW - 49} y={FH - 17} textAnchor="middle" fontSize="10" fontFamily="var(--font-inter), sans-serif" fill={dark.ink2}>
              Skip intro
            </text>
          </g>
        </svg>
      </div>
      <p className="mt-3 flex items-baseline gap-3">
        <span className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: dark.ink3 }}>
          {i} · {time}
        </span>
        <span className="font-display text-[17px] font-bold">{title}</span>
      </p>
      <p className="mt-1 text-[13px] leading-relaxed" style={{ color: dark.ink2 }}>
        {note}
      </p>
    </div>
  );
}

function Chrysalis({ draw = 1, prism = false, open = 0, solid = false }: { draw?: number; prism?: boolean; open?: number; solid?: boolean }) {
  const pts = CHRYS;
  const n = Math.round(pts.length * draw);
  const c: P = [210, 122];
  const facets = pts.map((p, k) => {
    const q = pts[(k + 1) % pts.length];
    return { d: `M${c[0]} ${c[1]} L${p[0]} ${p[1]} L${q[0]} ${q[1]}Z`, col: dark.spectrum[k % 5], left: p[0] < 210 || q[0] < 210 };
  });
  return (
    <g>
      <line x1="210" y1="26" x2="210" y2="66" stroke={dark.constellation} />
      <circle cx="210" cy="26" r="3" fill="#fff" />
      {prism && (
        <g>
          <circle cx={c[0]} cy={c[1]} r="70" fill={LAV} opacity=".08" />
          {facets.map((f, k) => (
            <path key={k} d={f.d} fill={f.col} opacity={solid ? 0.92 : 0.62} stroke="#fff" strokeOpacity=".5" strokeWidth=".8" transform={open ? `translate(${f.left ? -open : open} ${open * 0.3}) rotate(${f.left ? -open : open} ${c[0]} 170)` : undefined} />
          ))}
        </g>
      )}
      {!open && (
        <polyline
          points={[...pts.slice(0, n), ...(draw >= 1 ? [pts[0]] : [])].map((p) => p.join(',')).join(' ')}
          fill="none"
          stroke={prism ? '#fff' : dark.constellation}
          strokeOpacity={prism ? 0.7 : 1}
          strokeWidth={prism ? 1.2 : 1}
        />
      )}
      {pts.slice(0, n).map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={prism ? 2.4 : 2.8} fill="#fff" />
      ))}
      {draw < 1 && <circle cx={pts[n][0]} cy={pts[n][1]} r="6" fill="#fff" opacity=".25" />}
    </g>
  );
}

function Rays({ k = 1 }: { k?: number }) {
  return (
    <g strokeLinecap="round">
      {dark.spectrum.map((c, i) => {
        const a = ((-150 + i * 30) * Math.PI) / 180;
        const L = 150 * k;
        return <line key={c} x1="210" y1="122" x2={r1(210 + Math.cos(a) * L)} y2={r1(122 + Math.sin(a) * L)} stroke={c} strokeWidth="2" opacity=".75" />;
      })}
    </g>
  );
}

function Moth({ pose, w, cx, base }: { pose: 'sit' | 'wave' | 'cheer' | 'jump'; w: number; cx: number; base: number }) {
  const seated = pose === 'sit';
  const h = seated ? w : (w * 120) / 160;
  return (
    <g transform={`translate(${r1(cx - w / 2)} ${r1(base - h)})`}>
      <MothCharacter pose={pose} size={w} />
    </g>
  );
}

export function IntroSheet({ sigFamily }: { sigFamily: string }) {
  return (
    <section data-sheet="intro-storyboard" style={{ width: 1440, background: '#07080d', color: dark.ink }} className="px-16 py-14">
      <p className="font-mono text-[11px] uppercase tracking-[.18em]" style={{ color: dark.ink3 }}>
        Intro · about 4 seconds on one eased timeline · first visit only
      </p>
      <h2 className="mt-2 font-display text-[40px] font-bold tracking-[-0.03em]">
        The moth <span className="font-serif font-normal italic" style={{ color: dark.accentSerif }}>emerges</span>
      </h2>
      <div className="mt-8 grid grid-cols-3 gap-x-8 gap-y-10">
        <Frame i={1} time="0.0–0.4 s" title="Night" note="The page opens on the dark sky. A few stars fade in; everything else is hidden.">
          <circle cx="210" cy="26" r="2.6" fill="#fff" opacity=".6" />
        </Frame>
        <Frame i={2} time="0.4–1.0 s" title="A chrysalis is charted" note="Stars appear one by one from a single anchor star; a constellation line draws through them into a hanging chrysalis.">
          <Chrysalis draw={0.62} />
        </Frame>
        <Frame i={3} time="1.0–1.5 s" title="It turns prismatic" note="Glassy facets fill the outline in the spectrum colours, glowing softly and breathing once: the prism, now a chrysalis.">
          <Chrysalis prism />
        </Frame>
        <Frame i={4} time="1.5–1.9 s" title="A seam of light" note="A thin bright seam opens down the middle and light leaks out of it; the chrysalis gives two small pulses, as if something stirs inside.">
          <circle cx="210" cy="120" r="80" fill={LAV} opacity=".06" />
          <Chrysalis prism />
          <line x1="210" y1="70" x2="210" y2="166" stroke="#fff" strokeWidth="2.2" />
          <line x1="210" y1="70" x2="210" y2="166" stroke={LAV} strokeWidth="7" opacity=".25" />
        </Frame>
        <Frame i={5} time="1.9–2.3 s" title="Head and antennae" note="The seam widens; the moth's head pushes out of the top and its antennae uncurl, slowly, one then the other.">
          <Moth pose="sit" w={64} cx={210} base={100} />
          <Chrysalis prism open={3} solid />
        </Frame>
        <Frame i={6} time="2.3–2.8 s" title="It pulls free" note="The two halves fall away and fade into drifting facets of light; the moth climbs out, wings still folded and crumpled.">
          <Rays k={0.6} />
          <Chrysalis prism open={14} />
          <Moth pose="crouch" w={74} cx={210} base={164} />
        </Frame>
        <Frame i={7} time="2.8–3.3 s" title="Wings expand" note="The wings open gradually from the body outward, like drying: the wing stars light up one by one as they reach the air.">
          <g transform="translate(210 0) scale(.58 1) translate(-210 0)">
            <Moth pose="wave" w={130} cx={210} base={172} />
          </g>
        </Frame>
        <Frame i={8} time="3.3–3.6 s" title="Fully open" note="Wings settle fully open over the Moth constellation, whose lines draw in behind them from the head outward.">
          <MothFigure t={dark} stars={SPREAD} name={false} scale={0.78} x={54} y={14} />
          <circle cx="210" cy="120" r="64" fill={GOLD} opacity=".08" />
          <Moth pose="cheer" w={128} cx={210} base={168} />
        </Frame>
        <Frame i={9} time="3.6–4.2 s" title="Light reaches the site" note="One wingbeat sends a ring of light outward and the page lights up behind it: nav, then your name, then the rest. The moth flies up into the nav logo.">
          <circle cx="210" cy="118" r="150" fill="none" stroke={LAV} strokeOpacity=".35" strokeWidth="2" />
          <circle cx="210" cy="118" r="110" fill={LAV} opacity=".05" />
          <rect x="16" y="14" width={FW - 32} height="26" rx="8" fill="rgba(17,18,32,.7)" stroke="rgba(255,255,255,.1)" />
          {[150, 196, 236, 280].map((x) => (
            <rect key={x} x={x} y="24" width="30" height="5" rx="2.5" fill={dark.ink3} opacity=".7" />
          ))}
          <rect x={FW - 74} y="20" width="52" height="14" rx="7" fill={dark.buttonBg} opacity=".85" />
          <text x="210" y="124" textAnchor="middle" fontFamily="var(--font-bricolage), sans-serif" fontWeight="700" fontSize="24" fill={dark.ink}>
            Hi, I&apos;m{' '}
            <tspan fontFamily={sigFamily} fontWeight="400" fontSize="30" fill={dark.accentSerif}>
              Tristan Morton
            </tspan>
          </text>
          <rect x="150" y="146" width="120" height="7" rx="3.5" fill={dark.ink3} opacity=".5" />
          <rect x="160" y="160" width="100" height="7" rx="3.5" fill={dark.ink3} opacity=".35" />
          <path d="M120 90 C 80 70 50 46 36 28" fill="none" stroke={LAV} strokeOpacity=".5" strokeDasharray="2 5" />
          <Moth pose="jump" w={34} cx={36} base={36} />
        </Frame>
      </div>
      <div className="mt-10 grid grid-cols-5 gap-6 text-[14px] leading-relaxed">
        {(
          [
            ['Smoothness', 'One continuous timeline with eased transitions: frames are key moments, not steps. Each beat overlaps the next by about 0.15 s.'],
            ['Skipping', 'A "Skip intro" button is visible from the first frame; any key, click, tap or scroll jumps to the end state.'],
            ['When it plays', 'First visit of a session only (the existing intro flag). Never on later visits or on reloads in the same session.'],
            ['Reduced motion', 'No intro: the site loads already lit, the moth already in the nav logo.'],
            ['Twilight', 'Plays on the night sky; in the last frame the sky dissolves into the dusk-blue twilight sky as the site lights up.'],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <p className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: dark.ink3 }}>
              {k}
            </p>
            <p className="mt-1.5" style={{ color: '#c9c6d6' }}>
              {v}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
