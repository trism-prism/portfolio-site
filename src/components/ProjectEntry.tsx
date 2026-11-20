import Link from 'next/link';
import type { Project } from '@/content/types';
import styles from './ProjectEntry.module.css';

/**
 * One project as an editorial row: when, what it is, why it is worth a look, what it is built
 * with, and a thumbnail when one exists. The title links to the project's page.
 */
export default function ProjectEntry({
  project,
  headingLevel = 3,
}: {
  project: Project;
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  const thumb = project.preview ?? project.media[0];
  return (
    <article className={styles.entry} aria-labelledby={`p-${project.slug}`} data-has-media={thumb ? '' : undefined}>
      <p className={`${styles.period} mono`}>{project.period}</p>
      <div className={styles.body}>
        <Heading id={`p-${project.slug}`} className={styles.title}>
          <Link href={`/work/${project.slug}/`}>{project.title}</Link>
        </Heading>
        <p className={styles.summary}>{project.summary}</p>
        {project.significance ? <p className={styles.significance}>{project.significance}</p> : null}
        {project.caseStudy ? <p className={styles.flag}>Includes a case study</p> : null}
      </div>
      <p className={`${styles.stack} mono`}>
        <span className="visually-hidden">Built with </span>
        {project.tech.join(', ')}
      </p>
      {thumb ? (
        <div className={styles.thumb} aria-hidden="true">
          {/* Decorative here: the same image, with its description, is on the project page. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumb.src} alt="" width={thumb.width} height={thumb.height} loading="lazy" decoding="async" />
        </div>
      ) : null}
    </article>
  );
}
