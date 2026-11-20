'use client';

import { useEffect, useRef, useState } from 'react';
import { skillCategories, secondarySkills } from '@/data/skills';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text } from '@/components/ui/Text';
import { Reveal } from '@/components/ui/Reveal';
import { useMotion } from '@/lib/motion';

const SPEED = 40; // px per second, independent of item count

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
    const measure = () => setDur(Math.max(8, track.current!.scrollWidth / 2 / SPEED));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    return () => ro.disconnect();
  }, []);

  const chip = (s: string, k: string) => (
    <span key={k} className="chip shrink-0 !py-1 !text-[12.5px] text-fg">
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
            <Reveal key={c.id} delay={(i % 2) * 0.06} className={`panel glow-card min-w-0 p-5 ${c.wide ? 'md:col-span-2' : ''}`}>
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h3 className="font-semibold text-fg">{c.label}</h3>
                <span className="mono text-[11.5px] text-muted">{c.items.length} items</span>
              </div>
              <p className="mb-4 text-[14px] text-fg-2">{c.blurb}</p>
              <Rail items={c.items} reverse={i % 2 === 1} label={c.label} />
            </Reveal>
          ))}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {secondarySkills.map((g) => (
            <Reveal key={g.id} className="rounded-2xl border border-dashed border-line-2 p-5">
              <h3 className="label mb-3 !text-accent">{g.label}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {g.items.map((s) => (
                  <li key={s} className="chip">
                    <Text v={s} badge={false} />
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
