import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FacetMark } from '../../../components/FacetMark';
import { Frame } from '../../../components/Frame';
import { Section } from '../../../components/Section';
import { SiteFooter } from '../../../components/SiteFooter';
import { projectBySlug, projects, type Project } from '../../../content/projects';
import styles from './page.module.css';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = projectBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/work/${p.slug}/` },
    openGraph: { title: `${p.title} | Tristan Morton`, description: p.summary, url: `/work/${p.slug}/` },
  };
}

function Figures({ project, ids }: { project: Project; ids: number[] }) {
  if (!ids.length) return null;
  return (
    <div className={styles.figures}>
      {ids.map((i) => (
        <Frame key={i} img={project.images[i]} sizes="(min-width: 64rem) 30rem, 90vw" />
      ))}
    </div>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();
  const index = projects.indexOf(project);
  const prev = projects[index - 1];
  const next = projects[index + 1];
  const lead = project.images[project.lead];
  const placed = new Set([project.lead, ...project.sections.flatMap((s) => s.figures ?? [])]);
  const extras = project.images.map((_, i) => i).filter((i) => !placed.has(i));

  return (
    <>
      <header className={styles.top}>
        <div className="wrap">
          <Link href="/" className={styles.home}>
            <FacetMark size={22} />
            Tristan Morton
          </Link>
        </div>
      </header>
      <main id="main">
        <article>
          <div className="wrap">
            <div className={`${styles.opening} ${project.layout === 'split' ? styles.split : styles.wide}`}>
              <div className={styles.openingText}>
                <p className={styles.crumb}>
                  <Link href="/#work">All work</Link>
                </p>
                <h1 className={styles.title}>{project.title}</h1>
                <p className={styles.lede}>{project.standfirst}</p>
                <ul className={styles.links}>
                  {project.links.live && (
                    <li>
                      <a href={project.links.live}>
                        Live site<span className="visually-hidden"> (external site)</span>
                      </a>
                    </li>
                  )}
                  {project.links.repo && (
                    <li>
                      <a href={project.links.repo}>
                        Code on GitHub<span className="visually-hidden"> (external site)</span>
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              <div className={styles.lead}>
                <Frame img={lead} priority sizes={project.layout === 'split' ? '(min-width: 64rem) 38rem, 90vw' : '(min-width: 64rem) 70rem, 90vw'} caption={false} />
              </div>
            </div>
          </div>

          {project.sections.map((s) => (
            <Section key={s.title} title={s.title} layout="wide-side" tight>
              <div className={styles.copy}>
                {s.body.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
              </div>
              <Figures project={project} ids={s.figures ?? []} />
            </Section>
          ))}
          {extras.length > 0 && (
            <div className="wrap">
              <Figures project={project} ids={extras} />
            </div>
          )}

          <div className="wrap">
            <p className={styles.closing}>{project.closing}</p>
          </div>
        </article>

        <nav aria-label="More projects" className={styles.pager}>
          <div className="wrap">
            <ul>
              <li>
                {prev && (
                  <Link href={`/work/${prev.slug}/`}>
                    <span className={styles.dir}>Previous</span>
                    <span className={styles.name}>{prev.title}</span>
                  </Link>
                )}
              </li>
              <li>
                {next && (
                  <Link href={`/work/${next.slug}/`} className={styles.nextLink}>
                    <span className={styles.dir}>Next</span>
                    <span className={styles.name}>{next.title}</span>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
