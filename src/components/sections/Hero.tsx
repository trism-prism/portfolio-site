'use client';

import { useEffect, useRef, useState } from 'react';
import { personal } from '@/data/personal';
import { emit, goTo } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { MOTH_DRAW_SECONDS, MOTH_TAIL, MOTH_VIEW, MothConstellation } from '@/components/ui/MothConstellation';
import { routePath } from './heroRoute';
import { ProximityText } from '@/components/ui/ProximityText';

const r1 = (n: number) => Math.round(n * 10) / 10;

// Where the route runs, in hero pixels: from the "you are here" marker up to the Moth's tail star. `s` is the
// figure's rendered scale over its 400-wide viewBox.
type Route = { w: number; h: number; mx: number; my: number; tx: number; ty: number; s: number };

const SPECTRUM = 'linear-gradient(90deg, var(--kind-software), var(--kind-systems), var(--kind-ai), var(--rose), var(--route))';

export function Hero() {
  const h = personal.headline;
  const heroRef = useRef<HTMLElement>(null);
  const mothRef = useRef<HTMLDivElement>(null);
  const [route, setRoute] = useState<Route | null>(null);

  // The route joins two things placed by CSS (the marker near the bottom, the tail star in the figure), so
  // it is measured after layout and redrawn on resize. It only exists from 1024px up.
  useEffect(() => {
    const hero = heroRef.current;
    const moth = mothRef.current;
    if (!hero || !moth) return;
    const wide = matchMedia('(min-width: 1024px)');
    const measure = () => {
      if (!wide.matches) {
        setRoute(null);
        return;
      }
      const a = hero.getBoundingClientRect();
      const m = moth.getBoundingClientRect();
      const next: Route = {
        w: r1(a.width),
        h: r1(a.height),
        mx: r1(m.left - a.left - m.width * 0.35),
        my: r1(a.height - 130),
        tx: r1(m.left - a.left + (m.width * MOTH_TAIL[0]) / MOTH_VIEW.w),
        ty: r1(m.top - a.top + (m.height * MOTH_TAIL[1]) / MOTH_VIEW.h),
        s: r1((m.width / MOTH_VIEW.w) * 100) / 100,
      };
      setRoute((prev) => (prev && (Object.keys(next) as (keyof Route)[]).every((k) => prev[k] === next[k]) ? prev : next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    ro.observe(moth);
    wide.addEventListener('change', measure);
    return () => {
      ro.disconnect();
      wide.removeEventListener('change', measure);
    };
  }, []);

  const d = route ? routePath([route.mx, route.my], [route.tx, route.ty], route.s) : '';
  const routeDelay = `${r1(MOTH_DRAW_SECONDS + 0.1)}s`;

  return (
    <section ref={heroRef} id="hero" className="relative z-[2] flex min-h-[100svh] items-center pb-24 pt-28 lg:pb-44" aria-labelledby="hero-title">
      {/* the constellation and route sit behind the text and take no pointer events */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden sm:block" aria-hidden="true">
        {route && (
          <svg className="absolute inset-0 hidden h-full w-full lg:block" viewBox={`0 0 ${route.w} ${route.h}`} focusable="false" style={{ ['--rd' as string]: routeDelay }}>
            <defs>
              <mask id="hero-route-reveal" maskUnits="userSpaceOnUse" x={0} y={0} width={route.w} height={route.h}>
                <path className="hero-route-line" d={d} pathLength={1} fill="none" stroke="#fff" strokeWidth={4} />
              </mask>
            </defs>
            <path d={d} fill="none" strokeWidth={1.5} strokeDasharray="5 6" mask="url(#hero-route-reveal)" style={{ stroke: 'var(--route)' }} />
            <g className="hero-route-here" transform={`translate(${route.mx} ${route.my})`}>
              <circle r={6} fill="none" style={{ stroke: 'var(--route)' }} />
              <circle r={2} style={{ fill: 'var(--route)' }} />
              <text x={14} y={4} fontSize={10.5} letterSpacing="0.14em" style={{ fill: 'var(--route)', fontFamily: 'var(--font-mono)' }}>
                YOU ARE HERE · {personal.location.toUpperCase()}
              </text>
            </g>
          </svg>
        )}
        <div className="wrap relative h-full">
          <div ref={mothRef} className="hero-moth">
            <MothConstellation named draw />
          </div>
        </div>
      </div>

      <div className="wrap relative z-[1] lg:ps-16 xl:ps-6">
        <div className="mx-auto max-w-[620px] text-center lg:mx-0 lg:text-left">
          <p className="hero-in inline-flex items-center gap-2 rounded-full border border-line-2 bg-panel/70 px-3.5 py-1.5 text-[13px] text-fg-2" style={{ animationDelay: '.12s' }}>
            <span className="relative inline-flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-green" style={{ animation: 'ping 2s ease-out infinite' }} />
              <span className="relative h-2 w-2 rounded-full bg-green" />
            </span>
            {personal.status}
          </p>
          <h1 id="hero-title" className="display mt-8 text-[44px] leading-[1.04] text-fg sm:text-[64px] lg:text-[72px]" data-annotate="headline">
            <span className="hero-in block" style={{ animationDelay: '.2s' }}>
              Hi, I&apos;m
            </span>
            <span className="hero-in block" style={{ animationDelay: '.24s' }}>
              <span className="inline-block whitespace-nowrap font-sig font-normal tracking-normal" style={{ fontSize: 'min(1.35em, 14vw)', background: SPECTRUM, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingInline: '.06em' }}>
                Tristan Morton
              </span>
              <span style={{ color: 'var(--route)' }}>.</span>
            </span>
            <span className="hero-in mt-2 block text-[24px] font-semibold leading-tight tracking-[-0.02em] text-fg-2 sm:text-[28px] lg:text-[30px]" style={{ animationDelay: '.3s' }}>
              <ProximityText text={h.lead} /> <span className="serif-accent text-[1.12em]" style={{ color: 'var(--fg)' }}>{h.accent}</span>
              {h.tail}
            </span>
          </h1>
          <p className="hero-in mx-auto mt-5 max-w-[540px] text-[17px] leading-relaxed text-fg-2 md:text-[18px] lg:mx-0" style={{ animationDelay: '.4s' }}>
            {personal.intro}
          </p>
          <div className="hero-in mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start" style={{ animationDelay: '.54s' }}>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                goTo('projects');
              }}
              className="btn btn-solid min-h-12 px-6"
            >
              See projects <Icon name="arrowDownRight" size={16} />
            </a>
            <button type="button" className="btn min-h-12 px-5" onClick={() => emit({ type: 'cv', doc: 'cv' })}>
              <Icon name="file" size={16} /> Read CV
            </button>
          </div>
          <div className="hero-in mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start" style={{ animationDelay: '.62s' }}>
            <a href={personal.links.resume} download className="btn btn-ghost lg:-ml-[19px]">
              <Icon name="download" size={16} /> Résumé PDF
            </a>
            <a className="icon-btn" href={personal.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)">
              <Icon name="linkedin" />
            </a>
            <a className="icon-btn" href={personal.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)">
              <Icon name="github" />
            </a>
            <a className="icon-btn" href={`mailto:${personal.email}`} aria-label={`Email ${personal.email}`}>
              <Icon name="mail" />
            </a>
          </div>
        </div>
      </div>
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          goTo('about');
        }}
        className="label absolute bottom-6 left-1/2 z-[1] flex -translate-x-1/2 flex-col items-center gap-1 hover:text-fg"
      >
        Scroll
        <span className="scroll-cue">
          <Icon name="chevronDown" size={16} />
        </span>
      </a>
      <style>{`
        .hero-in { animation: hero-in .9s cubic-bezier(.16,1,.3,1) both; }
        @keyframes hero-in { from { opacity: 0; transform: translateY(16px); filter: blur(4px); } }
        .scroll-cue { animation: cue 1.8s ease-in-out infinite; }
        @keyframes cue { 50% { transform: translateY(5px); } }
        [data-motion='reduced'] .hero-in, [data-motion='reduced'] .scroll-cue { animation: none; }
      `}</style>
    </section>
  );
}
