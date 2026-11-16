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
          <div className={styles.heroGrid}>
            <div className={styles.intro}>
              <h1>{site.name}</h1>
              <p className={styles.lede}>
                I study Computer Information Systems at James Madison University and work as a software engineering intern at
                Formwork. I&rsquo;m looking for a software engineering internship.
              </p>
              <p className={styles.note}>
                The light above uses the same idea as the C++ visibility engine I wrote, in a simpler form, so you can move the
                lantern and the shadows follow.
              </p>
              <div className={styles.links}>
                <ContactLinks label="Links" />
              </div>
            </div>
            <div className={styles.facts}>
              <span className="rule" aria-hidden="true" />
              <dl>
                <div>
                  <dt>Studying</dt>
                  <dd>Computer Information Systems, James Madison University (B.B.A., expected December 2027)</dd>
                </div>
                <div>
                  <dt>Working</dt>
                  <dd>Software Engineering &amp; AI Systems Intern, Formwork (since September 2026)</dd>
                </div>
                <div>
                  <dt>Based</dt>
                  <dd>Leesburg, Virginia</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        <Section id="work" title="Selected work" layout="stacked">
          <ol className={styles.projects}>
            {projects.map((p) => (
              <li key={p.slug} className={styles.project}>
                <div className={styles.projectText}>
                  <h3>
                    <Link href={`/work/${p.slug}/`}>{p.title}</Link>
                  </h3>
                  <p>{p.summary}</p>
                </div>
                <Link href={`/work/${p.slug}/`} tabIndex={-1} aria-hidden="true" className={styles.projectImage}>
                  <Frame img={p.images[p.lead]} sizes="(min-width: 64rem) 36rem, 90vw" caption={false} />
                </Link>
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
                          <span className="visually-hidden"> for {m.name} (external site)</span>
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
                I work on Formwork&rsquo;s multi-tenant project management platform. I connected an AI agent to it over MCP, and
                before a release I ran a QA pass that turned up an authentication caching bug in the Next.js gateway. I also
                built a search filtering feature across the React front end and the Spring Boot back end, which shipped to
                production.
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
              I&rsquo;m based in Leesburg, Virginia, and I&rsquo;m looking for a software engineering internship. I&rsquo;m
              willing to relocate.
            </p>
            <p>
              I like work whose result can be checked. The lighting engine has a committed benchmark and a decision log, and
              the document Q&amp;A project has a held-out test set and a page of its own failures. My projects are written in
              C++, TypeScript, Python, C# and C, and they run from a low-level engine to deployed web apps with their own
              databases.
            </p>
          </div>
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
