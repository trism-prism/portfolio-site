'use client';

import { projects, type Project, type ProjectKind } from '@/data/projects';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { personal } from '@/data/personal';
import { plain, isPh } from '@/data/ph';
import { mulberry32 } from '@/lib/kit';
import { covers } from '@/components/scenes/covers/registry';
import { Stage } from '@/components/scenes/Stage';
import { Icon } from '@/components/ui/Icon';
import { PrismCharacter, PrismMark } from '@/components/ui/Prism';
import type { Tokens } from './themeTokens';

// The chosen direction rendered from one token set, so dark and twilight can be compared like for like.
// Bakes in the decisions so far: constellations, plain words, rounded cards, Sacramento for the name,
// existing cover animations. Lab reference only.

const mono = 'var(--font-jetbrains), monospace';
const kindName: Record<ProjectKind, string> = { software: 'Software', ai: 'AI', data: 'Data', systems: 'Systems' };

function Sky({ t, seed, w = 1440, h = 900, haze = false }: { t: Tokens; seed: number; w?: number; h?: number; haze?: boolean }) {
  const r = mulberry32(seed);
  const stars = Array.from({ length: Math.round((w * h) / (t.name === 'dark' ? 6000 : 9000)) }, () => ({
    x: Math.round(r() * w),
    y: Math.round(r() * h),
    s: r() < 0.07 ? 1.6 : 0.6 + r() * 0.7,
    o: 0.25 + r() * 0.55,
  }));
  const id = `sky-${t.name}-${seed}`;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.skyTop} />
          <stop offset=".55" stopColor={t.skyMid} />
          <stop offset="1" stopColor={t.skyBottom} />
        </linearGradient>
        <radialGradient id={`${id}-h`} cx="0" cy="0" r="1" gradientTransform={`translate(${w * 0.68} ${h * 0.42}) rotate(-28) scale(${w * 0.5} ${h * 0.17})`} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={t.haze} stopOpacity={t.name === 'dark' ? 0.12 : 0.16} />
          <stop offset="1" stopColor={t.haze} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-g)`} />
      {haze && <rect width={w} height={h} fill={`url(#${id}-h)`} />}
      <g fill="none" stroke={t.graticule}>
        {[0.6, 0.85, 1.1, 1.35].map((k) => (
          <circle key={k} cx={Math.round(w * 0.87)} cy={Math.round(h * 1.28)} r={Math.round(h * k)} />
        ))}
      </g>
      {stars.map((s, i) => (
        <g key={i} opacity={s.o}>
          {t.starHalo !== 'transparent' && <circle cx={s.x} cy={s.y} r={s.s + 0.9} fill={t.starHalo} />}
          <circle cx={s.x} cy={s.y} r={s.s} fill={t.star} />
        </g>
      ))}
    </svg>
  );
}

function Star({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <circle cx="6" cy="6" r="5.5" fill={color} opacity=".18" />
      <path d="M6 1 L7 5 L11 6 L7 7 L6 11 L5 7 L1 6 L5 5Z" fill={color} />
    </svg>
  );
}

function Card({ t, children, className = '', tone }: { t: Tokens; children: React.ReactNode; className?: string; tone?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border ${className}`} style={{ background: t.card, borderColor: t.cardBorder, backdropFilter: 'blur(8px)', boxShadow: t.name === 'twilight' ? '0 18px 40px -26px rgba(19,26,46,.45)' : undefined }}>
      {tone && <span aria-hidden className="absolute left-5 top-0 h-[2px] w-10 rounded-b-full" style={{ background: tone }} />}
      {children}
    </div>
  );
}

function Header({ t, n, label, title, accent, aside }: { t: Tokens; n: string; label: string; title: string; accent?: string; aside: string }) {
  return (
    <header className="relative mb-10">
      <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: t.ink3 }}>
        <Star color={t.ink} size={12} />
        <span style={{ color: t.ink }}>{n}</span> {label}
        <span className="ml-auto normal-case tracking-[.08em]">{aside}</span>
      </p>
      <div className="mt-3 flex items-end gap-6">
        <h2 className="shrink-0 font-display text-[52px] font-bold leading-none tracking-[-0.035em]" style={{ color: t.ink }}>
          {title} {accent && <span className="font-serif font-normal italic" style={{ color: t.accentSerif }}>{accent}</span>}
        </h2>
        <div className="relative mb-2 h-[10px] flex-1">
          <span className="absolute inset-x-0 bottom-0 h-px" style={{ background: t.rule }} />
          <div className="absolute inset-x-0 bottom-0 flex justify-between">
            {Array.from({ length: 41 }, (_, i) => (
              <span key={i} style={{ width: 1, height: i % 10 === 0 ? 10 : i % 5 === 0 ? 7 : 4, background: t.rule }} />
            ))}
          </div>
          <div className="absolute bottom-[-16px] right-10">
            <PrismCharacter pose="sit" size={42} />
          </div>
        </div>
      </div>
    </header>
  );
}

function Cover({ p }: { p: Project }) {
  const c = covers[p.cover];
  return (
    <Stage>
      <c.Scene t={c.frozenAt} reduced />
    </Stage>
  );
}

/* ---------------- Hero ---------------- */
const SHAPE: [number, number][] = [
  [1030, 230],
  [1200, 560],
  [860, 560],
  [1108, 385],
];

export function ThemeHero({ t, sigFamily }: { t: Tokens; sigFamily: string }) {
  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const spec = `linear-gradient(90deg, ${t.spectrum.join(', ')})`;
  const here: [number, number] = [640, 770];
  return (
    <section data-sheet={`hero-${t.name}`} className="relative overflow-hidden" style={{ width: 1440, height: 900, color: t.ink }}>
      <Sky t={t} seed={2026} haze />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 900" aria-hidden>
        <polyline points={[SHAPE[0], SHAPE[3], SHAPE[1], SHAPE[2], SHAPE[0]].map((p) => p.join(',')).join(' ')} fill="none" stroke={t.constellation} />
        {[
          [1002, 472],
          [1058, 472],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="2.4" fill={t.ink} />
        ))}
        {featured.map((p, i) => {
          const [x, y] = SHAPE[i];
          const c = t.kind[p.kind];
          const flip = i === 1;
          return (
            <g key={p.slug}>
              <circle cx={x} cy={y} r="13" fill={c} opacity=".25" />
              <circle cx={x} cy={y} r="4.5" fill={c} />
              <text x={flip ? x - 16 : x + 16} y={y - 8} textAnchor={flip ? 'end' : 'start'} fontFamily="var(--font-bricolage)" fontWeight="700" fontSize="14" fill={t.ink}>
                {p.title.replace('2D Visibility & Lighting Engine', 'Visibility engine')}
              </text>
              <text x={flip ? x - 16 : x + 16} y={y + 9} textAnchor={flip ? 'end' : 'start'} fontFamily={mono} fontSize="10" letterSpacing=".12em" fill={c}>
                {kindName[p.kind].toUpperCase()} · {p.period.toUpperCase()}
              </text>
            </g>
          );
        })}
        <text x="1030" y="626" textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="22" fill={t.accentSerif}>
          the Prism
        </text>
        <path d={`M${here[0]},${here[1]} C ${here[0] + 200},${here[1] - 40} ${SHAPE[2][0] - 160},${SHAPE[2][1] + 140} ${SHAPE[2][0]},${SHAPE[2][1]}`} fill="none" stroke={t.route} strokeWidth="1.5" strokeDasharray="5 6" />
        <g transform={`translate(${here[0]} ${here[1]})`}>
          <circle r="6" fill="none" stroke={t.route} />
          <circle r="2" fill={t.route} />
          <text x="14" y="4" fontFamily={mono} fontSize="10.5" letterSpacing=".14em" fill={t.route}>
            YOU ARE HERE · LEESBURG, VA
          </text>
        </g>
      </svg>
      {/* chart-marker tech tiles */}
      {['TS', 'Py', 'C++', '⚛', 'pg'].map((l, i) => (
        <div key={l} className="absolute grid h-[50px] w-[50px] place-items-center" style={{ left: 60, top: 130 + i * 140 }}>
          <svg viewBox="0 0 52 52" className="absolute inset-0" aria-hidden>
            <circle cx="26" cy="26" r="19" fill={t.card} stroke={t.cardBorder} />
            <circle cx="26" cy="26" r="23" fill="none" stroke={t.spectrum[i]} strokeOpacity=".6" strokeDasharray="2 4" />
            <path d="M26 1 v6 M26 45 v6 M1 26 h6 M45 26 h6" stroke={t.spectrum[i]} />
          </svg>
          <span className="relative font-mono text-[12.5px] font-bold" style={{ color: t.ink }}>
            {l}
          </span>
        </div>
      ))}
      <header className="relative z-10 mx-auto flex h-16 max-w-[1152px] items-center gap-6 px-6">
        <PrismMark size={34} />
        <nav className="ml-auto flex gap-6 text-[14.5px]" style={{ color: t.ink2 }}>
          {['About', 'Experience', 'Skills', 'Projects', 'More'].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </nav>
        <span className="flex h-9 items-center gap-2 rounded-lg border px-3 text-[12px]" style={{ borderColor: t.cardBorder, color: t.ink2 }}>
          <Icon name="search" size={14} /> Ctrl K
        </span>
        <span className="flex h-10 items-center rounded-lg px-4 text-sm font-semibold" style={{ background: t.buttonBg, color: t.buttonFg }}>
          Contact me
        </span>
      </header>
      <div className="relative z-10 mx-auto flex h-[calc(900px-64px)] max-w-[1152px] items-center px-6 pb-16">
        <div className="max-w-[620px]">
          <p className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px]" style={{ borderColor: t.cardBorder, background: t.card, color: t.ink2 }}>
            <span className="h-2 w-2 rounded-full" style={{ background: t.kind.software }} />
            {personal.status}
          </p>
          <h1 className="mt-8 font-display text-[72px] font-bold leading-[1.04] tracking-[-0.035em]">
            Hi, I&apos;m
            <br />
            <span style={{ fontFamily: sigFamily, fontWeight: 400, fontSize: '1.35em', letterSpacing: 0, background: spec, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingInline: '.06em' }}>
              Tristan Morton
            </span>
            <span style={{ color: t.route }}>.</span>
          </h1>
          <p className="mt-2 font-display text-[30px] font-semibold leading-tight tracking-[-0.02em]" style={{ color: t.ink2 }}>
            I build software you can <span className="font-serif font-normal italic" style={{ color: t.ink }}>inspect</span>.
          </p>
          <p className="mt-5 max-w-[540px] text-[17px] leading-relaxed" style={{ color: t.ink2 }}>
            {personal.intro}
          </p>
          <div className="mt-8 flex gap-3">
            <span className="inline-flex h-12 items-center gap-2 rounded-xl px-6 font-semibold" style={{ background: t.buttonBg, color: t.buttonFg }}>
              See projects <Icon name="arrowDownRight" size={16} />
            </span>
            <span className="inline-flex h-12 items-center gap-2 rounded-xl border px-5 font-semibold" style={{ borderColor: t.cardBorder }}>
              <Icon name="file" size={16} /> Read CV
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Projects ---------------- */
const GROUPS: { kind: ProjectKind; cx: number; cy: number }[] = [
  { kind: 'software', cx: 190, cy: 110 },
  { kind: 'ai', cx: 480, cy: 85 },
  { kind: 'data', cx: 760, cy: 130 },
  { kind: 'systems', cx: 990, cy: 90 },
];

export function ThemeProjects({ t }: { t: Tokens }) {
  const spotlight = projects.find((p) => p.spotlight)!;
  const featured = projects.filter((p) => p.featured && !p.spotlight);
  const r = mulberry32(9);
  return (
    <section data-sheet={`projects-${t.name}`} className="relative overflow-hidden" style={{ width: 1440, color: t.ink }}>
      <Sky t={t} seed={5} h={1600} />
      <div className="relative mx-auto max-w-[1152px] px-6 py-24">
        <Header t={t} n="05" label="Projects" title="Things I've" accent="built" aside="11 projects · 4 kinds" />
        <Card t={t} className="mb-4 h-[210px]">
          <svg viewBox="0 0 1104 210" className="h-full w-full" aria-hidden>
            {GROUPS.map((g) => {
              const list = projects.filter((p) => p.kind === g.kind);
              const pts = list.map((_, i) => {
                const a = (i / Math.max(1, list.length)) * Math.PI * 2 + r();
                const d = list.length > 1 ? 40 + r() * 30 : 0;
                return [Math.round(g.cx + Math.cos(a) * d * 1.6), Math.round(g.cy + Math.sin(a) * d * 0.75)];
              });
              const c = t.kind[g.kind];
              return (
                <g key={g.kind}>
                  <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={c} strokeOpacity=".5" />
                  {list.map((p, i) => (
                    <g key={p.slug}>
                      <circle cx={pts[i][0]} cy={pts[i][1]} r={p.featured ? 11 : 6} fill={c} opacity=".2" />
                      <circle cx={pts[i][0]} cy={pts[i][1]} r={p.featured ? 4 : 2.6} fill={c} />
                    </g>
                  ))}
                  <text x={g.cx} y={194} textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="19" fill={c}>
                    {kindName[g.kind]}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>
        <div className="mb-10 flex items-center gap-2">
          {(['all', 'featured', ...GROUPS.map((g) => g.kind)] as const).map((k) => {
            const n = k === 'all' ? projects.length : k === 'featured' ? projects.filter((p) => p.featured).length : projects.filter((p) => p.kind === k).length;
            const on = k === 'featured';
            return (
              <span key={k} className="flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px]" style={{ borderColor: on ? 'transparent' : t.cardBorder, background: on ? t.buttonBg : t.card, color: on ? t.buttonFg : t.ink2 }}>
                {k !== 'all' && k !== 'featured' && <Star color={t.kind[k]} />}
                {k === 'all' ? 'All' : k === 'featured' ? 'Featured' : kindName[k]}
                <span style={{ opacity: 0.65 }}>{n}</span>
              </span>
            );
          })}
          <span className="ml-auto flex h-10 w-[300px] items-center gap-2 rounded-full border px-4 text-[14px]" style={{ borderColor: t.cardBorder, background: t.card, color: t.ink3 }}>
            <Icon name="search" size={15} /> Search projects or technology
          </span>
        </div>
        <Card t={t} className="mb-6 grid min-h-[520px] grid-cols-[1.15fr_1fr]" tone={t.kind[spotlight.kind]}>
          <div className="border-r" style={{ borderColor: t.cardBorder, background: t.name === 'twilight' ? '#0d1220' : 'transparent' }}>
            <Cover p={spotlight} />
          </div>
          <div className="flex flex-col p-8">
            <p className="flex items-center gap-2 text-[13px]" style={{ color: t.ink2 }}>
              <Star color={t.kind[spotlight.kind]} /> Spotlight · {kindName[spotlight.kind]} · {spotlight.period}
            </p>
            <h3 className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">{spotlight.title}</h3>
            <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: t.ink2 }}>
              {spotlight.summary}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                ['127x', 'faster on mazes'],
                ['66', 'benchmark rows'],
                ['4', 'wall layouts tested'],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl border p-3" style={{ borderColor: t.cardBorder }}>
                  <p className="font-display text-[22px] font-bold">{v}</p>
                  <p className="text-[12.5px]" style={{ color: t.ink3 }}>
                    {l}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-auto flex gap-3 pt-6">
              <span className="flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold" style={{ background: t.buttonBg, color: t.buttonFg }}>
                Details <Icon name="arrowRight" size={15} />
              </span>
              <span className="flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold" style={{ borderColor: t.cardBorder }}>
                <Icon name="github" size={15} /> Source
              </span>
            </div>
          </div>
        </Card>
        <div className="grid grid-cols-3 gap-6">
          {featured.map((p) => (
            <Card key={p.slug} t={t} tone={t.kind[p.kind]}>
              <div className="aspect-[16/10] border-b" style={{ borderColor: t.cardBorder, background: t.name === 'twilight' ? '#0d1220' : 'transparent' }}>
                <Cover p={p} />
              </div>
              <div className="p-5">
                <p className="flex items-center gap-2 text-[12.5px]" style={{ color: t.ink2 }}>
                  <Star color={t.kind[p.kind]} size={9} /> {kindName[p.kind]}
                  <span className="ml-auto" style={{ color: t.ink3 }}>
                    {p.period}
                  </span>
                </p>
                <h3 className="mt-2.5 font-display text-[22px] font-bold tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed" style={{ color: t.ink2 }}>
                  {p.summary}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Experience & education route ---------------- */
export function ThemeRoute({ t }: { t: Tokens }) {
  const formwork = experience[0];
  const [jmu, nova] = education;
  const stops = [
    { x: 210, y: 300, when: nova.period, title: nova.school, tone: t.rose, kind: 'Education' },
    { x: 470, y: 210, when: plain(jmu.period), title: jmu.school, tone: t.rose, kind: 'Education', ph: isPh(jmu.period) },
    { x: 780, y: 270, when: formwork.period, title: formwork.org, tone: t.kind.ai, kind: 'Work' },
    { x: 1000, y: 170, when: 'Dec 2027', title: 'Graduation', tone: t.route, kind: 'Ahead', future: true },
  ];
  const path = `M${stops[0].x},${stops[0].y} C 300,300 370,210 ${stops[1].x},${stops[1].y} S 680,270 ${stops[2].x},${stops[2].y} S 930,170 ${stops[3].x},${stops[3].y}`;
  return (
    <section data-sheet={`route-${t.name}`} className="relative overflow-hidden" style={{ width: 1440, color: t.ink }}>
      <Sky t={t} seed={33} h={1100} />
      <div className="relative mx-auto max-w-[1152px] px-6 py-24">
        <Header t={t} n="02" label="Experience & education" title="Experience &" accent="education" aside="2023 → 2027" />
        <Card t={t} className="h-[380px]">
          <svg viewBox="0 0 1104 380" className="h-full w-full" aria-hidden>
            <path d={path} fill="none" stroke={t.route} strokeWidth="1.6" strokeDasharray="6 7" />
            {stops.map((s, i) => {
              const up = i === 1; // the route dips on both sides of JMU, so its label sits above
              return (
              <g key={s.title} transform={`translate(${s.x} ${s.y})`}>
                <circle r="15" fill="none" stroke={s.tone} strokeOpacity=".5" strokeDasharray={s.future ? '2 3' : undefined} />
                <circle r={s.future ? 4 : 5} fill={s.future ? 'none' : s.tone} stroke={s.tone} strokeWidth="1.4" />
                <text y={up ? 34 : -28} textAnchor="middle" fontFamily={mono} fontSize="11" letterSpacing=".14em" fill={s.tone}>
                  {s.kind.toUpperCase()}
                </text>
                <text y={up ? -48 : 42} textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="700" fontSize="17" fill={t.ink}>
                  {s.title}
                </text>
                <text y={up ? -28 : 62} textAnchor="middle" fontFamily={mono} fontSize="11" fill={t.ink3}>
                  {s.when}
                  {s.ph ? ' · start is a placeholder' : ''}
                </text>
              </g>
              );
            })}
          </svg>
        </Card>
        <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6">
          <Card t={t} className="p-7" tone={t.kind.ai}>
            <p className="text-[13px]" style={{ color: t.kind.ai }}>
              Now · {formwork.period}
            </p>
            <h3 className="mt-2 font-display text-[26px] font-bold tracking-[-0.025em]">{formwork.role}</h3>
            <p style={{ color: t.ink2 }}>
              {formwork.org} · {formwork.place}
            </p>
            <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed" style={{ color: t.ink2 }}>
              {formwork.points.slice(0, 2).map((pt) => (
                <li key={pt} className="flex gap-3">
                  <span className="mt-1.5">
                    <Star color={t.kind.ai} size={9} />
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          </Card>
          <div className="grid gap-6">
            {[jmu, nova].map((e) => (
              <Card key={e.id} t={t} className="p-6" tone={t.rose}>
                <p className="text-[13px]" style={{ color: t.rose }}>
                  {plain(e.period)}
                </p>
                <h3 className="mt-1.5 font-display text-[20px] font-bold">{e.school}</h3>
                <p className="text-[14.5px]" style={{ color: t.ink2 }}>
                  {e.credential}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer horizon ---------------- */
export function ThemeFooter({ t, sigFamily }: { t: Tokens; sigFamily: string }) {
  return (
    <section data-sheet={`footer-${t.name}`} className="relative overflow-hidden" style={{ width: 1440, height: 520, color: t.ink }}>
      <Sky t={t} seed={66} h={520} />
      <svg viewBox="0 0 1440 520" className="absolute inset-0 h-full w-full" aria-hidden>
        <polyline points="690,110 780,280 600,280 690,110" fill="none" stroke={t.constellation} />
        {[
          [690, 110, t.kind.systems],
          [780, 280, t.kind.ai],
          [600, 280, t.kind.software],
          [737, 198, t.kind.software],
        ].map(([x, y, c]) => (
          <g key={`${x}`}>
            <circle cx={x as number} cy={y as number} r="10" fill={c as string} opacity=".25" />
            <circle cx={x as number} cy={y as number} r="3.5" fill={c as string} />
          </g>
        ))}
        <circle cx="675" cy="242" r="2" fill={t.ink} />
        <circle cx="705" cy="242" r="2" fill={t.ink} />
        <text x="690" y="316" textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="18" fill={t.accentSerif}>
          the Prism
        </text>
        <path d="M0 440 Q 200 410 420 430 T 860 420 T 1440 432 V520 H0Z" fill={t.horizon} />
      </svg>
      <div className="absolute bottom-[86px] left-[calc(50%-260px)]">
        <PrismCharacter pose="sit" size={54} />
      </div>
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1152px] items-end justify-between px-6 pb-6 text-[13px]" style={{ color: '#c9c6d6' }}>
        <span>© 2026 {personal.name}</span>
        <span style={{ fontFamily: sigFamily, fontSize: 30, color: '#eceaf3' }}>Tristan Morton</span>
        <span>Back to top ↑</span>
      </div>
    </section>
  );
}
