import { badges, certifications, competitions, honors } from '@/data/achievements';
import { isPh, plain } from '@/data/ph';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StarGlyph } from '@/components/ui/StarGlyph';
import { Text, PhRibbon } from '@/components/ui/Text';
import { Reveal } from '@/components/ui/Reveal';

const levelOrder = { professional: 0, associate: 1, foundational: 2 } as const;
const levelStars = { professional: 3, associate: 2, foundational: 1 } as const;
// Badge stars cycle through the spectrum.
const spectrum = ['var(--kind-software)', 'var(--kind-systems)', 'var(--kind-ai)', 'var(--rose)', 'var(--route)'];

/** Active unless an expiry date (YYYY-MM) is in the past. Placeholder dates count as unknown. */
function certState(expires?: string): 'active' | 'expired' | 'unknown' {
  if (!expires || isPh(expires)) return 'unknown';
  return expires >= new Date().toISOString().slice(0, 7) ? 'active' : 'expired';
}

const tone = (c: string) => ({ '--tone': c }) as React.CSSProperties;

function Column({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="label mb-4 flex items-center justify-between tracking-[.18em]">
        {label} <span>{count}</span>
      </h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

export function Achievements() {
  const certs = [...certifications].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
  return (
    <section id="achievements" className="section" aria-labelledby="achievements-title">
      <div className="wrap">
        <SectionHeader id="achievements" />
        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          <Column label="Honours" count={honors.length}>
            {honors.map((h, i) => (
              <Reveal as="li" key={h.id} delay={i * 0.06}>
                <div className={`panel p-5 ${h.placeholder ? 'ph-card' : ''}`} data-tone style={tone('var(--rose)')}>
                  {h.placeholder && <PhRibbon />}
                  <p className={`flex items-center gap-2 font-display text-[19px] font-bold leading-snug tracking-[-0.02em] text-fg ${h.placeholder ? 'pr-20' : ''}`}>
                    <StarGlyph color="var(--rose)" size={12} />
                    <span>
                      <Text v={h.title} badge={false} />
                    </span>
                  </p>
                  <p className="mt-1 text-[14px] text-fg-2">{h.org}</p>
                  <p className="mono mt-3 text-[12px] text-muted">
                    <Text v={h.when} badge={false} />
                  </p>
                </div>
              </Reveal>
            ))}
          </Column>

          <Column label="Certifications" count={certs.length}>
            {certs.map((c, i) => {
              const st = certState(c.expires);
              return (
                <Reveal as="li" key={c.id} delay={i * 0.06}>
                  <div className={`panel p-5 ${c.placeholder ? 'ph-card' : ''}`} data-tone style={tone('var(--kind-systems)')}>
                    {c.placeholder && <PhRibbon />}
                    <p className={`font-display text-[17px] font-bold leading-snug tracking-[-0.02em] text-fg ${c.placeholder ? 'pr-20' : ''}`}>
                      <Text v={c.name} badge={false} />
                    </p>
                    <p className="mt-1 text-[14px] text-fg-2">{c.issuer}</p>
                    <div className="mono mt-3 flex items-center justify-between gap-3 text-[12px] text-muted">
                      <span className="flex items-center gap-1.5" title={c.level}>
                        {[1, 2, 3].map((k) => (
                          <span key={k} className="flex" style={{ opacity: k <= levelStars[c.level] ? 1 : 0.25 }}>
                            <StarGlyph color="var(--kind-systems)" size={10} />
                          </span>
                        ))}
                        <span className="ml-1 capitalize">{c.level}</span>
                      </span>
                      <span>
                        <Text v={c.issued} badge={false} />
                        {st !== 'unknown' && <span className={`ml-2 ${st === 'active' ? 'text-green' : 'text-red-400'}`}>{st}</span>}
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </Column>

          <Column label="Competitions" count={competitions.length}>
            {competitions.map((c, i) => (
              <Reveal as="li" key={c.id} delay={i * 0.06}>
                <div
                  className={`panel p-5 ${c.medal ? `medal-${c.medal}` : ''} ${c.placeholder ? 'ph-card' : ''}`}
                  data-tone
                  style={tone(c.medal ? 'var(--medal)' : 'var(--muted)')}
                >
                  {c.placeholder && <PhRibbon />}
                  <p className={`font-display text-[17px] font-bold leading-snug tracking-[-0.02em] text-fg ${c.placeholder ? 'pr-20' : ''}`}>
                    <Text v={c.event} badge={false} />
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-[14px] text-fg-2">
                    {c.medal && <StarGlyph color="var(--medal)" size={11} />}
                    <span>
                      <Text v={c.result} badge={false} />
                    </span>
                  </p>
                  <p className="mono mt-3 text-[12px] text-muted">
                    <Text v={c.when} badge={false} />
                  </p>
                </div>
              </Reveal>
            ))}
          </Column>
        </div>

        <div className="mt-10">
          <h3 className="label mb-4 tracking-[.18em]">Badges · {badges.length}</h3>
          <ul className="flex flex-wrap gap-2.5">
            {badges.map((b) => (
              <li key={b.id} className="panel flex items-center gap-2 !rounded-full px-3.5 py-1.5 text-[13px] text-fg-2">
                <StarGlyph color={spectrum[plain(b.label).length % spectrum.length]} size={10} />
                <span>
                  <Text v={b.label} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

