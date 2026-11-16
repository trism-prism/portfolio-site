'use client';

import { useState } from 'react';
import { experience } from '../content/experience';
import { CalendarIcon, ChevronIcon, ExternalIcon } from './Icons';
import { Section } from './Section';
import styles from './Experience.module.css';

export function Experience() {
  // The first role starts open; the rest collapsed.
  const [open, setOpen] = useState<Set<string>>(() => new Set(experience.slice(0, 1).map((e) => e.id)));

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Section id="experience" eyebrow="My Career Path" title="Professional Experience">
      <ol className={styles.timeline}>
        {experience.map((job) => {
          const isOpen = open.has(job.id);
          return (
            <li key={job.id} className={styles.item} data-reveal>
              <article className={`card ${styles.card}`}>
                <div className={styles.head}>
                  <span className={styles.logo} aria-hidden="true">
                    {job.logo}
                  </span>
                  <div className={styles.titles}>
                    <h3 className={styles.title}>{job.title}</h3>
                    <p className={styles.company}>
                      {job.url ? (
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="extLink">
                          {job.company} <ExternalIcon size={13} />
                        </a>
                      ) : (
                        job.company
                      )}
                      <span className={styles.where}> · {job.location}</span>
                    </p>
                  </div>
                  <span className={`pill ${styles.date}`}>
                    <CalendarIcon size={14} />
                    {job.dates}
                  </span>
                  <button
                    type="button"
                    className={`${styles.toggle} ${isOpen ? styles.rot : ''}`}
                    aria-expanded={isOpen}
                    aria-controls={`exp-${job.id}`}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${job.title}`}
                    onClick={() => toggle(job.id)}
                  >
                    <ChevronIcon size={18} />
                  </button>
                </div>
                <ul className={`chips ${styles.tech}`}>
                  {job.tech.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
                <div id={`exp-${job.id}`} className={styles.body} hidden={!isOpen}>
                  <p className={styles.summary}>{job.summary}</p>
                  <ul className="ticks">
                    {job.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
