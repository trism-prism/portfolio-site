import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import styles from './not-found.module.css';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className={styles.main}>
        <div className="wrap">
          <p className={`mono ${styles.eyebrow}`}>Error 404</p>
          <h1 className={styles.title}>Page not found</h1>
          <span className={styles.bar} aria-hidden="true" />
          <p className={styles.text}>There is nothing at this address. The home page has my experience, projects and contact details.</p>
          <Link href="/" className="btn btnSolid">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
