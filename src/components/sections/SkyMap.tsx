'use client';

// The Projects sky map: one small constellation per project kind, generated from the data (see skyLayout.ts).
// The legend is the filter: each kind is a real <button> overlay on its column, sharing one `filter` state with
// the chips. Stars are for pointer users (hover label, click opens the details) and are aria-hidden, because
// keyboard and screen-reader users reach every project through the cards.
//
// Like MothConstellation, the markup is always the finished frame. When the map first scrolls into view the
// lines draw once, group by group (see .sky-play in globals.css); in Reduced motion nothing animates.

import { useMemo } from 'react';
import { kindLabels, projects } from '@/data/projects';
import { matches, type Filter } from '@/lib/search';
import { useMedia, useSeenOnce } from '@/lib/hooks';
import { layoutSkyMap, type SkyGroup } from './skyLayout';

const GROUP_STEP = 0.11; // seconds between one kind's line starting and the next
const LINE_DUR = 0.4;

const bySlug = new Map(projects.map((p) => [p.slug, p]));
const pct = (n: number, of: number) => `${Math.round((n / of) * 10000) / 100}%`;
const d = (s: number) => ({ ['--d' as string]: `${Math.round(s * 100) / 100}s` }) as React.CSSProperties;

export function SkyMap({ filter, onFilter, query, onOpen }: { filter: Filter; onFilter: (f: Filter) => void; query: string; onOpen: (slug: string) => void }) {
  const wide = useMedia('(min-width: 768px)', true);
  const layout = useMemo(() => layoutSkyMap(projects, wide ? 4 : 2), [wide]);
  const { width: W, height: H } = layout;

  const [ref, seen] = useSeenOnce<HTMLDivElement>();
  // False on the server and during hydration, true afterwards: the finished frame is what the server sends, and
  // only after hydration does an unseen map hold its lines back, ready to draw when it first comes into view.
  const armed = useMedia('(min-width: 0px)', false);
  const state = !armed ? '' : seen ? 'sky-play' : 'sky-hold';

  const searching = query.trim().length > 0;
  const starOpacity = (slug: string) => {
    const p = bySlug.get(slug)!;
    return Math.min(filter === 'featured' && !p.featured ? 0.4 : 1, searching && !matches(p, query) ? 0.2 : 1);
  };
  const groupOpacity = (g: SkyGroup) => (filter !== 'all' && filter !== 'featured' && filter !== g.kind ? 0.3 : 1);

  return (
    <div ref={ref} className={`panel sky-map relative mb-4 ${state}`} style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        {layout.groups.map((g, gi) => {
          const color = `var(--kind-${g.kind})`;
          const t0 = gi * GROUP_STEP;
          return (
            <g key={g.kind} className="sky-dim" style={{ opacity: groupOpacity(g) }}>
              {g.line && <polyline className="sky-line" points={g.line} pathLength={1} fill="none" strokeOpacity={0.5} style={{ stroke: color, ...d(t0) }} />}
              {g.stars.map((s, i) => (
                <g key={s.slug} className="sky-dim" style={{ opacity: starOpacity(s.slug) }}>
                  <g className="sky-star" style={d(t0 + (g.stars.length > 1 ? (i / (g.stars.length - 1)) * LINE_DUR * 0.85 : 0))}>
                    {s.spotlight && <circle cx={s.x} cy={s.y} r={15} fill="none" strokeDasharray="2 3" strokeOpacity={0.45} style={{ stroke: color }} />}
                    <circle cx={s.x} cy={s.y} r={s.featured ? 11 : 6} opacity={0.2} style={{ fill: color }} />
                    <circle cx={s.x} cy={s.y} r={s.featured ? 4 : 2.6} style={{ fill: color }} />
                  </g>
                </g>
              ))}
            </g>
          );
        })}
      </svg>

      {layout.groups.map((g) => {
        const active = filter === g.kind;
        return (
          <button
            key={g.kind}
            type="button"
            aria-pressed={active}
            aria-label={`${kindLabels[g.kind]}, ${g.count} ${g.count === 1 ? 'project' : 'projects'}`}
            onClick={() => onFilter(active ? 'all' : g.kind)}
            className="sky-btn absolute rounded-2xl"
            style={{ left: pct(g.cell.x, W), top: pct(g.cell.y, H), width: pct(g.cell.w, W), height: pct(g.cell.h, H) }}
          >
            <span
              aria-hidden="true"
              className="sky-label pointer-events-none absolute left-1/2 whitespace-nowrap text-[19px] italic leading-none"
              style={{ top: pct(g.label.y - g.cell.y, g.cell.h), fontFamily: 'var(--font-serif)', color: `var(--kind-${g.kind})` }}
            >
              {kindLabels[g.kind]}
            </span>
          </button>
        );
      })}

      {layout.groups.map((g) =>
        g.stars.map((s) => {
          const p = bySlug.get(s.slug)!;
          const fx = (s.x - g.cell.x) / g.cell.w;
          const below = s.y - g.cell.y < 72;
          const side = fx < 0.2 ? 'sky-tip-start' : fx > 0.8 ? 'sky-tip-end' : '';
          return (
            <div
              key={s.slug}
              aria-hidden="true"
              className="sky-hit absolute z-10"
              style={{ left: pct(s.x, W), top: pct(s.y, H) }}
              onClick={() => onOpen(s.slug)}
            >
              <span className={`sky-tip ${below ? 'sky-tip-below' : 'sky-tip-above'} ${side}`}>
                <span className="block text-[13px] leading-tight text-fg">{p.title}</span>
                <span className="mono mt-0.5 block text-[11px] leading-tight text-muted">{p.period}</span>
              </span>
            </div>
          );
        }),
      )}
    </div>
  );
}
