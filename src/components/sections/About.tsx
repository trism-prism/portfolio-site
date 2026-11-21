import { personal } from '@/data/personal';
import { isPh } from '@/data/ph';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StarGlyph } from '@/components/ui/StarGlyph';
import { Text } from '@/components/ui/Text';
import { GlossText } from '@/components/ui/Gloss';
import { CharacterReveal, Reveal } from '@/components/ui/Reveal';

// One entry per personal.about.cards item, in order: Work, Study, Projects, Outside of code.
const cardNames = ['Work', 'Study', 'Projects', 'Outside of code'];
const cardTones = ['var(--kind-software)', 'var(--kind-ai)', 'var(--kind-systems)', 'var(--kind-data)'];

// The interests are drawn as one constellation: a star per interest, joined by a line, zig-zagging down a 56px strip.
const INTEREST_X = [14, 40, 22, 46];
const INTEREST_ROW = 62;
const interestColors = ['var(--kind-software)', 'var(--kind-systems)', 'var(--kind-ai)', 'var(--rose)'];

export function About() {
  const a = personal.about;
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHeader id="about" />
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="mono mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--green)_40%,transparent)] bg-[color-mix(in_srgb,var(--green)_8%,transparent)] px-3 py-1 text-[12px] text-green">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> {a.now}
            </p>
            <h3 className="display text-[34px] leading-[1.15] text-fg">
              <CharacterReveal text={a.greeting} />
            </h3>
            <p className="mt-3 max-w-[600px] text-[17px] leading-relaxed text-fg-2">{personal.intro}</p>
            <ul className="mt-8 grid gap-4 lg:grid-cols-2">
              {a.cards.map((c, i) => (
                <Reveal as="li" key={i} delay={0.15 + i * 0.08} className="h-full">
                  <div className={`panel h-full p-5 ${isPh(c.text) ? 'ph-card' : ''}`} data-tone style={{ '--tone': cardTones[i] } as React.CSSProperties}>
                    <p className="label flex items-center gap-2 tracking-[.18em]">
                      <StarGlyph color={cardTones[i]} size={11} /> {cardNames[i]}
                    </p>
                    <p className="mt-3 text-[14px] leading-relaxed text-fg-2">
                      <GlossText text={c.text} />
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4 md:col-span-5">
            <Reveal delay={0.1}>
              <div className="panel p-5">
                <h3 className="label tracking-[.18em]">Things I keep coming back to</h3>
                <div className="relative mt-4">
                  <svg width="56" height={personal.interests.length * INTEREST_ROW} className="absolute left-0 top-0" aria-hidden="true">
                    <polyline points={INTEREST_X.map((x, i) => `${x},${INTEREST_ROW / 2 + i * INTEREST_ROW}`).join(' ')} fill="none" stroke="var(--constellation)" />
                    {INTEREST_X.map((x, i) => (
                      <g key={i}>
                        <circle cx={x} cy={INTEREST_ROW / 2 + i * INTEREST_ROW} r="10" fill={interestColors[i]} opacity=".2" />
                        <circle cx={x} cy={INTEREST_ROW / 2 + i * INTEREST_ROW} r="3.6" fill={interestColors[i]} />
                      </g>
                    ))}
                  </svg>
                  <ul>
                    {personal.interests.map((txt) => (
                      <li key={txt} className="flex h-[62px] items-center pl-[68px] text-[14px] leading-snug text-fg-2">
                        {txt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.18}>
              <dl className="panel px-5 py-2">
                {a.facts.map((f, i) => (
                  <div key={f.label} className={`flex items-baseline justify-between gap-4 py-3 ${i ? 'border-t border-line' : ''}`}>
                    <dt className="label tracking-[.18em]">{f.label}</dt>
                    <dd className="text-right text-[14px] text-fg">
                      <Text v={f.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
