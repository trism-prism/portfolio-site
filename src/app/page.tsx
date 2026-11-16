import Link from 'next/link';
import { ContactLinks } from '../components/ContactLinks';
import { Frame } from '../components/Frame';
import { Section } from '../components/Section';
import { SiteFooter } from '../components/SiteFooter';
import { moreWork, projects } from '../content/projects';
import { LanternScene } from '../scene/LanternScene';
import { site } from '../site';
import styles from './page.module.css';

export default function Home() {
  return (
    <>
      <header className={styles.hero}>
        <LanternScene />
        <div className="wrap">
          <div className={styles.intro}>
            <h1>{site.name}</h1>
            <p className={styles.lede}>
              I am a student at James Madison University looking for a software engineering internship, and I build things
              that run end to end, from a C++ lighting engine to a study planner that works offline.
            </p>
            <ContactLinks label="Links" />
          </div>
        </div>
      </header>

      <main id="main">
        <Section id="work" title="Selected work">
          <ol className={styles.projects}>
            {projects.map((p) => (
              <li key={p.slug} className={styles.project}>
                <div className={styles.projectText}>
                  <h3>
                    <Link href={`/work/${p.slug}/`}>{p.title}</Link>
                  </h3>
                  <p>{p.summary}</p>
                  <ul className={styles.inline}>
                    <li>
                      <Link href={`/work/${p.slug}/`}>
                        Read the case study<span className="visually-hidden">: {p.title}</span>
                      </Link>
                    </li>
                    {p.links.live && (
                      <li>
                        <a href={p.links.live}>
                          Live site<span className="visually-hidden"> for {p.title} (external)</span>
                        </a>
                      </li>
                    )}
                    {p.links.repo && (
                      <li>
                        <a href={p.links.repo}>
                          Code<span className="visually-hidden"> for {p.title} on GitHub (external)</span>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
                <div className={styles.projectImage}>
                  <Frame img={p.images[p.lead]} sizes="(min-width: 64rem) 36rem, 90vw" />
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="more-work" title="More work">
          <ul className={styles.more}>
            {moreWork.map((m) => (
              <li key={m.name}>
                <h3>{m.name}</h3>
                <p>{m.text}</p>
                {m.links.length > 0 && (
                  <ul className={styles.inline}>
                    {m.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href}>
                          {l.label}
                          <span className="visually-hidden"> for {m.name} (external)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Section>

        <Section id="experience" title="Experience">
          <div className={styles.entries}>
            <div>
              <h3>Software Engineering &amp; AI Systems Intern, Formwork</h3>
              <p className={styles.meta}>Remote. September 2026 to present.</p>
              <p>
                I work on a multi-tenant project management platform. I connected a custom AI agent to it over MCP, ran a
                500+ case QA pass that turned up an authentication bug in the Next.js gateway, and built search filtering
                across the React and Spring Boot modules that shipped to production. I work with a team of 7 engineers on its
                GitHub Actions pipeline.
              </p>
            </div>
            <div>
              <h3>James Madison University</h3>
              <p className={styles.meta}>B.B.A. in Computer Information Systems. Expected December 2027.</p>
              <p>
                Before JMU I studied at Northern Virginia Community College from 2023 to 2024 and made the Dean&rsquo;s List.
              </p>
            </div>
          </div>
        </Section>

        <Section id="about" title="About">
          <div className={styles.about}>
            <p>
              I am a Computer Information Systems student at James Madison University, based in Leesburg, Virginia, and I am
              looking for a software engineering internship.
            </p>
            <p>
              I like work where the result can be checked, so my projects come with benchmarks, held-out test sets or written
              notes on what went wrong. I use TypeScript, Python, C++ and C# most, and I have taken projects from a low-level
              C++ engine to deployed web apps with their own databases.
            </p>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
