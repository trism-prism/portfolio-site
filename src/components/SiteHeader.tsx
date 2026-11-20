import Link from 'next/link';
import { nav, site } from '@/site';
import NavLinks from './NavLinks';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.name}>
          {site.name}
        </Link>
        <nav aria-label="Main">
          <NavLinks items={nav} resumeHref={site.links.resume} />
        </nav>
      </div>
    </header>
  );
}
