'use client';

import { useCallback, useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { onUi } from '@/lib/nav';
import { personal } from '@/data/personal';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { projects } from '@/data/projects';
import { skillCategories } from '@/data/skills';

type Doc = 'resume' | 'cv';

// Web view is built from the same data as the page; the PDF view embeds the real file.
export function CvViewer() {
  const [open, setOpen] = useState(false);
  const [doc, setDoc] = useState<Doc>('cv');
  const [view, setView] = useState<'web' | 'pdf'>('web');
  const close = useCallback(() => setOpen(false), []);

  useEffect(
    () =>
      onUi((e) => {
        if (e.type === 'cv') {
          setDoc(e.doc ?? 'cv');
          setView('web');
          setOpen(true);
        }
      }),
    [],
  );

  const pdf = doc === 'cv' ? personal.links.cv : personal.links.resume;
  const shown = doc === 'resume' ? projects.filter((p) => p.featured) : projects.filter((p) => p.slug !== 'portfolio');

  return (
    <Modal
      open={open}
      onClose={close}
      label={doc === 'cv' ? 'Curriculum vitae' : 'Résumé'}
      width={880}
      header={
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Document" className="flex rounded-lg border border-line-2 p-0.5">
            {(['cv', 'resume'] as const).map((d) => (
              <button key={d} role="tab" aria-selected={doc === d} onClick={() => setDoc(d)} className={`rounded-md px-3 py-1 text-sm ${doc === d ? 'bg-panel-2 text-fg' : 'text-fg-2'}`}>
                {d === 'cv' ? 'CV' : 'Résumé'}
              </button>
            ))}
          </div>
          <div role="tablist" aria-label="View" className="flex rounded-lg border border-line-2 p-0.5">
            {(['web', 'pdf'] as const).map((v) => (
              <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={`mono rounded-md px-3 py-1 text-xs uppercase ${view === v ? 'bg-panel-2 text-fg' : 'text-fg-2'}`}>
                {v}
              </button>
            ))}
          </div>
          <a href={pdf} download className="btn ml-auto h-9 min-h-0 px-3 text-sm">
            <Icon name="download" size={15} /> PDF
          </a>
        </div>
      }
    >
      {view === 'pdf' ? (
        <div className="h-[75dvh] bg-bg">
          <object data={pdf} type="application/pdf" className="h-full w-full" aria-label={`${doc} PDF`}>
            <div className="grid h-full place-items-center p-8 text-center text-fg-2">
              <p>
                Your browser cannot show PDFs inline.{' '}
                <a className="link-u text-accent" href={pdf}>
                  Open the PDF
                </a>
                .
              </p>
            </div>
          </object>
        </div>
      ) : (
        <article className="mx-auto max-w-[720px] px-5 py-7 text-[14.5px] leading-relaxed text-fg-2 md:px-8">
          <header className="mb-6 border-b border-line pb-5">
            <h2 className="display text-3xl text-fg">{personal.name}</h2>
            <p className="mono mt-2 text-[12.5px]">
              {personal.location} · {personal.email} · linkedin.com/in/{personal.links.linkedinHandle} · github.com/{personal.links.githubUser}
            </p>
          </header>
          <CvBlock title="Education">
            {education.map((e) => (
              <div key={e.id} className="mb-3">
                <div className="flex flex-wrap justify-between gap-x-4 font-semibold text-fg">
                  <span>{e.school}</span>
                  <span className="mono text-[12.5px] font-normal text-muted">
                    <Text v={e.period} badge={false} />
                  </span>
                </div>
                <div>{e.credential}</div>
                {e.extras?.[0] && doc === 'cv' && <div className="text-[13px]">Coursework: {e.extras[0].items.join(', ')}</div>}
              </div>
            ))}
          </CvBlock>
          <CvBlock title="Experience">
            {experience
              .filter((e) => !e.placeholder)
              .map((e) => (
                <div key={e.id} className="mb-3">
                  <div className="flex flex-wrap justify-between gap-x-4 font-semibold text-fg">
                    <span>
                      {e.role}, {e.org} · {e.place}
                    </span>
                    <span className="mono text-[12.5px] font-normal text-muted">{e.period}</span>
                  </div>
                  <ul className="ml-4 list-disc">
                    {e.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
          </CvBlock>
          <CvBlock title={doc === 'cv' ? 'Projects' : 'Selected projects'}>
            {shown.map((p) => (
              <div key={p.slug} className="mb-3">
                <div className="flex flex-wrap justify-between gap-x-4 font-semibold text-fg">
                  <span>
                    {p.title}
                    {p.links.repo && <span className="mono ml-2 text-[12px] font-normal text-muted">{p.links.repo.replace('https://', '')}</span>}
                  </span>
                  <span className="mono text-[12.5px] font-normal text-muted">{p.period}</span>
                </div>
                <ul className="ml-4 list-disc">
                  {(doc === 'cv' ? p.highlights : p.highlights.slice(0, 2)).map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CvBlock>
          <CvBlock title="Technical skills">
            {skillCategories.slice(0, doc === 'cv' ? undefined : 4).map((c) => (
              <div key={c.id}>
                <span className="font-semibold text-fg">{c.label}:</span> {c.items.join(', ')}
              </div>
            ))}
          </CvBlock>
          <p className="mono mt-6 text-[11.5px] text-muted">
            Web view generated from the site&apos;s data. The PDF is the authoritative version.
          </p>
        </article>
      )}
    </Modal>
  );
}

function CvBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="label mb-3 !text-accent">{title}</h3>
      {children}
    </section>
  );
}
