'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { mulberry32 } from '@/lib/kit';
import { useMedia } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';

// The night sky behind the page: a seeded star field and four faint graticule arcs, drawn once into an
// SVG and redrawn only when the viewport size changes. About 8% of the stars twinkle slowly (CSS only);
// Reduced motion turns that off. The sky gradient itself lives on <body>.
type SkyStar = { x: number; y: number; r: number; o: number; tw: number; d: number; delay: number };

const DARK_PER_STAR = 6000; // px² of viewport per star in dark
const TWILIGHT_SHARE = DARK_PER_STAR / 9000; // twilight shows this share of the dark stars
const round1 = (n: number) => Math.round(n * 10) / 10;

function makeSky(w: number, h: number) {
  const rnd = mulberry32(2026);
  const count = Math.round((w * h) / DARK_PER_STAR);
  const stars: SkyStar[] = Array.from({ length: count }, (_, i) => {
    const x = Math.round(rnd() * w);
    const y = Math.round(rnd() * h);
    const r = rnd() < 0.07 ? 1.6 : round1(0.6 + rnd() * 0.7);
    const o = round1(0.25 + rnd() * 0.55);
    const tw = i % 12 === 5 ? 1 : 0; // every 12th star twinkles: about 8%
    const d = round1(4 + rnd() * 3);
    const delay = -round1(rnd() * 7);
    return { x, y, r, o, tw, d, delay };
  });
  return { stars, shown: Math.round(count * TWILIGHT_SHARE) };
}

export function AmbientBackground() {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let timer = 0;
    const measure = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Ignore small height-only changes (a mobile browser bar sliding away) so the stars do not reshuffle.
      setSize((prev) => (prev && prev.w === w && Math.abs(prev.h - h) < 150 ? prev : { w, h }));
    };
    const onResize = () => {
      clearTimeout(timer);
      timer = window.setTimeout(measure, 150);
    };
    measure();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const sky = useMemo(() => (size ? makeSky(size.w, size.h) : null), [size]);

  return (
    <div className="ambient" aria-hidden="true">
      {size && sky && (
        <svg viewBox={`0 0 ${size.w} ${size.h}`} preserveAspectRatio="none" focusable="false">
          <g className="sky-graticule">
            {[0.6, 0.85, 1.1, 1.35].map((k) => (
              <circle key={k} cx={Math.round(size.w * 0.87)} cy={Math.round(size.h * 1.28)} r={Math.round(size.h * k)} />
            ))}
          </g>
          {sky.stars.map((st, i) => (
            <circle
              key={i}
              className={`sky-star${i >= sky.shown ? ' sky-extra' : ''}${st.tw ? ' sky-tw' : ''}`}
              cx={st.x}
              cy={st.y}
              r={st.r}
              style={st.tw ? ({ '--o': st.o, '--d': `${st.d}s`, '--delay': `${st.delay}s`, opacity: st.o } as React.CSSProperties) : { opacity: st.o }}
            />
          ))}
        </svg>
      )}
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
