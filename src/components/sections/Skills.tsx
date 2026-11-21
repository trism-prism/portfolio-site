'use client';

import { useEffect, useRef, useState } from 'react';
import { skillCategories, secondarySkills } from '@/data/skills';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StarGlyph } from '@/components/ui/StarGlyph';
import { Text } from '@/components/ui/Text';
import { Reveal } from '@/components/ui/Reveal';
import { useMotion } from '@/lib/motion';

const SPEED = 40; // px per second, independent of item count
// Card tones run through the spectrum in order, then repeat.
const TONES = ['var(--kind-software)', 'var(--kind-systems)', 'var(--kind-ai)', 'var(--kind-data)', 'var(--rose)', 'var(--route)'];

/**
 * A seamless marquee: the list repeats until a copy has at least 12 chips, then two copies form the track.
 * Duration comes from the measured width, so every rail moves at the same speed. Duplicates are hidden
 * from assistive tech; the plain list is exposed once. Reduced motion shows a static wrapped list.
 */
function Rail({ items, reverse = false, label }: { items: string[]; reverse?: boolean; label: string }) {
  const { reduced } = useMotion();
  const track = useRef<HTMLDivElement>(null);
  const [dur, setDur] = useState(30);
  const copy: string[] = [];
  while (copy.length < 12) copy.push(...items);

  useEffect(() => {
    if (!track.current) return;
    const el = track.current;
    const measure = () => setDur(Math.max(8, el.scrollWidth / 2 / SPEED));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [reduced]);

  const chip = (s: string, k: string) => (
    <span key={k} className="skill-pill dot shrink-0">
      <Text v={s} badge={false} />
    </span>
  );

  return (
    <>
      <ul className="sr-only" aria-label={label}>
        {items.map((s) => (
          <li key={s}>{s.replace('[[PH]]', '')}</li>
        ))}
      </ul>
      {reduced ? (
        <div className="flex flex-wrap gap-2" aria-hidden="true">
          {items.map((s) => chip(s, s))}
        </div>
      ) : (
        <div className={`rail ${reverse ? 'reverse' : ''}`} aria-hidden="true">
          <div ref={track} className="rail-track" style={{ ['--rail-dur' as string]: `${dur}s` }}>
            {[0, 1].map((rep) => copy.map((s, i) => chip(s, `${rep}-${i}`)))}
          </div>
        </div>
      )}
    </>
  );
}

export function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="wrap">
        <SectionHeader id="skills" />
        <div className="grid gap-4 md:grid-cols-2">
          {skillCategories.map((c, i) => (
            <Reveal key={c.id} delay={(i % 2) * 0.06} className={`min-w-0 ${c.wide ? 'md:col-span-2' : ''}`}>
              <div className="panel h-full p-5" data-tone style={{ '--tone': TONES[i % TONES.length] } as React.CSSProperties}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="display flex items-center gap-2.5 text-[19px] leading-snug text-fg">
                    <StarGlyph color={TONES[i % TONES.length]} size={12} />
                    {c.label}
                  </h3>
                  <span className="mono shrink-0 text-[11px] text-muted">{c.items.length} items</span>
                </div>
                <p className="mb-4 text-[14px] text-fg-2">{c.blurb}</p>
                <Rail items={c.items} reverse={i % 2 === 1} label={c.label} />
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {secondarySkills.map((g) => (
            <Reveal key={g.id} className="min-w-0">
              <div className="panel h-full p-5">
                <h3 className="label mb-3">{g.label}</h3>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((s) => (
                    <li key={s} className="skill-pill">
                      <Text v={s} badge={false} />
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
