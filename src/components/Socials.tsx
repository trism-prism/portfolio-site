import { socials } from '../content/profile';
import { SocialIcon } from './brandIcons';
import styles from './Socials.module.css';

/** Square icon buttons. Slots with an empty url are not rendered. */
export function Socials({ size = 40 }: { size?: number }) {
  return (
    <ul className={styles.row}>
      {socials
        .filter((s) => s.url)
        .map((s) => (
          <li key={s.key}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={`${styles.tile} ${styles[s.key]}`}
              style={{ width: size, height: size }}
            >
              <SocialIcon name={s.key} size={Math.round(size * 0.5)} />
            </a>
          </li>
        ))}
    </ul>
  );
}
