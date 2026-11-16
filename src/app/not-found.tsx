import type { Metadata } from 'next';
import Link from 'next/link';
import { FacetMark } from '../components/FacetMark';
import { SiteFooter } from '../components/SiteFooter';
import styles from './not-found.module.css';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <main id="main" className={styles.main}>
        <div className="wrap">
          <FacetMark size={40} />
          <h1>Page not found</h1>
          <p>There is nothing at this address. The home page has my projects and contact details.</p>
          <p>
            <Link href="/">Back to the home page</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
