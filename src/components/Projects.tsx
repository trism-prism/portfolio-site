import Image from 'next/image';
import { projects } from '../content/projects';
import { ExternalIcon } from './Icons';
import { Section } from './Section';
import styles from './Projects.module.css';

export function Projects() {
  return (
    <Section id="projects" eyebrow="Project Showcase" title="Innovative Projects">
      <ul className={styles.grid}>
        {projects.map((p) => (
          <li key={p.id} className={`card ${styles.card}`} data-reveal>
            <div className={styles.cover}>
              {p.cover ? (
                <Image src={p.cover.src} alt={p.cover.alt} width={1280} height={720} sizes="(max-width: 900px) 100vw, 560px" />
              ) : (
                <span className={`mono ${styles.mono}`} aria-hidden="true">
                  {p.title.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <h3 className={styles.title}>{p.title}</h3>
                <span className={`pill ${styles.date}`}>{p.dates}</span>
              </div>
              <p className={styles.desc}>{p.description}</p>
              <p className="subLabel">Key features</p>
              <ul className="ticks">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <ul className="chips">
                {p.tech.map((t) => (
                  <li key={t} className="chip">
                    {t}
                  </li>
                ))}
              </ul>
              <div className={styles.links}>
                {p.links.repo && (
                  <a href={p.links.repo} target="_blank" rel="noopener noreferrer" className="extLink">
                    Code <ExternalIcon size={14} />
                  </a>
                )}
                {p.links.live && (
                  <a href={p.links.live} target="_blank" rel="noopener noreferrer" className="extLink">
                    Live <ExternalIcon size={14} />
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
