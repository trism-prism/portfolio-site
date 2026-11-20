import Link from 'next/link';
import type { Project } from '@/content/types';
import styles from './ProjectEntry.module.css';

/** One project in a list. Title links to its page; external links stay on the detail page. */
export default function ProjectEntry({ project, headingLevel = 3 }: { project: Project; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  return (
    <article className={styles.entry} aria-labelledby={`p-${project.slug}`}>
      <Heading id={`p-${project.slug}`} className={styles.title}>
        <Link href={`/work/${project.slug}/`}>{project.title}</Link>
      </Heading>
      <p className={styles.meta}>
        {project.period}
        <span aria-hidden="true"> · </span>
        <span className="visually-hidden">. Built with </span>
        {project.tech.join(', ')}
      </p>
      <p className={styles.summary}>{project.summary}</p>
      {project.caseStudy ? <p className={styles.flag}>Includes a case study</p> : null}
    </article>
  );
}
