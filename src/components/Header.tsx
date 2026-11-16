'use client';
/* eslint-disable @next/next/no-html-link-for-pages -- plain anchors keep the browser's smooth in-page scrolling; Link would jump. */

import { useEffect, useRef, useState } from 'react';
import { MenuIcon, CloseIcon } from './Icons';
import { ThemeToggle } from './ThemeToggle';
import styles from './Header.module.css';

// Absolute `/#id` hrefs so the same links work on the 404 page. On the home page the browser treats them as in-page jumps.
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
  const burger = useRef<HTMLButtonElement>(null);

  // Scroll-spy: a thin band near the top of the viewport; the section crossing it is current.
  useEffect(() => {
    const inBand = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        // Two sections can touch the band at a boundary; the later one in page order is the one being entered.
        const current = sectionIds.filter((id) => inBand.has(id)).pop();
        if (current) setActive(spyTargets[current] ?? current);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        burger.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.bar}`}>
        <a href="/#hero" className={styles.logo} onClick={() => setOpen(false)}>
          Tristan<span>.</span>
        </a>
        <nav id="primary-nav" className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Primary">
          {links.map((l) => (
            <a
              key={l.id}
              href={`/#${l.id}`}
              className={`${styles.link} ${active === l.id ? styles.active : ''}`}
              aria-current={active === l.id ? 'true' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a href="/#contact" className={`btn btnOutline ${styles.talkMobile}`} onClick={() => setOpen(false)}>
            Let&apos;s Talk
          </a>
        </nav>
        <div className={styles.right}>
          <span className={styles.divider} aria-hidden="true" />
          <ThemeToggle />
          <a href="/#contact" className={`btn btnOutline ${styles.talk}`}>
            Let&apos;s Talk
          </a>
          <button
            ref={burger}
            type="button"
            className={`${styles.iconBtn} ${styles.burger}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="primary-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
