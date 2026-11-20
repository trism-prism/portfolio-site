import Link from 'next/link';
import FeaturedViewer from '@/components/FeaturedViewer';
import ProjectEntry from '@/components/ProjectEntry';
import { experience, intro } from '@/content/profile';
import { featuredProjects, publicProjects } from '@/lib/projects';
import { site } from '@/site';
import styles from './home.module.css';

export default function HomePage() {
  const featured = featuredProjects();
  const more = publicProjects().filter((p) => p.visibility !== 'featured');
  const total = featured.length + more.length;
  const current = experience[0];

  // Source order is name, selected work, introduction: on a phone the work arrives right after the
  // name. On wide screens the grid puts the introduction beside the viewer instead.
  return (
    <>
      <section aria-labelledby="intro" className={styles.entry}>
        <div className={styles.identity}>
          <h1 id="intro" className={styles.name}>
            {site.name}
          </h1>
          <p className={styles.position}>{intro.headline}</p>
        </div>

        <div className={styles.viewer}>
          <FeaturedViewer
            label="Selected work"
            items={featured.map((p) => ({
              slug: p.slug,
              title: p.title,
              period: p.period,
              summary: p.significance ?? p.summary,
              media: p.preview ?? p.media[0],
            }))}
          />
        </div>

        <div className={styles.about}>
          {intro.paragraphs.map((p) => (
            <p key={p} className={styles.intro}>
              {p}
            </p>
          ))}
        </div>
      </section>

      <section aria-labelledby="index" className={styles.index}>
        <div className={styles.indexHead}>
          <h2 id="index">Index of work</h2>
          <p className="muted">{total} projects across software, AI, systems and data.</p>
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Featured</h3>
          {featured.map((p) => (
            <ProjectEntry key={p.id} project={p} headingLevel={4} />
          ))}
        </div>

        {more.length ? (
          <div className={styles.group}>
            <h3 className={styles.groupTitle}>More work, newest first</h3>
            {more.map((p) => (
              <ProjectEntry key={p.id} project={p} headingLevel={4} />
            ))}
          </div>
        ) : null}
      </section>

      {current ? (
        <section aria-labelledby="now" className={styles.now}>
          <h2 id="now">Now</h2>
          <p>
            {current.role} at {current.org} ({current.period}). Background, education and skills are on the{' '}
            <Link href="/about/">About page</Link>.
          </p>
        </section>
      ) : null}
    </>
  );
}
