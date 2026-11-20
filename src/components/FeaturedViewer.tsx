'use client';

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Media } from '@/content/types';
import styles from './FeaturedViewer.module.css';

export type ViewerItem = {
  slug: string;
  title: string;
  period: string;
  summary: string;
  media?: Media;
};

/**
 * Selected work shown one at a time beside the introduction. A tab list (WAI-ARIA tabs pattern,
 * vertical, automatic activation) chooses which project the panel shows. Without JavaScript the
 * first project is shown and the full index below links to every project.
 */
export default function FeaturedViewer({ items, label }: { items: ViewerItem[]; label: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  function select(i: number, focus = false) {
    const next = (i + items.length) % items.length;
    setActive(next);
    if (focus) tabs.current[next]?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const keys: Record<string, () => void> = {
      ArrowDown: () => select(i + 1, true),
      ArrowRight: () => select(i + 1, true),
      ArrowUp: () => select(i - 1, true),
      ArrowLeft: () => select(i - 1, true),
      Home: () => select(0, true),
      End: () => select(items.length - 1, true),
    };
    const run = keys[e.key];
    if (run) {
      e.preventDefault();
      run();
    }
  }

  return (
    <section className={styles.viewer} aria-label={label}>
      {items.map((item, i) => (
        <div
          key={item.slug}
          id={`${base}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${i}`}
          hidden={i !== active}
          className={styles.panel}
        >
          <div className={styles.frame}>
            {item.media ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.media.src}
                alt={item.media.alt}
                width={item.media.width}
                height={item.media.height}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ) : (
              <p className={styles.noMedia}>{item.title}</p>
            )}
          </div>
          <div className={styles.caption}>
            <p>{item.summary}</p>
            <Link href={`/work/${item.slug}/`} className={styles.open}>
              Read about {item.title}
            </Link>
          </div>
        </div>
      ))}

      <div role="tablist" aria-label={label} aria-orientation="vertical" className={styles.tabs}>
        {items.map((item, i) => (
          <button
            key={item.slug}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            id={`${base}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => select(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={styles.tab}
          >
            <span className={styles.tabTitle}>{item.title}</span>
            <span className={styles.tabMeta}>{item.period}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
