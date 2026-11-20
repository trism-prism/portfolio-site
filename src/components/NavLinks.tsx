'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SiteHeader.module.css';

type Item = { href: string; label: string };

const trim = (p: string) => p.replace(/\/+$/, '') || '/';

/** Current for the section itself and anything under it (/work/ covers /work/kiln/). */
function isCurrent(pathname: string, href: string) {
  const path = trim(pathname);
  const base = trim(href);
  return path === base || path.startsWith(`${base}/`);
}

export default function NavLinks({ items, resumeHref }: { items: readonly Item[]; resumeHref: string }) {
  const pathname = usePathname() ?? '/';
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href} aria-current={isCurrent(pathname, item.href) ? 'page' : undefined}>
            {item.label}
          </Link>
        </li>
      ))}
      <li>
        <a href={resumeHref}>
          Résumé <span className="visually-hidden">(PDF)</span>
        </a>
      </li>
    </ul>
  );
}
