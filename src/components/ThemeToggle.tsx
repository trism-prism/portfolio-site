'use client';

import { useSyncExternalStore } from 'react';
import { MoonIcon, SunIcon } from './Icons';
import styles from './Header.module.css';

// The <html> class is the source of truth: the head script sets it before paint and the button flips it.
const subscribe = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => mo.disconnect();
};

export function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains('light'), () => false);

  function toggle() {
    const next = !light;
    document.documentElement.classList.toggle('light', next);
    try {
      localStorage.setItem('theme', next ? 'light' : 'dark');
    } catch {
      // Storage can be blocked; the theme still switches for this visit.
    }
  }

  return (
    <button type="button" className={styles.iconBtn} onClick={toggle} aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}>
      {light ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
