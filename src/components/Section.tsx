import type { ReactNode } from 'react';
import styles from './Section.module.css';

/** A page section: heading with the embroidery rule on the left, content on the right (stacked on phones). */
export function Section({ id, title, children, tight = false }: { id?: string; title: string; children: ReactNode; tight?: boolean }) {
  const headId = `${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-heading`;
  return (
    <section id={id} aria-labelledby={headId} className={tight ? styles.tight : styles.section}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.head}>
            <span className="rule" aria-hidden="true" />
            <h2 id={headId}>{title}</h2>
          </div>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </section>
  );
}
