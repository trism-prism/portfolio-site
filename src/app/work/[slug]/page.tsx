import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Figure from '@/components/Figure';
import { renderCaseStudy } from '@/lib/caseStudy';
import { findProject, neighbours, publicProjects } from '@/lib/projects';
import styles from './project.module.css';

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publicProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};
  const image = project.media[0];
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}/` },
    openGraph: {
      type: 'article',
      title: project.title,
      description: project.summary,
      url: `/work/${project.slug}/`,
      images: image ? [{ url: image.src, width: image.width, height: image.height, alt: image.alt }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const { prev, next } = neighbours(project.slug);
  const caseStudyHtml = project.caseStudy ? renderCaseStudy(project.caseStudy) : null;
  const [lead, ...rest] = project.media;

  return (
    <article aria-labelledby="project-title">
      <p className={styles.crumb}>
        <Link href="/work/">Work</Link>
      </p>
      <header className="prose">
        <h1 id="project-title">{project.title}</h1>
        <p className={styles.summary}>{project.summary}</p>
      </header>

      <dl className={styles.facts}>
        <div>
          <dt>Role</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>{project.period}</dd>
        </div>
        <div>
          <dt>Built with</dt>
          <dd>{project.tech.join(', ')}</dd>
        </div>
        <div>
          <dt>Links</dt>
          <dd>
            {project.links.repo || project.links.live || project.links.extra?.length ? (
              <ul className={styles.links}>
                {project.links.live ? (
                  <li>
                    <a href={project.links.live}>Live site</a>
                  </li>
                ) : null}
                {project.links.repo ? (
                  <li>
                    <a href={project.links.repo}>Source code</a>
                  </li>
                ) : null}
                {project.links.extra?.map((l) => (
                  <li key={l.href}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
            ) : (
              'The source is private.'
            )}
          </dd>
        </div>
      </dl>

      {lead ? <Figure media={lead} eager /> : null}

      <section aria-labelledby="highlights" className="prose">
        <h2 id="highlights">Highlights</h2>
        <ul>
          {project.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      {caseStudyHtml ? (
        <section aria-labelledby="case-study" className={`prose ${styles.caseStudy}`}>
          <h2 id="case-study" className="visually-hidden">
            Case study
          </h2>
          <div dangerouslySetInnerHTML={{ __html: caseStudyHtml }} />
        </section>
      ) : null}

      {rest.map((m) => (
        <Figure key={m.src} media={m} />
      ))}

      <nav aria-label="More projects" className={styles.pager}>
        {prev ? (
          <Link href={`/work/${prev.slug}/`} rel="prev">
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}/`} rel="next">
            {next.title} →
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
