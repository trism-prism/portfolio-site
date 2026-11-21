'use client';

import { useMemo, useRef, useState } from 'react';
import { news, newsTypeLabels, type NewsType } from '@/data/news';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text, PhRibbon } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { HEADER_OFFSET } from '@/lib/nav';

const typeColor: Record<NewsType, string> = {
  launch: 'var(--accent)',
  release: 'var(--sky)',
  work: 'var(--violet)',
  education: 'var(--amber)',
  award: 'var(--gold)',
  'open-source': 'var(--green)',
  study: 'var(--coral)',
};
const INITIAL = 6;
const fmt = (iso: string) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

export function News() {
  const [type, setType] = useState<NewsType | 'all'>('all');
  const [expanded, setExpanded] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const sorted = useMemo(() => [...news].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id.localeCompare(b.id))), []);
  const filtered = type === 'all' ? sorted : sorted.filter((n) => n.type === type);
  const shown = expanded ? filtered : filtered.slice(0, INITIAL);
  const counts = useMemo(() => {
    const c = {} as Record<NewsType, number>;
    for (const n of news) c[n.type] = (c[n.type] ?? 0) + 1;
    return c;
  }, []);
  const years = [...new Set(shown.map((n) => n.date.slice(0, 4)))];

  // Keep the clicked control in place when the list collapses.
  const keepAnchor = (fn: () => void) => {
    const before = anchor.current?.getBoundingClientRect().top ?? 0;
    fn();
    requestAnimationFrame(() => {
      const after = anchor.current?.getBoundingClientRect().top ?? 0;
      if (Math.abs(after - before) > 2) window.scrollBy({ top: after - before });
      if ((anchor.current?.getBoundingClientRect().top ?? 0) < HEADER_OFFSET) anchor.current?.scrollIntoView({ block: 'center' });
    });
  };

  return (
    <section id="news" className="section" aria-labelledby="news-title">
      <div className="wrap wrap-narrow">
        <SectionHeader id="news" />
        <div role="group" aria-label="Filter activity" className="mb-8 flex flex-wrap gap-2" data-annotate="news">
          {(['all', ...(Object.keys(newsTypeLabels) as NewsType[])] as const).map((k) =>
            k !== 'all' && !counts[k] ? null : (
              <button
                key={k}
                type="button"
                aria-pressed={type === k}
                onClick={() => keepAnchor(() => {
                  setType(k);
                  setExpanded(false);
                })}
                className={`mono flex h-9 items-center gap-2 rounded-lg border px-3 text-[12.5px] ${type === k ? 'border-transparent bg-panel-2 text-fg' : 'border-line-2 text-fg-2 hover:text-fg'}`}
              >
                {k !== 'all' && <span className="h-2 w-2 rounded-full" style={{ background: typeColor[k] }} />}
                {k === 'all' ? 'All' : newsTypeLabels[k]}
                <span className="text-muted">{k === 'all' ? news.length : counts[k]}</span>
              </button>
            ),
          )}
        </div>
        <div className="relative">
          <span className="absolute bottom-0 left-[7px] top-0 w-px bg-line-2" aria-hidden="true" />
          {years.map((y) => (
            <div key={y} className="mb-6">
              <h3 className="mono relative mb-3 pl-8 text-[13px] font-bold text-fg">
                <span className="absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-line-2 bg-bg" aria-hidden="true" />
                {y}
              </h3>
              <ol className="grid gap-2">
                {shown
                  .filter((n) => n.date.startsWith(y))
                  .map((n, i) => (
                    <li key={n.id} className="news-row relative pl-8" style={{ animationDelay: `${Math.min(0.18, i * 0.03)}s` }}>
                      <span className="news-node absolute left-[3px] top-[18px] h-[9px] w-[9px] rounded-full" style={{ background: typeColor[n.type], animationDelay: `${Math.min(0.5, i * 0.06)}s` }} aria-hidden="true" />
                      <article className={`panel relative flex flex-wrap items-start gap-x-4 gap-y-1 p-3.5 md:p-4 ${n.placeholder ? 'ph-card' : ''}`}>
                        {n.placeholder && <PhRibbon />}
                        <span className="mono text-[12px] text-muted">{fmt(n.date)}</span>
                        <span className="mono rounded px-1.5 text-[11px]" style={{ color: typeColor[n.type], background: 'var(--panel-2)' }}>
                          {newsTypeLabels[n.type]}
                        </span>
                        <div className="w-full">
                          <p className="font-medium text-fg">
                            {n.href ? (
                              <a href={n.href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                                <Text v={n.title} badge={false} /> <Icon name="arrowUpRight" size={13} className="inline" />
                              </a>
                            ) : (
                              <Text v={n.title} badge={false} />
                            )}
                          </p>
                          <p className="text-[14px] text-fg-2">
                            <Text v={n.detail} badge={false} />
                          </p>
                        </div>
                      </article>
                    </li>
                  ))}
              </ol>
            </div>
          ))}
        </div>
        <div ref={anchor} className="pl-8">
          {filtered.length > INITIAL && (
            <button type="button" className="btn h-10 min-h-0 text-sm" aria-expanded={expanded} onClick={() => keepAnchor(() => setExpanded((e) => !e))}>
              {expanded ? 'Show less' : `Show all ${filtered.length}`}
              <Icon name="chevronDown" size={15} className={expanded ? 'rotate-180' : ''} />
            </button>
          )}
        </div>
      </div>
      <style>{`
        .news-row { animation: news-in .18s ease-out both; }
        .news-node { animation: fade-in .3s both; }
        @keyframes news-in { from { opacity: 0; transform: translateY(6px); } }
        [data-motion='reduced'] .news-row, [data-motion='reduced'] .news-node { animation: none; }
      `}</style>
    </section>
  );
}
