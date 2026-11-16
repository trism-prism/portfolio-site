import { profile, socials } from '../content/profile';
import { SocialIcon } from './brandIcons';
import styles from './Footer.module.css';

export function Footer() {
  const links = socials.filter((s) => s.url);
  return (
    <footer className={styles.footer}>
      <div className="wrap">
        <div className={styles.top}>
          <div>
            <p className={styles.logo}>
              Tristan<span>.</span>
            </p>
            <p className={styles.blurb}>{profile.intro.map((p) => p.text).join('')}</p>
          </div>
          <div>
            <h3 className={`mono ${styles.label}`}>Socials</h3>
            <ul className={styles.links}>
              {links.map((s) => (
                <li key={s.key}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    <SocialIcon name={s.key} size={16} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className={styles.copy}>© 2026 {profile.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
