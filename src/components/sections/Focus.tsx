'use client';

import { focusAreas } from '@/data/focus';
import { projects } from '@/data/projects';
import { emit, goTo } from '@/lib/nav';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SceneHost } from '@/components/scenes/Stage';
import { focusArt } from '@/components/scenes/FocusArt';

const tones = ['var(--accent)', 'var(--violet)', 'var(--sky)'];

function Evidence({ items }: { items: string[] }) {
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
      <span className="label !text-[10px]">Backed by</span>
      {items.map((e) => {
        if (e.startsWith('#'))
          return (
            <button key={e} type="button" className="link-u text-fg-2 hover:text-fg" onClick={() => goTo(e.slice(1))}>
              Formwork
            </button>
          );
        const p = projects.find((x) => x.slug === e);
        return p ? (
          <button key={e} type="button" className="link-u text-fg-2 hover:text-fg" onClick={() => emit({ type: 'project', slug: e })}>
            {p.title}
          </button>
        ) : null;
      })}
    </p>
  );
}

export function Focus() {
  return (
    <section id="focus" className="section" aria-labelledby="focus-title">
      <div className="wrap">
        <SectionHeader id="focus" />
        <div className="grid gap-5 md:grid-cols-2">
          {focusAreas.map((f, i) => {
            const art = focusArt[f.key];
            const tone = tones[i % 3];
            return (
              <Reveal
                key={f.key}
                delay={(i % 2) * 0.06}
                className={`panel glow-card overflow-hidden ${f.lead ? 'md:col-span-2 md:grid md:grid-cols-[400px_minmax(0,1fr)]' : 'sm:grid sm:grid-cols-[200px_minmax(0,1fr)]'}`}
              >
                <div className="grid place-items-center border-b border-line bg-[var(--sc-panel)] p-4 sm:border-b-0 sm:border-r">
                  <SceneHost
                    Scene={art.Scene}
                    frozenAt={art.frozenAt}
                    w={f.lead ? 160 : 80}
                    h={80}
                    label={art.label}
                    className={f.lead ? 'aspect-[2/1] w-full max-w-[368px]' : 'aspect-square w-full max-w-[184px]'}
                  />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="flex items-center gap-2 text-[18px] font-semibold text-fg">
                    <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
                    {f.title}
                  </h3>
                  <ul className={`mt-3 grid gap-1.5 text-[14px] text-fg-2 ${f.lead ? 'md:grid-cols-2 md:gap-x-6' : ''}`}>
                    {f.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full" style={{ background: tone }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Evidence items={f.evidence} />
                  <button type="button" onClick={() => goTo('contact')} className="mt-4 flex items-center gap-1.5 text-[14px] font-medium" style={{ color: tone }}>
                    Ask me about this <Icon name="arrowRight" size={15} />
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
