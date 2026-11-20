'use client';

import { useCallback, useState } from 'react';
import { experience, type Experience as Exp } from '@/data/experience';
import { education } from '@/data/education';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Text, PhRibbon } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { GlossText } from '@/components/ui/Gloss';
import { Reveal } from '@/components/ui/Reveal';
import { Modal } from '@/components/ui/Modal';
import { SceneHost } from '@/components/scenes/Stage';
import { FormworkScene } from '@/components/scenes/FormworkScene';

function OrgMark({ text, tone = 'var(--accent)' }: { text: string; tone?: string }) {
  return (
    <span
      className="mono grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-[13px] font-bold"
      style={{ color: tone, borderColor: `color-mix(in srgb, ${tone} 40%, transparent)`, background: `color-mix(in srgb, ${tone} 10%, transparent)` }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

function Timeline({ children }: { children: React.ReactNode }) {
  return (
    <ol className="relative grid gap-6 pl-8 md:pl-10">
      <span className="absolute bottom-2 left-[11px] top-2 w-px md:left-[15px]" style={{ background: 'linear-gradient(var(--accent), var(--line-2) 60%, transparent)' }} aria-hidden="true" />
      {children}
    </ol>
  );
}

function Dot({ active }: { active?: boolean }) {
  return (
    <span
      className="absolute -left-8 top-6 grid h-[23px] w-[23px] place-items-center rounded-full border border-line-2 bg-bg md:-left-10 md:h-[31px] md:w-[31px]"
      aria-hidden="true"
    >
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-accent' : 'bg-line-2'}`} style={active ? { boxShadow: '0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent)' } : undefined} />
    </span>
  );
}

export function Experience() {
  const [open, setOpen] = useState<Exp | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const primary = experience.filter((e) => e.kind === 'primary');
  const secondary = experience.filter((e) => e.kind === 'secondary');
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="wrap wrap-narrow">
        <SectionHeader id="experience" />
        <Timeline>
          {primary.map((e, i) => (
            <Reveal as="li" key={e.id} className="relative">
              <Dot active={i === 0} />
              <article className="panel glow-card overflow-hidden">
                <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="p-5 md:p-6">
                    <div className="flex items-start gap-3">
                      <OrgMark text="FW" />
                      <div className="min-w-0">
                        <h3 className="text-[18px] font-semibold leading-snug text-fg">{e.role}</h3>
                        <p className="text-[14.5px] text-fg-2">
                          {e.org} · {e.place}
                        </p>
                      </div>
                    </div>
                    <p className="mono mt-3 text-[12.5px] text-accent">{e.period}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-fg-2">
                      <GlossText text={e.summary} />
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {e.stack.map((s) => (
                        <li key={s} className="chip">
                          {s}
                        </li>
                      ))}
                    </ul>
                    <button type="button" className="btn mt-5 h-10 min-h-0 text-sm" onClick={() => setOpen(e)}>
                      Details <Icon name="arrowRight" size={15} />
                    </button>
                  </div>
                  {e.scene && (
                    <div className="border-t border-line bg-[var(--sc-panel)] md:border-l md:border-t-0">
                      <SceneHost Scene={FormworkScene} frozenAt={9.2} label="Agent integration, a QA pass and a release train at Formwork, drawn in résumé terms." className="aspect-[16/10] h-full w-full" />
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
          {secondary.map((e) => (
            <Reveal as="li" key={e.id} className="relative">
              <Dot />
              <article className={`panel relative flex items-start gap-3 p-5 ${e.placeholder ? 'ph-card' : ''}`}>
                {e.placeholder && <PhRibbon />}
                <OrgMark text="JR" tone="var(--violet)" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-fg">
                    <Text v={e.role} badge={false} />
                  </h3>
                  <p className="text-[14px] text-fg-2">
                    {e.org} · {e.place}
                  </p>
                  <p className="mono mt-1 text-[12px] text-muted">
                    <Text v={e.period} badge={false} />
                  </p>
                  <p className="mt-2 text-[14px] text-fg-2">
                    <Text v={e.summary} badge={false} />
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </Timeline>
      </div>
      <Modal open={!!open} onClose={close} label={open ? `${open.role} at ${open.org}` : ''}>
        {open && (
          <div className="p-5 md:p-7">
            <p className="mono text-[12.5px] text-accent">{open.period}</p>
            <h3 className="display mt-1 text-2xl text-fg">{open.role}</h3>
            <p className="text-fg-2">
              {open.org} · {open.place}
            </p>
            {open.scene && (
              <div className="panel mt-5 overflow-hidden">
                <SceneHost Scene={FormworkScene} frozenAt={9.2} label="Agent integration, a QA pass and a release train." className="aspect-[16/10] w-full" />
              </div>
            )}
            <h4 className="label mb-3 mt-6 !text-accent">What I did</h4>
            <ul className="grid gap-3">
              {open.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-fg-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    <GlossText text={p} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mono mt-6 text-[11.5px] text-muted">Described in the résumé&apos;s public wording only. No client names, screenshots or ticket content.</p>
          </div>
        )}
      </Modal>
    </section>
  );
}

export function Education() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <div className="wrap wrap-narrow">
        <SectionHeader id="education" />
        <Timeline>
          {education.map((e, i) => (
            <Reveal as="li" key={e.id} className="relative" delay={i * 0.08}>
              <Dot active={i === 0} />
              <article className="panel glow-card p-5 md:p-6">
                <div className="flex flex-wrap items-start gap-3">
                  <OrgMark text={e.short} tone={i === 0 ? 'var(--violet)' : 'var(--sky)'} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[18px] font-semibold text-fg">{e.school}</h3>
                    <p className="text-[14.5px] text-fg-2">{e.credential}</p>
                  </div>
                  <p className="mono text-[12.5px] text-accent">
                    <Text v={e.period} badge={false} />
                  </p>
                </div>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {e.highlights.map((h) => (
                    <li key={h} className="chip">
                      {h}
                    </li>
                  ))}
                </ul>
                {e.links && (
                  <p className="mt-3 flex gap-4 text-[13.5px]">
                    {e.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-u text-fg-2 hover:text-fg">
                        {l.label}
                      </a>
                    ))}
                  </p>
                )}
                {e.extras && (
                  <>
                    <button
                      type="button"
                      className="mono mt-4 flex items-center gap-1 text-[12.5px] text-accent"
                      aria-expanded={openId === e.id}
                      aria-controls={`edu-${e.id}`}
                      onClick={() => setOpenId(openId === e.id ? null : e.id)}
                    >
                      <Icon name="chevronDown" size={14} className={`transition-transform ${openId === e.id ? 'rotate-180' : ''}`} />
                      {openId === e.id ? 'Less' : 'Coursework & activities'}
                    </button>
                    <div id={`edu-${e.id}`} hidden={openId !== e.id} className="mt-3 grid gap-3 border-t border-line pt-3">
                      {e.extras.map((x) => (
                        <div key={x.label}>
                          <p className="label mb-1.5 !text-[10px]">{x.label}</p>
                          <ul className="flex flex-wrap gap-1.5">
                            {x.items.map((it) => (
                              <li key={it} className="chip">
                                <Text v={it} badge={false} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </article>
            </Reveal>
          ))}
        </Timeline>
      </div>
    </section>
  );
}
