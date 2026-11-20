'use client';

import { useEffect, useMemo, useState } from 'react';
import { codingProfiles, liveContributions, statGroups, type Stat } from '@/data/stats';
import { personal } from '@/data/personal';
import { plain } from '@/data/ph';
import { currentStreak, fetchContributions, longestStreak, placeholderYear, type Day } from '@/lib/calendar';
import { useSeenOnce } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text, PhRibbon, safeHref } from '@/components/ui/Text';
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

function Motif({ kind }: { kind: Stat['motif'] }) {
  const c = 'var(--accent)';
  const shapes: Record<Stat['motif'], React.ReactNode> = {
    bars: [4, 8, 6, 11, 9].map((h, i) => <rect key={i} x={i * 7} y={14 - h} width="4" height={h} rx="1" fill={c} />),
    dots: Array.from({ length: 7 }, (_, i) => <circle key={i} cx={3 + i * 7} cy="8" r="2.2" fill={c} />),
    spark: <path d="M0 12 L8 9 L14 11 L22 5 L30 7 L38 2 L46 4" stroke={c} fill="none" strokeWidth="1.6" />,
    grid: Array.from({ length: 12 }, (_, i) => <rect key={i} x={(i % 6) * 7} y={Math.floor(i / 6) * 7 + 1} width="5" height="5" rx="1" fill={c} opacity={i % 5 ? 1 : 0.4} />),
    nodes: (
      <>
        <path d="M3 8 L18 3 L33 10 L46 5" stroke={c} fill="none" />
        {[[3, 8], [18, 3], [33, 10], [46, 5]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2.4" fill={c} />)}
      </>
    ),
    rise: <path d="M0 14 Q20 13 30 8 T46 1" stroke={c} fill="none" strokeWidth="1.6" />,
    ticks: Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${i * 8 + 1} 8 l2 2 l4 -5`} stroke={i === 4 ? 'var(--amber)' : c} fill="none" strokeWidth="1.5" />),
    ring: (
      <>
        <circle cx="8" cy="8" r="6" stroke="var(--line-2)" strokeWidth="2.4" fill="none" />
        <circle cx="8" cy="8" r="6" stroke={c} strokeWidth="2.4" fill="none" strokeDasharray="36.3 37.7" transform="rotate(-90 8 8)" />
      </>
    ),
  };
  return (
    <svg width="48" height="16" viewBox="0 0 48 16" aria-hidden="true">
      {shapes[kind]}
    </svg>
  );
}

export function Stats() {
  return (
    <section id="stats" className="section" aria-labelledby="stats-title">
      <div className="wrap">
        <SectionHeader id="stats" />
        {statGroups.map((g) => (
          <div key={g.label} className="mb-10">
            <h3 className="label mb-4 flex items-center gap-3">
              {g.label} <span className="h-px flex-1 border-t border-dashed border-line-2" />
            </h3>
            <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {g.stats.map((s) => (
                <li key={s.label} className={`panel glow-card relative p-4 md:p-5 ${s.placeholder ? 'ph-card' : ''}`}>
                  <Motif kind={s.motif} />
                  <p className="display mt-3 text-[30px] text-accent-soft md:text-[34px]">
                    <CountUp value={s.value} />
                  </p>
                  <p className="mono mt-1 text-[11px] font-bold uppercase tracking-[.12em] text-fg">{s.label}</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-fg-2">{s.note}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <h3 className="label mb-4 flex items-center gap-3">
          Coding profiles <span className="h-px flex-1 border-t border-dashed border-line-2" />
        </h3>
        <ul className="grid gap-4 md:grid-cols-2">
          {codingProfiles.map((p) => {
            const total = p.breakdown?.reduce((a, b) => a + b.value, 0) ?? 0;
            const href = safeHref(p.href);
            return (
              <li key={p.id} className={`panel relative p-5 ${p.placeholder ? 'ph-card' : ''}`}>
                {p.placeholder && <PhRibbon />}
                <div className="flex items-center gap-3">
                  <span className="mono grid h-10 w-10 place-items-center rounded-xl bg-panel-2 text-[13px] font-bold text-amber">{p.platform.slice(0, 2)}</span>
                  <div>
                    <p className="font-semibold text-fg">{p.platform}</p>
                    <p className="mono text-[12px] text-muted">@{plain(p.handle)}</p>
                  </div>
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="icon-btn ml-auto h-9 w-9">
                      <Icon name="arrowUpRight" size={15} />
                    </a>
                  )}
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2">
                  {p.figures.map((f) => (
                    <div key={f.label} className="rounded-lg border border-line p-2.5">
                      <dt className="label !text-[9.5px]">{f.label}</dt>
                      <dd className="display mt-1 text-[20px] text-fg">
                        <Text v={f.value} badge={false} />
                      </dd>
                    </div>
                  ))}
                </dl>
                {p.breakdown && (
                  <div className="mt-4">
                    <div className="flex h-2 overflow-hidden rounded-full bg-panel-2">
                      {p.breakdown.map((b) => (
                        <span key={b.label} style={{ width: `${(b.value / total) * 100}%`, background: `var(--${b.tone})` }} />
                      ))}
                    </div>
                    <p className="mono mt-2 flex gap-4 text-[11.5px] text-muted">
                      {p.breakdown.map((b) => (
                        <span key={b.label}>
                          {b.label} {b.value}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <Heatmap />
      </div>
    </section>
  );
}

const levelColor = ['var(--panel-2)', 'color-mix(in srgb, var(--accent) 30%, var(--panel-2))', 'color-mix(in srgb, var(--accent) 55%, var(--panel-2))', 'color-mix(in srgb, var(--accent) 80%, var(--panel-2))', 'var(--accent-soft)'];

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
    <div className={`panel relative mt-10 p-5 md:p-6 ${state === 'placeholder' ? 'ph-card' : ''}`}>
      {state === 'placeholder' && <PhRibbon label="Placeholder data" />}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 pr-28">
        <h3 className="font-semibold text-fg">GitHub contributions</h3>
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
          <div className="flex gap-[3px]" role="img" aria-label={`${state === 'placeholder' ? 'Placeholder ' : ''}contribution calendar for the last year`}>
            {weeks.map((w, i) => (
              <div key={i} className="grid grid-rows-7 gap-[3px]">
                {w.map((d, j) => (
                  <span
                    key={j}
                    title={d ? `${d.count} contributions on ${d.date}` : undefined}
                    className="h-[11px] w-[11px] rounded-[3px]"
                    style={{ background: d ? levelColor[d.level] : 'transparent' }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="mono mt-3 flex items-center gap-1.5 text-[11px] text-muted">
        Less {levelColor.map((c) => <span key={c} className="h-[10px] w-[10px] rounded-[3px]" style={{ background: c }} />)} More
        <span className="ml-auto">{state === 'placeholder' ? 'Seeded sample, not real activity' : `github.com/${personal.links.githubUser}`}</span>
      </p>
    </div>
  );
}
