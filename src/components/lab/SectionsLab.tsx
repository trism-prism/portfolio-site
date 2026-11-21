'use client';

// About, Achievements, Focus areas and Stats in the approved style: dark + twilight tokens, rounded cards,
// plain words, the moth seated on each section rule. Lab reference only.

import { personal } from '@/data/personal';
import { badges, certifications, competitions, honors } from '@/data/achievements';
import { focusAreas } from '@/data/focus';
import { statGroups, type Stat } from '@/data/stats';
import { projects } from '@/data/projects';
import { plain, isPh } from '@/data/ph';
import { Moth } from './Mascots';
import { Card, Sky, Star } from './ThemeLab';
import type { Tokens } from './themeTokens';

const mono = 'font-mono text-[11px] uppercase tracking-[.18em]';

/** Text that may be a placeholder: shows the amber placeholder tag the real site uses. */
function T({ s, t }: { s: string; t: Tokens }) {
  if (!isPh(s)) return <>{s}</>;
  const amber = t.name === 'dark' ? '#fbbf24' : '#7b4304';
  return (
    <>
      {plain(s)}{' '}
      <span className="ml-1 inline-block rounded-full border px-1.5 align-middle font-mono text-[9px] uppercase tracking-[.12em]" style={{ color: amber, borderColor: amber }}>
        Placeholder
      </span>
    </>
  );
}

function Header({ t, n, label, title, accent, aside }: { t: Tokens; n: string; label: string; title: string; accent?: string; aside: string }) {
  return (
    <header className="relative mb-12">
      <p className={`flex items-center gap-3 ${mono} text-[12px]`} style={{ color: t.ink3 }}>
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
          <div className="absolute right-12" style={{ bottom: -1 }}>
            <Moth pose="sit" w={46} />
          </div>
        </div>
      </div>
    </header>
  );
}

function Shell({ t, id, seed, children }: { t: Tokens; id: string; seed: number; children: React.ReactNode }) {
  return (
    <section data-sheet={`${id}-${t.name}`} className="relative overflow-hidden" style={{ width: 1440, color: t.ink }}>
      <Sky t={t} seed={seed} h={1000} />
      <div className="relative mx-auto max-w-[1152px] px-6 py-24">{children}</div>
    </section>
  );
}

const kindColor = (t: Tokens, slug: string) => {
  if (slug.startsWith('#')) return t.route;
  const p = projects.find((x) => x.slug === slug);
  return p ? t.kind[p.kind] : t.ink3;
};
const evidenceName = (slug: string) => (slug === '#experience' ? 'Formwork internship' : (projects.find((x) => x.slug === slug)?.title ?? slug));

/* ---------------- About ---------------- */
const INTEREST_X = [14, 40, 22, 46];

export function AboutSheet({ t }: { t: Tokens }) {
  const tones = [t.kind.software, t.kind.ai, t.kind.systems, t.kind.data];
  const names = ['Work', 'Study', 'Projects', 'Outside of code'];
  return (
    <Shell t={t} id="about" seed={31}>
      <Header t={t} n="01" label="About" title="About" accent="me" aside="Virginia" />
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <p className="font-display text-[34px] font-bold tracking-[-0.03em]">{personal.about.greeting}</p>
          <p className="mt-3 max-w-[600px] text-[17px] leading-relaxed" style={{ color: t.ink2 }}>
            {personal.intro}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {personal.about.cards.map((c, i) => (
              <Card key={c.icon} t={t} tone={tones[i]} className="p-5">
                <p className={`flex items-center gap-2 ${mono}`} style={{ color: t.ink3 }}>
                  <Star color={tones[i]} size={11} /> {names[i]}
                </p>
                <p className="mt-3 text-[14px] leading-relaxed" style={{ color: t.ink2 }}>
                  <T s={c.text} t={t} />
                </p>
              </Card>
            ))}
          </div>
        </div>
        <div className="col-span-5 flex flex-col gap-4">
          <Card t={t} className="p-5">
            <p className={mono} style={{ color: t.ink3 }}>
              Things I keep coming back to
            </p>
            {/* the interests as one constellation: a star per interest, joined down the card */}
            <div className="relative mt-4">
              <svg width="56" height={personal.interests.length * 62} className="absolute left-0 top-0" aria-hidden>
                <polyline points={INTEREST_X.map((x, i) => `${x},${31 + i * 62}`).join(' ')} fill="none" stroke={t.constellation} />
                {INTEREST_X.map((x, i) => (
                  <g key={i}>
                    <circle cx={x} cy={31 + i * 62} r="10" fill={t.spectrum[i]} opacity=".2" />
                    <circle cx={x} cy={31 + i * 62} r="3.6" fill={t.spectrum[i]} />
                  </g>
                ))}
              </svg>
              {personal.interests.map((txt) => (
                <p key={txt} className="flex h-[62px] items-center pl-[68px] text-[14px] leading-snug" style={{ color: t.ink2 }}>
                  {txt}
                </p>
              ))}
            </div>
          </Card>
          <Card t={t} className="px-5 py-2">
            {personal.about.facts.map((f, i) => (
              <div key={f.label} className="flex items-baseline justify-between gap-4 py-3" style={{ borderTop: i ? `1px solid ${t.rule}` : undefined }}>
                <span className={mono} style={{ color: t.ink3 }}>
                  {f.label}
                </span>
                <span className="text-right text-[14px]" style={{ color: t.ink }}>
                  <T s={f.value} t={t} />
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Achievements ---------------- */
const LEVELS = { professional: 3, associate: 2, foundational: 1 } as const;
const MEDAL = { gold: '#fbbf24', silver: '#c8cbd8', bronze: '#d08a52' } as const;

function Column({ t, label, count, children }: { t: Tokens; label: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <p className={`mb-4 flex items-center justify-between ${mono}`} style={{ color: t.ink3 }}>
        {label} <span>{count}</span>
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

export function AchievementsSheet({ t }: { t: Tokens }) {
  return (
    <Shell t={t} id="achievements" seed={47}>
      <Header t={t} n="05" label="Achievements" title="Achievements" aside="Honours, certifications, competitions" />
      <div className="grid grid-cols-3 gap-6">
        <Column t={t} label="Honours" count={honors.length}>
          {honors.map((h) => (
            <Card key={h.id} t={t} tone={t.rose} className="p-5">
              <p className="flex items-center gap-2 font-display text-[19px] font-bold tracking-[-0.02em]">
                <Star color={t.rose} size={12} /> <T s={h.title} t={t} />
              </p>
              <p className="mt-1 text-[14px]" style={{ color: t.ink2 }}>
                {h.org}
              </p>
              <p className="mt-3 font-mono text-[12px]" style={{ color: t.ink3 }}>
                <T s={h.when} t={t} />
              </p>
            </Card>
          ))}
        </Column>
        <Column t={t} label="Certifications" count={certifications.length}>
          {certifications.map((c) => (
            <Card key={c.id} t={t} tone={t.kind.systems} className="p-5">
              <p className="font-display text-[17px] font-bold leading-snug tracking-[-0.02em]">
                <T s={c.name} t={t} />
              </p>
              <p className="mt-1 text-[14px]" style={{ color: t.ink2 }}>
                {c.issuer}
              </p>
              <div className="mt-3 flex items-center justify-between font-mono text-[12px]" style={{ color: t.ink3 }}>
                <span className="flex items-center gap-1.5" title={c.level}>
                  {[1, 2, 3].map((k) => (
                    <span key={k} style={{ opacity: k <= LEVELS[c.level] ? 1 : 0.25 }}>
                      <Star color={t.kind.systems} size={10} />
                    </span>
                  ))}
                  <span className="ml-1 capitalize">{c.level}</span>
                </span>
                <span>
                  <T s={c.issued} t={t} />
                </span>
              </div>
            </Card>
          ))}
        </Column>
        <Column t={t} label="Competitions" count={competitions.length}>
          {competitions.map((c) => (
            <Card key={c.id} t={t} tone={c.medal ? MEDAL[c.medal] : t.ink3} className="p-5">
              <p className="font-display text-[17px] font-bold tracking-[-0.02em]">
                <T s={c.event} t={t} />
              </p>
              <p className="mt-1 flex items-center gap-2 text-[14px]" style={{ color: t.ink2 }}>
                {c.medal && <Star color={t.name === 'dark' ? MEDAL[c.medal] : t.route} size={11} />}
                <T s={c.result} t={t} />
              </p>
              <p className="mt-3 font-mono text-[12px]" style={{ color: t.ink3 }}>
                <T s={c.when} t={t} />
              </p>
            </Card>
          ))}
        </Column>
      </div>
      <div className="mt-10">
        <p className={`mb-4 ${mono}`} style={{ color: t.ink3 }}>
          Badges · {badges.length}
        </p>
        <div className="flex flex-wrap gap-2.5">
          {badges.map((b) => (
            <span key={b.id} className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px]" style={{ background: t.card, borderColor: t.cardBorder, color: t.ink2 }}>
              <Star color={t.spectrum[b.label.length % 5]} size={10} />
              <T s={b.label} t={t} />
            </span>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Focus areas ---------------- */
function EvidenceFigure({ t, slugs, w = 96, h = 56 }: { t: Tokens; slugs: string[]; w?: number; h?: number }) {
  const pts = slugs.map((s, i) => {
    const seed = [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
    return [Math.round(12 + ((i + 0.5) / slugs.length) * (w - 24)), Math.round(10 + (seed % (h - 20)))] as [number, number];
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={t.constellation} />
      {pts.map(([x, y], i) => (
        <g key={slugs[i]}>
          <circle cx={x} cy={y} r="7" fill={kindColor(t, slugs[i])} opacity=".2" />
          <circle cx={x} cy={y} r="3" fill={kindColor(t, slugs[i])} />
        </g>
      ))}
    </svg>
  );
}

function FocusCard({ t, f, lead = false }: { t: Tokens; f: (typeof focusAreas)[number]; lead?: boolean }) {
  return (
    <Card t={t} className={lead ? 'p-7' : 'p-6'}>
      <div className="flex items-start justify-between gap-4">
        <h3 className={`font-display font-bold tracking-[-0.025em] ${lead ? 'text-[30px]' : 'text-[21px]'}`}>{f.title}</h3>
        <EvidenceFigure t={t} slugs={f.evidence} w={lead ? 140 : 88} h={lead ? 64 : 48} />
      </div>
      <ul className={`mt-4 grid gap-x-8 gap-y-2 text-[14px] ${lead ? 'grid-cols-2' : ''}`} style={{ color: t.ink2 }}>
        {f.points.map((p) => (
          <li key={p} className="flex items-start gap-2.5">
            <span className="mt-[7px] h-[3px] w-[3px] shrink-0 rounded-full" style={{ background: t.ink3 }} />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-4" style={{ borderColor: t.rule }}>
        <span className={`${mono} mr-1`} style={{ color: t.ink3 }}>
          Backed by
        </span>
        {f.evidence.map((s) => (
          <span key={s} className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]" style={{ borderColor: t.cardBorder, color: t.ink }}>
            <Star color={kindColor(t, s)} size={9} />
            {evidenceName(s)}
          </span>
        ))}
      </div>
    </Card>
  );
}

export function FocusSheet({ t }: { t: Tokens }) {
  const [lead, ...rest] = focusAreas;
  return (
    <Shell t={t} id="focus" seed={53}>
      <Header t={t} n="06" label="Focus areas" title="Focus" accent="areas" aside="Each star is a piece of work that backs it" />
      <FocusCard t={t} f={lead} lead />
      <div className="mt-5 grid grid-cols-3 gap-5">
        {rest.map((f) => (
          <FocusCard key={f.key} t={t} f={f} />
        ))}
      </div>
    </Shell>
  );
}

/* ---------------- Stats ---------------- */
function Motif({ m, c, t }: { m: Stat['motif']; c: string; t: Tokens }) {
  const w = 132;
  const h = 40;
  const dim = t.rule;
  switch (m) {
    case 'rise':
      return (
        <svg width={w} height={h} aria-hidden>
          <path d={`M2 ${h - 4} H${w - 2}`} stroke={dim} />
          <path d={`M2 ${h - 6} C40 ${h - 8} 80 ${h - 14} ${w - 8} 6`} fill="none" stroke={c} strokeWidth="1.6" />
          <circle cx={w - 8} cy={6} r="3" fill={c} />
        </svg>
      );
    case 'ticks':
      return (
        <svg width={w} height={h} aria-hidden>
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={2 + i * 4.3} y={i >= 28 ? 16 : 8} width="2" height={i >= 28 ? 16 : 24} rx="1" fill={i >= 28 ? dim : c} />
          ))}
        </svg>
      );
    case 'ring': {
      const r = 15;
      const C = 2 * Math.PI * r;
      return (
        <svg width={w} height={h} aria-hidden>
          <circle cx="20" cy="20" r={r} fill="none" stroke={dim} strokeWidth="3" />
          <circle cx="20" cy="20" r={r} fill="none" stroke={c} strokeWidth="3" strokeDasharray={`${(C * 0.964).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 20 20)" strokeLinecap="round" />
        </svg>
      );
    }
    case 'spark':
      return (
        <svg width={w} height={h} aria-hidden>
          <path d={`M2 ${h - 4} H${w - 2}`} stroke={dim} />
          <polyline points="2,26 18,22 32,28 48,16 62,20 78,12 94,18 110,8 128,10" fill="none" stroke={c} strokeWidth="1.6" />
        </svg>
      );
    default:
      return null;
  }
}

export function StatsSheet({ t }: { t: Tokens }) {
  const [hi, ...more] = statGroups;
  const hiColors = [t.kind.systems, t.kind.ai, t.kind.data, t.kind.software];
  return (
    <Shell t={t} id="stats" seed={61}>
      <Header t={t} n="07" label="Stats" title="By the" accent="numbers" aside="Every number with its conditions" />
      <p className={`mb-4 ${mono}`} style={{ color: t.ink3 }}>
        {hi.label}
      </p>
      <div className="grid grid-cols-4 gap-5">
        {hi.stats.map((s, i) => (
          <Card key={s.label} t={t} tone={hiColors[i]} className="p-6">
            <Motif m={s.motif} c={hiColors[i]} t={t} />
            <p className="mt-5 font-display text-[54px] font-bold leading-none tracking-[-0.04em]">{s.value}</p>
            <p className="mt-3 text-[15px] font-semibold">{s.label}</p>
            <p className="mt-1.5 text-[13px] leading-snug" style={{ color: t.ink3 }}>
              {s.note}
            </p>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-5">
        {more.map((g) => (
          <Card key={g.label} t={t} className="px-6 pb-2 pt-5">
            <p className={mono} style={{ color: t.ink3 }}>
              {g.label}
            </p>
            {g.stats.map((s, i) => (
              <div key={s.label} className="grid grid-cols-[110px_1fr] items-baseline gap-4 py-3.5" style={{ borderTop: i ? `1px solid ${t.rule}` : undefined }}>
                <span className="font-display text-[30px] font-bold leading-none tracking-[-0.03em]">{s.value}</span>
                <span>
                  <span className="text-[14px] font-semibold">{s.label}</span>
                  <span className="ml-2 text-[13px]" style={{ color: t.ink3 }}>
                    {s.note}
                  </span>
                </span>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </Shell>
  );
}
