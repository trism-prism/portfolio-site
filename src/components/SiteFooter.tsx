import { site } from '@/site';
import MotionControl from './MotionControl';
import styles from './SiteFooter.module.css';

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <ul className={styles.links} aria-label="Elsewhere">
          <li>
            <a href={site.links.github}>GitHub</a>
          </li>
          <li>
            <a href={site.links.linkedin}>LinkedIn</a>
          </li>
          <li>
            <a href={site.links.resume}>
              Résumé <span className="visually-hidden">(PDF)</span>
            </a>
          </li>
          <li>
            <a href={site.links.cv}>
              CV <span className="visually-hidden">(PDF)</span>
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
        </ul>
        <div className={styles.motion}>
          <MotionControl />
        </div>
      </div>
    </footer>
  );
}
