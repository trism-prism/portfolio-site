import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
  const caseStudy = project.caseStudy ? renderCaseStudy(project.caseStudy) : null;
  const { links } = project;
  const hasLinks = Boolean(links.repo || links.live || links.extra?.length);

  return (
    <article aria-labelledby="project-title">
      <header className={styles.head}>
        <p className={styles.crumb}>
          <Link href="/work/">Work</Link>
        </p>
        <h1 id="project-title" className={styles.title}>
          {project.title}
        </h1>
        <p className={styles.summary}>{project.summary}</p>
        {project.significance ? <p className={styles.significance}>{project.significance}</p> : null}
        {hasLinks ? (
          <p className={styles.actions}>
            {links.live ? (
              <a className="button" href={links.live}>
                Open the live site
              </a>
            ) : null}
            {links.repo ? (
              <a className={`button ${links.live ? 'button-quiet' : ''}`} href={links.repo}>
                Read the source code
              </a>
            ) : null}
            {links.extra?.map((l) => (
              <a key={l.href} href={l.href} className={styles.extraLink}>
                {l.label}
              </a>
            ))}
          </p>
        ) : null}
      </header>

      {project.media.length ? (
        <section aria-label="Screenshots" className={styles.band} data-count={project.media.length}>
          <div className={styles.bandInner}>
            {project.media.map((m, i) => (
              <figure key={m.src} className={styles.shot} data-portrait={m.height > m.width ? '' : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.src}
                  alt={m.alt}
                  width={m.width}
                  height={m.height}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                {m.caption ? <figcaption>{m.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.layout}>
        <aside className={styles.aside} aria-label="Project facts">
          <dl className={styles.facts}>
            <div>
              <dt>My part</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>When</dt>
              <dd className="mono">{project.period}</dd>
            </div>
            <div>
              <dt>Built with</dt>
              <dd className="mono">{project.tech.join(', ')}</dd>
            </div>
            <div>
              <dt>Links</dt>
              <dd>
                {hasLinks ? (
                  <ul className={styles.links}>
                    {links.live ? (
                      <li>
                        <a href={links.live}>Live site</a>
                      </li>
                    ) : null}
                    {links.repo ? (
                      <li>
                        <a href={links.repo}>Source code</a>
                      </li>
                    ) : null}
                    {links.extra?.map((l) => (
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
          {caseStudy && caseStudy.headings.length > 1 ? (
            <nav aria-label="On this page" className={styles.toc}>
              <h2 className={styles.tocTitle}>On this page</h2>
              <ul>
                <li>
                  <a href="#highlights">At a glance</a>
                </li>
                {caseStudy.headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </aside>

        <div className={styles.main}>
          <section aria-labelledby="highlights" className={styles.glance}>
            <h2 id="highlights">At a glance</h2>
            <ul>
              {project.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>

          {caseStudy ? (
            <section aria-labelledby="case-study" className={styles.caseStudy}>
              <h2 id="case-study" className="visually-hidden">
                Case study
              </h2>
              <div dangerouslySetInnerHTML={{ __html: caseStudy.html }} />
            </section>
          ) : (
            <p className={styles.noCase}>
              {links.repo ? (
                <>
                  This project has no longer write-up here. The <a href={links.repo}>repository</a> covers how it
                  works in detail.
                </>
              ) : (
                'This project has no longer write-up here.'
              )}
            </p>
          )}
        </div>
      </div>

      <nav aria-label="More projects" className={styles.pager}>
        {prev ? (
          <Link href={`/work/${prev.slug}/`} rel="prev" className={styles.pagerLink}>
            <span className={styles.pagerLabel}>Previous project</span>
            <span className={styles.pagerTitle}>{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/work/${next.slug}/`} rel="next" className={`${styles.pagerLink} ${styles.pagerNext}`}>
            <span className={styles.pagerLabel}>Next project</span>
            <span className={styles.pagerTitle}>{next.title}</span>
          </Link>
        ) : null}
      </nav>
    </article>
  );
}
