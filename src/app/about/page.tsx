import type { Metadata } from 'next';
import { education, experience, interests, intro, skills } from '@/content/profile';
import { site } from '@/site';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About',
  description: 'Background, experience, education, skills and interests.',
  alternates: { canonical: '/about/' },
};

export default function AboutPage() {
  return (
    <>
      <h1>About</h1>
      <div className="prose">
        {intro.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>

      <section aria-labelledby="experience" className="prose">
        <h2 id="experience">Experience</h2>
        {experience.map((e) => (
          <article key={`${e.org}-${e.role}`} className={styles.item}>
            <h3>
              {e.role}, {e.org}
            </h3>
            <p className="muted">
              {e.place} · {e.period}
            </p>
            <ul>
              {e.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section aria-labelledby="education" className="prose">
        <h2 id="education">Education</h2>
        {education.map((e) => (
          <div key={e.school} className={styles.item}>
            <h3>{e.school}</h3>
            <p>
              {e.credential} <span className="muted">· {e.period}</span>
            </p>
          </div>
        ))}
      </section>

      <section aria-labelledby="skills" className="prose">
        <h2 id="skills">Skills</h2>
        <dl className={styles.skills}>
          {skills.map((g) => (
            <div key={g.label}>
              <dt>{g.label}</dt>
              <dd>{g.items.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="interests" className="prose">
        <h2 id="interests">Interests</h2>
        <ul>
          {interests.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="documents" className="prose">
        <h2 id="documents">Documents</h2>
        <ul>
          <li>
            <a href={site.links.resume}>Résumé (PDF, one page)</a>
          </li>
          <li>
            <a href={site.links.cv}>CV (PDF, two pages, more projects in more detail)</a>
          </li>
        </ul>
      </section>
    </>
  );
}
