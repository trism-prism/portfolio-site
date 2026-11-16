'use client';

import { MoonIcon, SunIcon } from './Icons';
import styles from './Header.module.css';

// The <html> class is the source of truth. The head script sets it before paint and CSS picks the icon,
// so the server HTML and a light-theme load never disagree. The label does not depend on the theme.
export function ThemeToggle() {
  function toggle() {
    const light = document.documentElement.classList.toggle('light');
    try {
      localStorage.setItem('theme', light ? 'light' : 'dark');
    } catch {
      // Storage can be blocked; the theme still switches for this visit.
    }
  }

  return (
    <button type="button" className={`${styles.iconBtn} ${styles.theme}`} onClick={toggle} aria-label="Toggle light and dark theme">
      <span className={styles.sun}>
        <SunIcon />
      </span>
      <span className={styles.moon}>
        <MoonIcon />
      </span>
    </button>
  );
}
