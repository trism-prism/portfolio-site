import Link from 'next/link';
import ProjectEntry from '@/components/ProjectEntry';
import { experience, intro } from '@/content/profile';
import { featuredProjects, publicProjects } from '@/lib/projects';
import { site } from '@/site';

export default function HomePage() {
  const featured = featuredProjects();
  const total = publicProjects().length;
  const current = experience[0];

  return (
    <>
      <section aria-labelledby="intro" className="prose">
        <h1 id="intro">{site.name}</h1>
        <p>
          <strong>{intro.headline}</strong>
        </p>
        {intro.paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </section>

      <section aria-labelledby="selected-work">
        <h2 id="selected-work">Selected work</h2>
        {featured.map((p) => (
          <ProjectEntry key={p.id} project={p} />
        ))}
        <p>
          <Link href="/work/">All {total} projects</Link>
        </p>
      </section>

      <section aria-labelledby="now" className="prose">
        <h2 id="now">Now</h2>
        {current ? (
          <p>
            {current.role} at {current.org} ({current.period}). <Link href="/about/">Background, education and skills</Link>
          </p>
        ) : null}
      </section>

      <section aria-labelledby="elsewhere" className="prose">
        <h2 id="elsewhere">Elsewhere</h2>
        <ul>
          <li>
            <a href={site.links.github}>GitHub</a>
          </li>
          <li>
            <a href={site.links.linkedin}>LinkedIn</a>
          </li>
          <li>
            <a href={site.links.resume}>Résumé (PDF)</a> or the longer <a href={site.links.cv}>CV (PDF)</a>
          </li>
          <li>
            <Link href="/contact/">Contact</Link>
          </li>
        </ul>
      </section>
    </>
  );
}
