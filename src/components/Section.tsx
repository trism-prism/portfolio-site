import type { ReactNode } from 'react';
import styles from './Section.module.css';

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  alt?: boolean;
  icon?: ReactNode;
  children: ReactNode;
};

/** Section shell: eyebrow, centered h2 with the accent bar, then the content. Alternates page and alt background. */
export function Section({ id, eyebrow, title, alt, icon, children }: Props) {
  return (
    <section id={id} className={`${styles.section} ${alt ? styles.alt : ''}`}>
      <div className="wrap">
        <header className={styles.head} data-reveal>
          <p className={`mono ${styles.eyebrow}`}>
            {icon}
            {eyebrow}
          </p>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.bar} aria-hidden="true" />
        </header>
        {children}
      </div>
    </section>
  );
}
