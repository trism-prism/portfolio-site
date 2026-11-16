import { education } from '../content/education';
import { CalendarIcon, CapIcon, ExternalIcon } from './Icons';
import { Section } from './Section';
import styles from './Education.module.css';

export function Education() {
  const [main, ...others] = education;
  return (
    <Section id="education" alt eyebrow="Academic Journey" title="My Education">
      <div className={styles.stack}>
        <article className={`card ${styles.main}`} data-reveal>
          <div className={styles.head}>
            <span className={styles.icon}>
              <CapIcon size={26} />
            </span>
            <div className={styles.titles}>
              <h3 className={styles.degree}>{main.degree}</h3>
              <p className={styles.school}>
                {main.url ? (
                  <a href={main.url} target="_blank" rel="noopener noreferrer" className="extLink">
                    {main.school} <ExternalIcon size={13} />
                  </a>
                ) : (
                  main.school
                )}
              </p>
            </div>
            <span className="pill pillAccent">
              <CalendarIcon size={14} />
              {main.dates}
            </span>
          </div>
          <p className={styles.desc}>{main.description}</p>
          {main.coursework.length > 0 && (
            <>
              <p className="subLabel">Relevant coursework</p>
              <ul className={`chips ${styles.course}`}>
                {main.coursework.map((c) => (
                  <li key={c} className="chip chipAccent">
                    {c}
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
        <div className={styles.more}>
          {others.map((e) => (
            <article key={e.id} className={`card ${styles.small}`} data-reveal>
              <span className={styles.icon}>
                <CapIcon size={22} />
              </span>
              <div>
                <h3 className={styles.degreeSm}>{e.degree}</h3>
                <p className={styles.school}>{e.school}</p>
                <p className={`mono ${styles.when}`}>
                  <CalendarIcon size={13} /> {e.dates}
                </p>
                {e.description && <p className={styles.desc}>{e.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
