'use client';

import { useEffect, useState } from 'react';
import { MenuIcon, CloseIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

const links = [
  { id: 'hero', label: 'Home' },
  { id: 'experience', label: '/Experience' },
  { id: 'skills', label: '/Skills' },
  { id: 'projects', label: '/Projects' },
  { id: 'education', label: '/Education' },
  { id: 'publications', label: '/Publications' },
];

// Sections without their own link light up the nearest one.
const spyTargets: Record<string, string> = { dsa: 'skills', certifications: 'publications' };
const sectionIds = ['hero', 'experience', 'skills', 'dsa', 'projects', 'education', 'publications', 'certifications', 'contact'];

export function Header() {
  const [active, setActive] = useState('hero');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        let best = '';
        let bestRatio = 0;
        for (const [id, ratio] of visible) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        if (best) setActive(spyTargets[best] ?? best);
      },
      { rootMargin: '-80px 0px -40% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <a href="#hero" className={styles.logo} onClick={() => setOpen(false)}>
          Tristan<span>.</span>
        </a>
        <nav className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`${styles.link} ${active === l.id ? styles.active : ''}`}
              aria-current={active === l.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a href="#contact" className={`btn btnOutline ${styles.talkMobile}`} onClick={() => setOpen(false)}>
            Let&apos;s Talk
          </a>
        </nav>
        <div className={styles.right}>
          <span className={styles.divider} aria-hidden="true" />
          <ThemeToggle />
          <a href="#contact" className={`btn btnOutline ${styles.talk}`}>
            Let&apos;s Talk
          </a>
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.burger}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
