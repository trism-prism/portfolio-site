'use client';

import { useEffect, useMemo, useState } from 'react';
import { liveContributions, statGroups, type Stat } from '@/data/stats';
import { personal } from '@/data/personal';
import { currentStreak, fetchContributions, longestStreak, placeholderYear, type Day } from '@/lib/calendar';
import { useSeenOnce } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PhRibbon } from '@/components/ui/Text';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';

/** Counts the numeric part of a figure up once on reveal; keeps prefixes/suffixes like "~", "x", "%". */
function CountUp({ value }: { value: string }) {
  const { reduced } = useMotion();
  const [ref, seen] = useSeenOnce<HTMLSpanElement>();
  const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, '')) : NaN;
  const decimals = m && m[2].includes('.') ? m[2].split('.')[1].length : 0;
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen || reduced || Number.isNaN(target)) return;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, target]);
  if (!m || Number.isNaN(target)) return <span>{value}</span>;
  const shown = reduced || !seen ? (seen || reduced ? target : 0) : v;
  const fmt = shown.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} aria-label={value}>
      <span aria-hidden="true">
        {m[1]}
        {m[2].includes(',') ? fmt : fmt.replace(/,/g, '')}
        {m[3]}
      </span>
    </span>
  );
}

// Hairline charts for the four highlight cards (132 x 40). Computed coordinates are rounded to avoid hydration drift.
const W = 132;
const H = 40;
const r1 = (n: number) => Math.round(n * 10) / 10;
const dim = 'var(--line-2)';

function Motif({ kind, color }: { kind: Stat['motif']; color: string }) {
  switch (kind) {
    case 'rise':
      return (
        <svg width={W} height={H} aria-hidden="true">
          <path d={`M2 ${H - 4} H${W - 2}`} stroke={dim} fill="none" />
          <path d={`M2 ${H - 6} C40 ${H - 8} 80 ${H - 14} ${W - 8} 6`} fill="none" stroke={color} strokeWidth="1.6" />
          <circle cx={W - 8} cy={6} r="3" fill={color} />
        </svg>
      );
    case 'ticks':
      return (
        <svg width={W} height={H} aria-hidden="true">
          {Array.from({ length: 30 }, (_, i) => (
            <rect key={i} x={r1(2 + i * 4.3)} y={i >= 28 ? 16 : 8} width="2" height={i >= 28 ? 16 : 24} rx="1" fill={i >= 28 ? dim : color} />
          ))}
        </svg>
      );
    case 'ring': {
      const r = 15;
      const C = 2 * Math.PI * r;
      return (
        <svg width={W} height={H} aria-hidden="true">
          <circle cx="20" cy="20" r={r} fill="none" stroke={dim} strokeWidth="3" />
          <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${r1(C * 0.964)} ${r1(C)}`} transform="rotate(-90 20 20)" strokeLinecap="round" />
        </svg>
      );
    }
    case 'spark':
      return (
        <svg width={W} height={H} aria-hidden="true">
          <path d={`M2 ${H - 4} H${W - 2}`} stroke={dim} fill="none" />
          <polyline points="2,26 18,22 32,28 48,16 62,20 78,12 94,18 110,8 128,10" fill="none" stroke={color} strokeWidth="1.6" />
        </svg>
      );
    default:
      return null;
  }
}

// Highlight cards take these colours in order: systems, ai, data, software.
const highlightColors = ['var(--kind-systems)', 'var(--kind-ai)', 'var(--kind-data)', 'var(--kind-software)'];
const tone = (c: string) => ({ '--tone': c }) as React.CSSProperties;

export function Stats() {
  const [highlights, ...lists] = statGroups;
  return (
    <section id="stats" className="section" aria-labelledby="stats-title">
      <div className="wrap">
        <SectionHeader id="stats" />
        <h3 className="label mb-4 tracking-[.18em]">{highlights.label}</h3>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {highlights.stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 0.06} className="h-full">
              <div className={`panel h-full p-6 ${s.placeholder ? 'ph-card' : ''}`} data-tone style={tone(highlightColors[i])}>
                <Motif kind={s.motif} color={highlightColors[i]} />
                <p className="display mt-5 text-[54px] leading-none tracking-[-0.04em] text-fg">
                  <CountUp value={s.value} />
                </p>
                <p className="mt-3 text-[15px] font-semibold text-fg">{s.label}</p>
                <p className="mt-1.5 text-[13px] leading-snug text-muted">{s.note}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {lists.map((g, gi) => (
            <Reveal key={g.label} delay={gi * 0.06} className="h-full">
              <div className="panel h-full px-6 pb-2 pt-5">
                <h3 className="label tracking-[.18em]">{g.label}</h3>
                <ul>
                  {g.stats.map((s, i) => (
                    <li key={s.label} className={`grid grid-cols-[110px_1fr] items-baseline gap-4 py-3.5 ${i ? 'border-t border-line' : ''} ${s.placeholder ? 'ph-card' : ''}`}>
                      <span className="display text-[30px] leading-none tracking-[-0.03em] text-fg">
                        <CountUp value={s.value} />
                      </span>
                      <span>
                        <span className="text-[14px] font-semibold text-fg">{s.label}</span>
                        <span className="ml-2 text-[13px] text-muted">{s.note}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Heatmap />
      </div>
    </section>
  );
}

// Each day is a small star: a 3px dot whose opacity follows its level, in the foreground colour.
const levelOpacity = [0.08, 0.3, 0.5, 0.75, 1];

/** GitHub contribution calendar. Live fetch is opt-in (see data/stats.ts); otherwise a labelled placeholder. */
function Heatmap() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [state, setState] = useState<'placeholder' | 'loading' | 'live' | 'error'>(liveContributions ? 'loading' : 'placeholder');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!liveContributions) {
      setDays(placeholderYear());
      return;
    }
    const ctl = new AbortController();
    const timer = window.setTimeout(() => ctl.abort(), 10_000);
    setState('loading');
    fetchContributions(personal.links.githubUser, ctl.signal)
      .then((d) => {
        setDays(d);
        setState('live');
      })
      .catch(() => setState('error'))
      .finally(() => clearTimeout(timer));
    return () => {
      ctl.abort();
      clearTimeout(timer);
    };
  }, [attempt]);

  const weeks = useMemo(() => {
    if (!days?.length) return [];
    const first = new Date(days[0].date + 'T00:00:00Z').getUTCDay();
    const padded: (Day | null)[] = [...Array(first).fill(null), ...days];
    const out: (Day | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) out.push(padded.slice(i, i + 7));
    return out;
  }, [days]);
  const total = days?.reduce((a, d) => a + d.count, 0) ?? 0;

  return (
    <div className={`panel relative mt-6 p-5 md:p-6 ${state === 'placeholder' ? 'ph-card' : ''}`}>
      {state === 'placeholder' && <PhRibbon label="Placeholder data" />}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 pr-28">
        <h3 className="label tracking-[.18em]">Contributions</h3>
        {days && (
          <p className="mono text-[12px] text-muted">
            {total.toLocaleString('en-US')} in the last year · current streak {currentStreak(days)} · longest {longestStreak(days)}
          </p>
        )}
      </div>
      {state === 'error' && (
        <p className="flex items-center gap-2 text-[14px] text-amber">
          <Icon name="warning" size={16} /> Contribution data is unavailable right now.
          <button type="button" className="link-u" onClick={() => setAttempt((a) => a + 1)}>
            Retry
          </button>
        </p>
      )}
      {state === 'loading' && <p className="mono text-[13px] text-muted">Loading…</p>}
      {weeks.length > 0 && (
        <div className="overflow-x-auto pb-1" data-lenis-prevent>
          <div className="flex" role="img" aria-label={`${state === 'placeholder' ? 'Placeholder ' : ''}contribution calendar for the last year`}>
            {weeks.map((w, i) => (
              <div key={i} className="grid grid-rows-7">
                {w.map((d, j) => {
                  const today = d !== null && d === days?.[days.length - 1];
                  return (
                    <span key={j} title={d ? `${d.count} contributions on ${d.date}` : undefined} className="relative grid h-4 w-4 place-items-center">
                      {d && <span className="h-[3px] w-[3px] rounded-full bg-fg" style={{ opacity: levelOpacity[d.level] }} />}
                      {today && <span className="absolute h-[11px] w-[11px] rounded-full border border-route" aria-hidden="true" />}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mono mt-3 flex items-center gap-1.5 text-[11px] text-muted">
        Less {levelOpacity.map((o) => <span key={o} className="h-[3px] w-[3px] rounded-full bg-fg" style={{ opacity: o }} />)} More
        <span className="ml-auto">{state === 'placeholder' ? 'Seeded sample, not real activity' : `github.com/${personal.links.githubUser}`}</span>
      </p>
    </div>
  );
}
