import { badges, certifications, competitions, honors } from '@/data/achievements';
import { isPh, plain } from '@/data/ph';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Icon } from '@/components/ui/Icon';
import { Text, PhRibbon } from '@/components/ui/Text';
import { Reveal } from '@/components/ui/Reveal';

const levelOrder = { professional: 0, associate: 1, foundational: 2 } as const;
const medal = { gold: 'var(--gold)', silver: 'var(--silver)', bronze: 'var(--bronze)' } as const;

/** Active unless an expiry date (YYYY-MM) is in the past. Placeholder dates count as unknown. */
function certState(expires?: string): 'active' | 'expired' | 'unknown' {
  if (!expires || isPh(expires)) return 'unknown';
  return expires >= new Date().toISOString().slice(0, 7) ? 'active' : 'expired';
}

export function Achievements() {
  const certs = [...certifications].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
  return (
    <section id="achievements" className="section" aria-labelledby="achievements-title">
      <div className="wrap">
        <SectionHeader id="achievements" />
        <h3 className="label mb-4 flex items-center gap-3">
          Honors <span className="h-px flex-1 border-t border-dashed border-line-2" />
        </h3>
        <ul className="grid gap-4 md:grid-cols-3">
          {honors.map((h, i) => (
            <Reveal as="li" key={h.id} delay={i * 0.06} className={`panel glow-card relative p-5 ${h.placeholder ? 'ph-card' : ''}`}>
              {h.placeholder && <PhRibbon />}
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--amber)_14%,transparent)] text-amber">
                <Icon name="trophy" />
              </span>
              <p className="mt-4 font-semibold text-fg">
                <Text v={h.title} badge={false} />
              </p>
              <p className="text-[14px] text-fg-2">{h.org}</p>
              <p className="mono mt-2 text-[12px] text-muted">
                <Text v={h.when} badge={false} />
              </p>
            </Reveal>
          ))}
        </ul>

        <h3 className="label mb-4 mt-12 flex items-center gap-3">
          Certifications <span className="h-px flex-1 border-t border-dashed border-line-2" />
        </h3>
        <ul className="grid gap-4 md:grid-cols-3">
          {certs.map((c, i) => {
            const st = certState(c.expires);
            return (
              <Reveal as="li" key={c.id} delay={i * 0.06} className={`panel relative overflow-hidden p-5 ${c.placeholder ? 'ph-card' : ''}`}>
                {c.placeholder && <PhRibbon />}
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full border-2" style={{ borderColor: c.level === 'foundational' ? 'var(--sky)' : 'var(--violet)', color: c.level === 'foundational' ? 'var(--sky)' : 'var(--violet)' }}>
                    <Icon name="badge" size={22} />
                  </span>
                  <span className="mono text-[11px] uppercase tracking-wider text-muted">{c.level}</span>
                </div>
                <p className="mt-4 font-semibold leading-snug text-fg">
                  <Text v={c.name} badge={false} />
                </p>
                <p className="text-[14px] text-fg-2">{c.issuer}</p>
                <p className="mono mt-3 flex items-center gap-2 text-[11.5px] text-muted">
                  Issued {plain(c.issued)}
                  <span className={`rounded px-1.5 ${st === 'active' ? 'text-green' : st === 'expired' ? 'text-red-400' : 'text-muted'}`}>{st === 'unknown' ? 'status pending' : st}</span>
                </p>
              </Reveal>
            );
          })}
        </ul>

        <h3 className="label mb-4 mt-12 flex items-center gap-3">
          Learning badges <span className="h-px flex-1 border-t border-dashed border-line-2" />
        </h3>
        <div className="ph-card relative rounded-2xl p-4">
          <PhRibbon />
          <ul className="flex flex-wrap gap-2 pr-24">
            {badges.map((b) => (
              <li key={b.id} className="flex items-center gap-2 rounded-xl border border-line-2 bg-panel px-3 py-2 text-[13px] text-fg-2">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-panel-2 text-accent">
                  <Icon name="medal" size={14} />
                </span>
                {plain(b.label)}
              </li>
            ))}
          </ul>
        </div>

        <h3 className="label mb-4 mt-12 flex items-center gap-3">
          Competitions <span className="h-px flex-1 border-t border-dashed border-line-2" />
        </h3>
        <ul className="grid gap-3">
          {competitions.map((c) => (
            <li key={c.id} className={`panel relative flex flex-wrap items-center gap-4 p-4 ${c.placeholder ? 'ph-card' : ''}`}>
              {c.placeholder && <PhRibbon />}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ background: c.medal ? `color-mix(in srgb, ${medal[c.medal]} 18%, transparent)` : 'var(--panel-2)', color: c.medal ? medal[c.medal] : 'var(--muted)' }}>
                <Icon name="medal" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-fg">
                  <Text v={c.event} badge={false} />
                </p>
                <p className="text-[14px] text-fg-2">
                  <Text v={c.result} badge={false} />
                </p>
              </div>
              <span className="mono mr-24 text-[12px] text-muted">{plain(c.when)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
