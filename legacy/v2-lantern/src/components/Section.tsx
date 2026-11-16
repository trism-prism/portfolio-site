import type { ReactNode } from 'react';
import styles from './Section.module.css';

type Props = {
  id?: string;
  title: string;
  children: ReactNode;
  /** `side`: heading in a narrow left column. `stacked`: heading above full-width content. `wide-side`: wider left column for long titles. */
  layout?: 'side' | 'stacked' | 'wide-side';
  tight?: boolean;
  level?: 2 | 3;
};

/** A page section: heading with the embroidery rule, content beside or below it. */
export function Section({ id, title, children, layout = 'side', tight = false, level = 2 }: Props) {
  const headId = `${id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-heading`;
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <section id={id} aria-labelledby={headId} className={`${tight ? styles.tight : styles.section} ${styles[layout === 'wide-side' ? 'wideSide' : layout]}`}>
      <div className="wrap">
        <div className={styles.grid}>
          <div className={styles.head}>
            <span className="rule" aria-hidden="true" />
            <Heading id={headId}>{title}</Heading>
          </div>
          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </section>
  );
}
