'use client';

import { useEffect, useRef, useState } from 'react';
import { useMedia } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';

export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="dots" />
      <div className="glow g1" />
      <div className="glow g2" />
      <div className="glow g3" />
      <div className="beam" />
      <div className="beam b2" />
      <div className="vignette" />
    </div>
  );
}

export function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed left-0 top-0 z-[55] h-[2px] w-full origin-left"
      style={{ background: 'linear-gradient(90deg, var(--accent), var(--violet))', transform: 'scaleX(0)' }}
    />
  );
}

// Floating technology tiles in the page margins. Abbreviations rather than brand logos.
type Tile = { label: string; color: string; side: 'l' | 'r'; x: number; y: number };
const TILES: Tile[] = [
  { label: 'TS', color: '#60a5fa', side: 'l', x: 22, y: 18 },
  { label: 'Py', color: '#facc15', side: 'l', x: 58, y: 30 },
  { label: 'C++', color: '#93c5fd', side: 'l', x: 18, y: 43 },
  { label: '⚛', color: '#67e8f9', side: 'l', x: 60, y: 56 },
  { label: 'pg', color: '#7dd3fc', side: 'l', x: 26, y: 70 },
  { label: 'C#', color: '#c4b5fd', side: 'l', x: 54, y: 84 },
  { label: 'N', color: '#e5e7eb', side: 'r', x: 30, y: 16 },
  { label: '{ }', color: '#5eead4', side: 'r', x: 62, y: 29 },
  { label: 'K', color: '#fca5a5', side: 'r', x: 22, y: 42 },
  { label: '◈', color: '#a78bfa', side: 'r', x: 58, y: 57 },
  { label: '▲', color: '#e5e7eb', side: 'r', x: 26, y: 71 },
  { label: '⎇', color: '#fb923c', side: 'r', x: 60, y: 85 },
];

export function TechField() {
  const wide = useMedia('(min-width: 1280px)');
  const compact = useMedia('(min-width: 768px)');
  const { reduced } = useMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(1);

  useEffect(() => {
    if (!wide) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const prog = max > 0 ? y / max : 0;
      setFade(prog > 0.95 ? Math.max(0, 1 - (prog - 0.95) / 0.04) : 1);
      if (reduced) return;
      el.style.setProperty('--sl', `${-(y * 0.32) % window.innerHeight}px`);
      el.style.setProperty('--sr', `${-(y * 0.38) % window.innerHeight}px`);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [wide, reduced]);

  if (!compact) return null;
  const tiles = wide ? TILES : TILES.filter((_, i) => i % 2 === 0);
  const size = wide ? 44 : 32;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-annotate="field"
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-500"
      style={{ opacity: fade }}
    >
      {(['l', 'r'] as const).map((side) => (
        <div
          key={side}
          className="absolute top-0 h-[200vh]"
          style={{
            [side === 'l' ? 'left' : 'right']: 0,
            width: wide ? 'calc((100vw - 1152px) / 2)' : 56,
            transform: `translateY(var(--s${side}, 0px))`,
            maskImage: 'linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent)',
          }}
        >
          {[0, 1].map((rep) =>
            tiles
              .filter((t) => t.side === side)
              .map((t, i) => (
                <div
                  key={`${rep}-${t.label}`}
                  className="field-tile"
                  style={{
                    width: size,
                    height: size,
                    borderRadius: wide ? 12 : 9,
                    fontSize: wide ? 15 : 12,
                    color: t.color,
                    left: wide ? `${t.x}%` : 12,
                    top: `${(t.y + rep * 100) / 2}%`,
                    animationDelay: `${Math.min(0.3, i * 0.05) + 1}s, ${i * -1.7}s`,
                    ['--dur' as string]: `${9 + ((i * 7) % 6)}s`,
                  }}
                >
                  {t.label}
                </div>
              )),
          )}
        </div>
      ))}
    </div>
  );
}
