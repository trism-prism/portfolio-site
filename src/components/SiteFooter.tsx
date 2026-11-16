import { site } from '../site';
import { ContactLinks } from './ContactLinks';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer id="contact" className={styles.footer} aria-labelledby="contact-heading">
      <div className="wrap">
        <span className="rule" aria-hidden="true" />
        <h2 id="contact-heading" className={styles.heading}>
          Contact
        </h2>
        <p>
          I am looking for a software engineering internship. Email is the quickest way to reach me:{' '}
          <a href={site.links.email}>{site.email}</a>.
        </p>
        <div className={styles.links}>
          <ContactLinks label="Contact links" />
        </div>
        <p className={styles.small}>Leesburg, Virginia. Willing to relocate.</p>
      </div>
    </footer>
  );
}
