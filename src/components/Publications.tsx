'use client';

import Image from 'next/image';
import { useState } from 'react';
import { certifications } from '../content/certifications';
import { publications, type Publication } from '../content/publications';
import { AwardIcon, BookIcon, ExternalIcon } from './Icons';
import { Section } from './Section';
import styles from './Publications.module.css';

function Paper({ pub }: { pub: Publication }) {
  const [full, setFull] = useState(false);
  const rows: [string, string][] = [
    ['Publisher', pub.publisher],
    ['Date', pub.date],
    ['Conference', pub.conference],
    ['DOI', pub.doi],
  ];
  return (
    <article className={`card ${styles.paper}`} data-reveal>
      <div className={styles.side}>
        {pub.image && <Image src={pub.image} alt="" width={480} height={320} className={styles.img} />}
        <p className="subLabel">Authors</p>
        <ul className="chips">
          {pub.authors.map((a) => (
            <li key={a} className="chip chipAccent">
              {a}
            </li>
          ))}
        </ul>
        <a href={pub.link} target="_blank" rel="noopener noreferrer" className={`btn btnSolid ${styles.read}`}>
          Read Paper <ExternalIcon size={14} />
        </a>
      </div>
      <div className={styles.main}>
        <h3 className={styles.title}>{pub.title}</h3>
        <dl className={styles.meta}>
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="subLabel">Abstract</p>
        <p className={`${styles.abstract} ${full ? '' : styles.clamp}`}>{pub.abstract}</p>
        <button type="button" className={styles.more} aria-expanded={full} onClick={() => setFull(!full)}>
          {full ? 'Show Less' : 'Read Full Abstract'}
        </button>
      </div>
    </article>
  );
}

export function Publications() {
  return (
    <>
      <Section id="publications" eyebrow="Research & Papers" title="My Publications" icon={<BookIcon size={16} />}>
        {publications.length ? (
          <div className={styles.list}>
            {publications.map((p) => (
              <Paper key={p.id} pub={p} />
            ))}
          </div>
        ) : (
          <p className={`card empty ${styles.emptyCard}`} data-reveal>
            Publications coming soon.
          </p>
        )}
      </Section>
      <Section id="certifications" eyebrow="Credentials" title="My Certifications" icon={<AwardIcon size={16} />}>
        {certifications.length ? (
          <ul className={styles.certs}>
            {certifications.map((c) => (
              <li key={c.id} className={`card ${styles.cert}`} data-reveal>
                {c.image && <Image src={c.image} alt="" width={640} height={400} className={styles.img} />}
                <div className={styles.certBody}>
                  <div className={styles.certHead}>
                    <h3 className={styles.title}>{c.title}</h3>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="extLink" aria-label={`Verify ${c.title}`}>
                        <ExternalIcon size={16} />
                      </a>
                    )}
                  </div>
                  <p className={styles.issuer}>
                    {c.issuer} <span className="mono">· {c.date}</span>
                  </p>
                  <p className={styles.abstract}>{c.description}</p>
                  <ul className="chips">
                    {c.skills.map((s) => (
                      <li key={s} className="chip">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`card empty ${styles.emptyCard}`} data-reveal>
            Certifications coming soon.
          </p>
        )}
      </Section>
    </>
  );
}
