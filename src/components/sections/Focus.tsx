'use client';

import { focusAreas, type FocusArea } from '@/data/focus';
import { projects, type Project } from '@/data/projects';
import { emit, goTo } from '@/lib/nav';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StarGlyph } from '@/components/ui/StarGlyph';
import { Reveal } from '@/components/ui/Reveal';

// A project's star takes its kind colour; the Formwork internship uses the route colour.
const kindColor: Record<Project['kind'], string> = {
  software: 'var(--kind-software)',
  systems: 'var(--kind-systems)',
  ai: 'var(--kind-ai)',
  data: 'var(--kind-data)',
};

const chipClass =
  'flex items-center gap-1.5 rounded-full border border-line-2 px-2.5 py-1 text-[12px] text-fg transition-colors hover:border-[color-mix(in_srgb,var(--fg)_40%,transparent)]';

function Evidence({ items }: { items: string[] }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
      <span className="label mr-1 tracking-[.18em]">Backed by</span>
      {items.map((e) => {
        if (e.startsWith('#'))
          return (
            <button key={e} type="button" className={chipClass} onClick={() => goTo(e.slice(1))}>
              <StarGlyph color="var(--route)" size={9} />
              Formwork internship
            </button>
          );
        const p = projects.find((x) => x.slug === e);
        return p ? (
          <button key={e} type="button" className={chipClass} onClick={() => emit({ type: 'project', slug: e })}>
            <StarGlyph color={kindColor[p.kind]} size={9} />
            {p.title}
          </button>
        ) : null;
      })}
    </div>
  );
}

function FocusCard({ f, lead = false, delay = 0 }: { f: FocusArea; lead?: boolean; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className={`panel h-full ${lead ? 'p-6 md:p-7' : 'p-6'}`}>
        <h3 className={`display leading-snug text-fg ${lead ? 'text-[26px] md:text-[30px]' : 'text-[21px]'}`}>{f.title}</h3>
        <ul className={`mt-4 grid gap-x-8 gap-y-2 text-[14px] text-fg-2 ${lead ? 'md:grid-cols-2' : ''}`}>
          {f.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5">
              <span className="mt-[9px] h-[3px] w-[3px] shrink-0 rounded-full bg-muted" aria-hidden="true" />
              {p}
            </li>
          ))}
        </ul>
        <Evidence items={f.evidence} />
      </div>
    </Reveal>
  );
}

export function Focus() {
  const lead = focusAreas.find((f) => f.lead) ?? focusAreas[0];
  const rest = focusAreas.filter((f) => f !== lead);
  return (
    <section id="focus" className="section" aria-labelledby="focus-title">
      <div className="wrap">
        <SectionHeader id="focus" />
        <FocusCard f={lead} lead />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {rest.map((f, i) => (
            <FocusCard key={f.key} f={f} delay={(i % 3) * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
