import { personal } from '@/data/personal';
import { isPh } from '@/data/ph';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { GlossText } from '@/components/ui/Gloss';
import { CharacterReveal, Reveal } from '@/components/ui/Reveal';

const tones: Record<string, string> = { teal: 'var(--accent)', violet: 'var(--violet)', green: 'var(--green)', amber: 'var(--amber)' };
const orbit = ['TS', 'Py', 'C++', '⚛', 'pg', 'C#', 'K', '▲'];

export function About() {
  const a = personal.about;
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHeader id="about" />
        <div className="grid items-center gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal className="flex justify-center">
            <Avatar />
          </Reveal>
          <div>
            <p className="mono mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--green)_40%,transparent)] bg-[color-mix(in_srgb,var(--green)_8%,transparent)] px-3 py-1 text-[12px] text-green">
              <span className="h-1.5 w-1.5 rounded-full bg-green" /> {a.now}
            </p>
            <h3 className="display mb-6 text-[30px] text-fg">
              <CharacterReveal text={a.greeting} />
            </h3>
            <ul className="grid gap-3">
              {a.cards.map((c, i) => (
                <Reveal as="li" key={i} delay={0.15 + i * 0.08} className={`panel relative flex gap-4 p-4 md:p-5 ${isPh(c.text) ? 'ph-card' : ''}`}>
                  <span className="absolute bottom-4 left-0 top-4 w-[2px] rounded-full" style={{ background: tones[c.tone] }} aria-hidden="true" />
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ color: tones[c.tone], background: `color-mix(in srgb, ${tones[c.tone]} 12%, transparent)` }}>
                    <Icon name={c.icon} size={18} />
                  </span>
                  <p className="text-[15px] leading-relaxed text-fg-2">
                    <GlossText text={c.text} />
                  </p>
                </Reveal>
              ))}
            </ul>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {a.facts.map((f) => (
                <div key={f.label} className="rounded-xl border border-line p-3">
                  <dt className="label !text-[10px]">{f.label}</dt>
                  <dd className="mt-1 text-[13.5px] font-medium text-fg">
                    <Text v={f.value} badge={false} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar() {
  return (
    <div className="relative h-[270px] w-[270px] sm:h-[340px] sm:w-[340px]" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border border-dashed border-line-2" />
      <div className="avatar-orbit absolute inset-0">
        {orbit.map((t, i) => {
          const ang = (i / orbit.length) * Math.PI * 2;
          return (
            <span
              key={t}
              className="avatar-tile mono absolute grid h-11 w-11 place-items-center rounded-xl border border-line-2 bg-panel text-[13px] font-bold text-fg-2"
              style={{ left: `calc(50% + ${Math.cos(ang) * 42}% - 22px)`, top: `calc(50% + ${Math.sin(ang) * 42}% - 22px)` }}
            >
              {t}
            </span>
          );
        })}
      </div>
      <div data-annotate="placeholders" className="ph-card absolute inset-[22%] overflow-hidden rounded-full border border-line-2" style={{ background: 'radial-gradient(circle at 50% 30%, var(--panel-2), var(--panel))' }}>
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="40" r="17" fill="var(--sc-line)" />
          <path d="M18 100 C20 72 34 62 50 62 C66 62 80 72 82 100 Z" fill="var(--sc-line)" />
          <path d="M50 18 L62 40 L38 40 Z" fill="var(--accent)" opacity=".9" />
        </svg>
        <span className="ph-ribbon !right-1/2 !top-auto bottom-3 translate-x-1/2" data-placeholder="">
          Photo
        </span>
      </div>
      <style>{`
        .avatar-orbit { animation: orbit 60s linear infinite; }
        .avatar-tile { animation: orbit 60s linear infinite reverse; }
        @keyframes orbit { to { transform: rotate(360deg); } }
        [data-motion='reduced'] .avatar-orbit, [data-motion='reduced'] .avatar-tile { animation: none; }
      `}</style>
    </div>
  );
}
