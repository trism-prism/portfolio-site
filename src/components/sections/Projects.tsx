'use client';

import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { contributions, kindLabels, projects, type Project } from '@/data/projects';
import { counts, filterProjects, filters, type Filter } from '@/lib/search';
import { goTo, onUi } from '@/lib/nav';
import { ph } from '@/data/ph';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@/components/ui/Icon';
import { StarGlyph } from '@/components/ui/StarGlyph';
import { Text, PhRibbon, safeHref } from '@/components/ui/Text';
import { GlossText } from '@/components/ui/Gloss';
import { Modal } from '@/components/ui/Modal';
import { SkyMap } from './SkyMap';
import { SceneHost } from '@/components/scenes/Stage';
import { covers } from '@/components/scenes/covers/registry';
import { DocsQaTerminal, HeartThreshold, VisibilityDemo } from '@/components/scenes/demos/Demos';

const kindColor = (k: string) => `var(--kind-${k})`;
const demos = { visibility: VisibilityDemo, docsqa: DocsQaTerminal, heart: HeartThreshold };
const statusLabel = { live: 'Live', complete: 'Complete', 'in-progress': 'In progress' };

function trackPointer(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function setProjectQuery(slug: string | null) {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set('project', slug);
  else url.searchParams.delete('project');
  url.hash = 'projects';
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

export function Projects() {
  const [filter, setFilter] = useState<Filter>('featured');
  const [query, setQuery] = useState('');
  const q = useDeferredValue(query);
  const [open, setOpen] = useState<Project | null>(null);

  const list = useMemo(() => filterProjects(projects, filter, q), [filter, q]);
  const n = useMemo(() => counts(projects, q), [q]);

  const openSlug = useCallback((slug: string) => {
    const p = projects.find((x) => x.slug === slug);
    if (!p) return false;
    setOpen(p);
    setProjectQuery(slug);
    return true;
  }, []);
  const close = useCallback(() => {
    setOpen(null);
    setProjectQuery(null);
  }, []);

  // Deep links: ?project=<slug>#projects. Invalid slugs are removed.
  useEffect(() => {
    const slug = new URLSearchParams(location.search).get('project');
    if (slug) {
      if (openSlug(slug)) requestAnimationFrame(() => goTo('projects', { push: false, focus: false, immediate: true }));
      else setProjectQuery(null);
    }
    return onUi((e) => {
      if (e.type === 'project') {
        goTo('projects', { push: true, focus: false });
        window.setTimeout(() => openSlug(e.slug), 350);
      }
    });
  }, [openSlug]);

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHeader id="projects" />
        <SkyMap filter={filter} onFilter={setFilter} query={q} onOpen={(slug) => void openSlug(slug)} />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
            {filters.map((f) => {
              if (n[f.id] === 0 && filter !== f.id) return null;
              const on = filter === f.id;
              const isKind = f.id !== 'all' && f.id !== 'featured';
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={`flex h-10 items-center gap-2 rounded-full border px-4 text-[13.5px] transition-colors ${
                    on ? 'border-transparent bg-button-bg text-button-fg' : 'border-line bg-panel text-fg-2 hover:text-fg'
                  }`}
                >
                  {isKind && <StarGlyph color={on ? 'currentColor' : kindColor(f.id)} />}
                  {f.label}
                  <span className="chip-count">{n[f.id]}</span>
                </button>
              );
            })}
          </div>
          <label className="relative block lg:w-[300px]">
            <span className="sr-only">Search projects by title, description or technology</span>
            <Icon name="search" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects or technology"
              className="h-10 w-full rounded-full border border-line bg-panel pl-10 pr-4 text-[14px] text-fg outline-none placeholder:text-muted focus:border-accent"
            />
          </label>
        </div>
        <p className="mono mt-4 text-[12px] text-muted" aria-live="polite">
          {list.length} of {n[filter]} projects
        </p>

        {list.length === 0 ? (
          <div className="panel mt-6 grid place-items-center p-12 text-center">
            <p className="mono text-fg-2">No projects match “{q}”.</p>
            <button type="button" className="btn mt-4" onClick={() => setQuery('')}>
              Clear search
            </button>
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-annotate="covers">
            {list.map((p) => (
              <li key={p.slug} className={p.spotlight && !q ? 'md:col-span-2 lg:col-span-3' : ''}>
                {p.spotlight && !q ? <SpotlightCard p={p} onOpen={() => openSlug(p.slug)} /> : <ProjectCard p={p} onOpen={() => openSlug(p.slug)} />}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h3 className="label mb-3 !text-accent">Open-source contributions</h3>
            <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
              {contributions.map((c) => (
                <li key={c.title} className={`panel relative flex items-center gap-3 p-3.5 ${c.placeholder ? 'ph-card' : ''}`}>
                  {c.placeholder && <PhRibbon />}
                  <span className="mono rounded-md px-2 py-0.5 text-[11px]" style={{ color: c.state === 'merged' ? 'var(--violet)' : c.state === 'open' ? 'var(--green)' : 'var(--accent)', background: 'var(--panel-2)' }}>
                    {c.state}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] text-fg">
                      <Text v={c.title} badge={false} />
                    </p>
                    <p className="mono truncate text-[11.5px] text-muted">
                      <Text v={c.repo} badge={false} />
                    </p>
                  </div>
                  {safeHref(c.href) && (
                    <a href={c.href} target="_blank" rel="noopener noreferrer" className="icon-btn ml-auto h-9 w-9 shrink-0" aria-label={`Open ${c.repo} (new tab)`}>
                      <Icon name="arrowUpRight" size={15} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="label mb-3 !text-accent">Community &amp; writing</h3>
            <div className="panel ph-card relative p-5">
              <PhRibbon />
              <p className="text-[14px] text-fg-2">
                <Text v={ph('Technical write-ups, talks and community answers will appear here: for example a post on why the Kaggle heart-disease copy leaks test rows, and a walkthrough of exact orientation predicates.')} badge={false} />
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={!!open}
        onClose={close}
        label={open?.title ?? 'Project'}
        header={open ? <ModalHeader p={open} /> : undefined}
      >
        {open && <ProjectDetail p={open} />}
      </Modal>
    </section>
  );
}

function Meta({ p }: { p: Project }) {
  return (
    <div className="mono flex flex-wrap items-center gap-1.5 text-[11.5px]">
      {p.spotlight && (
        <span className="flex items-center gap-1 text-accent">
          <Icon name="pin" size={13} /> SPOTLIGHT
        </span>
      )}
      <span className="chip !text-[11px]">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.status === 'live' ? 'var(--green)' : p.status === 'complete' ? 'var(--sky)' : 'var(--amber)' }} />
        {statusLabel[p.status]}
      </span>
      <span className="chip !text-[11px]" style={{ color: kindColor(p.kind), borderColor: `color-mix(in srgb, ${kindColor(p.kind)} 40%, transparent)` }}>
        {kindLabels[p.kind]}
      </span>
      {p.badge && <span className="chip !text-[11px] !text-amber">{p.badge}</span>}
    </div>
  );
}

function Cover({ p, onOpen, className }: { p: Project; onOpen: () => void; className: string }) {
  const cover = covers[p.cover];
  return (
    <button type="button" onClick={onOpen} className={`block bg-[var(--sc-panel)] text-left ${className}`} aria-label={`Open ${p.title} details`} tabIndex={-1}>
      <SceneHost Scene={cover.Scene} frozenAt={cover.frozenAt} label={cover.label} className="aspect-[16/10] w-full lg:h-full" />
    </button>
  );
}

const tone = (p: Project) => ({ ['--tone' as string]: kindColor(p.kind) }) as React.CSSProperties;

/** The wide card: cover on the left, text and measurements on the right (stacked below 1024px). */
function SpotlightCard({ p, onOpen }: { p: Project; onOpen: () => void }) {
  return (
    <article
      data-tone
      style={tone(p)}
      onPointerMove={trackPointer}
      className="panel glow-card liftable flex h-full flex-col overflow-hidden lg:grid lg:min-h-[520px] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
    >
      <Cover p={p} onOpen={onOpen} className="border-b border-line lg:border-b-0 lg:border-r" />
      <div className="flex flex-col p-6 md:p-8">
        <p className="flex items-center gap-2 text-[13px] text-fg-2">
          <StarGlyph color={kindColor(p.kind)} />
          Spotlight · {kindLabels[p.kind]} · {p.period}
        </p>
        <h3 className="display mt-4 text-[34px] leading-[1.05] text-fg">
          <button type="button" onClick={onOpen} className="text-left hover:text-accent">
            {p.title}
          </button>
        </h3>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-2">{p.summary}</p>
        {p.badge && <span className="chip mt-4 self-start">{p.badge}</span>}
        {p.measures && p.measures.length > 0 && (
          <ul className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Measurements">
            {p.measures.map((m) => (
              <li key={m.label} className="rounded-xl border border-line p-3">
                <p className="display text-[22px] leading-tight text-fg">{m.value}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{m.label}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          <button type="button" onClick={onOpen} className="btn btn-solid h-11 min-h-0 px-5 text-sm">
            Details <Icon name="arrowRight" size={15} />
          </button>
          {p.links.repo && (
            <a href={p.links.repo} target="_blank" rel="noopener noreferrer" className="btn h-11 min-h-0 px-5 text-sm" aria-label={`${p.title} source (new tab)`}>
              <Icon name="github" size={15} /> Source
            </a>
          )}
          {p.links.live && (
            <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="btn h-11 min-h-0 px-5 text-sm" aria-label={`${p.title} live site (new tab)`}>
              <Icon name="external" size={15} /> Live
            </a>
          )}
          {!p.links.repo && <span className="mono text-[12px] text-muted">Private repository</span>}
        </div>
      </div>
    </article>
  );
}

/** One quiet line of technologies. Shows up to three whole names, then "+N"; drops to two (or one) when three do not fit. Never cuts a name. */
function TechLine({ tech }: { tech: string[] }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [n, setN] = useState(Math.min(3, tech.length));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = document.createElement('canvas').getContext('2d');
    const fit = () => {
      if (!ctx) return;
      const cs = getComputedStyle(el);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const room = el.clientWidth;
      let best = 1;
      for (let k = Math.min(3, tech.length); k >= 1; k--) {
        const rest = tech.length - k;
        const text = tech.slice(0, k).join(' · ') + (rest ? ` +${rest}` : '');
        if (ctx.measureText(text).width <= room) {
          best = k;
          break;
        }
      }
      setN(best);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    void document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, [tech]);
  const rest = tech.length - n;
  return (
    <p ref={ref} className="mono mt-3 overflow-hidden whitespace-nowrap text-[11.5px] text-muted">
      {tech.slice(0, n).join(' · ')}
      {rest > 0 && ` +${rest}`}
    </p>
  );
}

function ProjectCard({ p, onOpen }: { p: Project; onOpen: () => void }) {
  const suffix = p.status === 'live' ? ' · Live' : p.status === 'in-progress' ? ' · In progress' : '';
  return (
    <article data-tone style={tone(p)} onPointerMove={trackPointer} className="panel glow-card liftable flex h-full flex-col overflow-hidden">
      <Cover p={p} onOpen={onOpen} className="border-b border-line" />
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-2 text-[12.5px] text-fg-2">
          <StarGlyph color={kindColor(p.kind)} size={9} />
          <span>
            {kindLabels[p.kind]}
            {suffix}
          </span>
          <span className="ml-auto shrink-0 text-muted">{p.period}</span>
        </p>
        <h3 className="display mt-2.5 text-[22px] leading-tight text-fg">
          <button type="button" onClick={onOpen} className="text-left hover:text-accent">
            {p.title}
          </button>
        </h3>
        <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-fg-2">{p.summary}</p>
        <div className="flex-1" />
        <TechLine tech={p.tech} />
      </div>
    </article>
  );
}

function ModalHeader({ p }: { p: Project }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');
  const copy = async () => {
    const url = new URL(window.location.href);
    url.search = `?project=${p.slug}`;
    url.hash = 'projects';
    try {
      await navigator.clipboard.writeText(url.href);
      setState('ok');
    } catch {
      setState('fail');
    }
    window.setTimeout(() => setState('idle'), 1800);
  };
  return (
    <div className="flex items-center gap-3">
      <span className="truncate font-semibold text-fg">{p.title}</span>
      <button type="button" onClick={copy} className="mono ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-line-2 px-2.5 text-[11.5px] text-fg-2 hover:text-fg" aria-live="polite">
        <Icon name={state === 'ok' ? 'check' : 'link'} size={14} />
        {state === 'ok' ? 'Copied' : state === 'fail' ? 'Copy failed' : 'Copy link'}
      </button>
    </div>
  );
}

function ProjectDetail({ p }: { p: Project }) {
  const cover = covers[p.cover];
  const Demo = p.demo ? demos[p.demo] : null;
  return (
    <div className="p-5 md:p-7">
      <div className="panel overflow-hidden bg-[var(--sc-panel)]">
        <SceneHost Scene={cover.Scene} frozenAt={cover.frozenAt} label={cover.label} className="aspect-[16/10] w-full" />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Meta p={p} />
        <span className="mono text-[12px] text-muted">{p.period}</span>
      </div>
      <h2 className="display mt-3 text-[30px] leading-tight text-fg">{p.title}</h2>
      <p className="mt-3 text-[15.5px] leading-relaxed text-fg-2">
        <GlossText text={p.summary} />
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {p.links.repo && (
          <a href={p.links.repo} target="_blank" rel="noopener noreferrer" className="btn h-10 min-h-0 text-sm">
            <Icon name="github" size={16} /> Source <span className="sr-only">(new tab)</span>
          </a>
        )}
        {p.links.live && (
          <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary h-10 min-h-0 text-sm">
            <Icon name="external" size={15} /> Live site <span className="sr-only">(new tab)</span>
          </a>
        )}
        {p.links.extra?.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn btn-ghost h-10 min-h-0 text-sm">
            {l.label} <Icon name="arrowUpRight" size={14} />
          </a>
        ))}
        {!p.links.repo && <span className="mono self-center text-[12px] text-muted">The repository is private, so there is no source link.</span>}
      </div>
      {p.glance && (
        <section className="mt-7">
          <h3 className="label mb-3 !text-accent">At a glance</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            {(['problem', 'built', 'decisions', 'outcome'] as const).map((k) => (
              <div key={k} className="rounded-xl border border-line p-4">
                <dt className="mono mb-1 text-[11px] uppercase tracking-wider text-muted">{k}</dt>
                <dd className="text-[14px] leading-relaxed text-fg-2">
                  <GlossText text={p.glance![k]} />
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {Demo && (
        <section className="mt-7">
          <h3 className="label mb-3 !text-accent">Try it</h3>
          <Demo />
        </section>
      )}
      <section className="mt-7">
        <h3 className="label mb-3 !text-accent">Highlights</h3>
        <ul className="grid gap-3">
          {p.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-fg-2">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>
                <GlossText text={h} />
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="mt-7">
        <h3 className="label mb-3 !text-accent">Stack</h3>
        <ul className="flex flex-wrap gap-1.5">
          {p.tech.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13.5px] text-muted">{p.role}</p>
      </section>
      {p.media && p.media.length > 0 && (
        <section className="mt-7">
          <h3 className="label mb-3 !text-accent">Screenshots</h3>
          <div className="grid gap-4">
            {p.media.map((m) => (
              <figure key={m.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.src} alt={m.alt} width={m.width} height={m.height} loading="lazy" className="w-full rounded-xl border border-line" />
                {m.caption && <figcaption className="mt-2 text-[13px] text-muted">{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}
      <p className="mono mt-8 text-[11.5px] text-muted">The cover animation illustrates the project&apos;s mechanism; it does not run the project.</p>
    </div>
  );
}
