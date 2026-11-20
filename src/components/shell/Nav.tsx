'use client';

import { useEffect, useRef, useState } from 'react';
import { sections } from '@/data/sections';
import { emit, goTo } from '@/lib/nav';
import { announceActive } from '@/components/ui/Mascot';
import { PrismMark } from '@/components/ui/Prism';
import { Icon } from '@/components/ui/Icon';

const primary = sections.filter((s) => s.primary && s.id !== 'contact');
const more = sections.filter((s) => !s.primary);

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>('hero');
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Active section: the one crossing a band 35% from the top.
  useEffect(() => {
    const els = ['hero', ...sections.map((s) => s.id)].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-35% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => announceActive(active), [active]);

  useEffect(() => {
    if (!moreOpen) return;
    const onDown = (e: PointerEvent) => !moreRef.current?.contains(e.target as Node) && setMoreOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        moreRef.current?.querySelector('button')?.focus();
      }
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const link = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMoreOpen(false);
    setMobileOpen(false);
    goTo(id);
  };

  const navBtn = (id: string, label: string) => (
    <a
      key={id}
      href={`#${id}`}
      onClick={link(id)}
      aria-current={active === id ? 'location' : undefined}
      className={`rounded-lg px-3 py-2 text-[14.5px] font-medium transition-colors ${active === id ? 'bg-panel-2 text-fg' : 'text-fg-2 hover:text-fg'}`}
    >
      {label}
    </a>
  );

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 transition-[background,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-b border-line bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="wrap flex h-full items-center gap-3">
        <a href="#hero" onClick={link('hero')} className="rounded-xl border border-line-2 bg-panel p-1" aria-label="Tristan Morton, back to top" data-annotate="mark">
          <PrismMark size={34} animated />
        </a>
        <nav aria-label="Sections" className="ml-auto hidden items-center gap-1 lg:flex">
          {primary.map((s) => navBtn(s.id, s.nav))}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[14.5px] font-medium ${
                more.some((s) => s.id === active) || moreOpen ? 'bg-panel-2 text-fg' : 'text-fg-2 hover:text-fg'
              }`}
            >
              More <Icon name="chevronDown" size={15} />
            </button>
            {moreOpen && (
              <div className="panel anim-pop absolute right-0 top-12 w-52 p-1.5 shadow-xl" style={{ background: 'var(--panel)' }}>
                {more.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={link(s.id)}
                    aria-current={active === s.id ? 'location' : undefined}
                    className={`block rounded-md px-3 py-2 text-sm ${active === s.id ? 'bg-panel-2 text-fg' : 'text-fg-2 hover:bg-panel-2 hover:text-fg'}`}
                  >
                    {s.nav}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-3">
          <button
            type="button"
            onClick={() => emit({ type: 'annotations' })}
            className="mono hidden h-9 items-center gap-2 rounded-lg border border-line-2 px-3 text-[12px] text-fg-2 hover:text-fg xl:flex"
          >
            <Icon name="info" size={15} /> How it&apos;s built
          </button>
          <button
            type="button"
            onClick={() => emit({ type: 'palette' })}
            data-annotate="palette"
            aria-label="Open command palette"
            className="mono flex h-9 items-center gap-2 rounded-lg border border-line-2 px-3 text-[12px] text-fg-2 hover:text-fg"
          >
            <Icon name="search" size={15} />
            <span className="hidden sm:inline">{isMac ? '⌘ K' : 'Ctrl K'}</span>
          </button>
          <a href="#contact" onClick={link('contact')} className="hidden h-10 items-center rounded-lg bg-fg px-4 text-sm font-semibold text-bg sm:flex">
            Contact me
          </a>
          <button
            type="button"
            className="icon-btn h-10 w-10 lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Sections"
          className="anim-fade fixed inset-x-0 bottom-0 top-16 z-50 overflow-y-auto border-t border-line p-4 lg:hidden"
          style={{ background: 'var(--bg)' }}
        >
          <ul className="grid gap-1">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={link(s.id)}
                  aria-current={active === s.id ? 'location' : undefined}
                  className="flex items-baseline gap-3 rounded-lg px-3 py-3 text-lg font-medium text-fg-2 hover:bg-panel hover:text-fg aria-[current]:text-fg"
                >
                  <span className="mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                  {s.nav}
                </a>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => { setMobileOpen(false); emit({ type: 'annotations' }); }} className="btn mt-4 w-full">
            <Icon name="info" /> How it&apos;s built
          </button>
        </nav>
      )}
    </header>
  );
}
