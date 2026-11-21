'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { useMotion } from '@/lib/motion';
import { goTo, isSection, onUi, scrollToY, setScroller } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { personal } from '@/data/personal';
import { plain } from '@/data/ph';

/** Lenis smooth scrolling in Full mode; native scrolling in Reduced. Also owns hash/history restoration. */
export function SmoothScroll() {
  const { reduced } = useMotion();

  useEffect(() => {
    if (reduced) {
      setScroller(null);
      return;
    }
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, touchMultiplier: 1.5, smoothWheel: true, syncTouch: false, autoRaf: false });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    setScroller({ scrollTo: (y, o) => lenis.scrollTo(y, { immediate: o?.immediate, duration: 1.1 }) });
    const obs = new MutationObserver(() => {
      if (document.documentElement.style.overflow === 'hidden') lenis.stop();
      else lenis.start();
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
      lenis.destroy();
      setScroller(null);
    };
  }, [reduced]);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const restore = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) return;
      if (isSection(id)) goTo(id, { push: false, focus: false, immediate: true });
      else if (!document.getElementById(id)) goTo('hero', { push: false, focus: false, immediate: true });
    };
    // Initial deep link: wait a frame for layout.
    requestAnimationFrame(() => requestAnimationFrame(restore));
    const onPop = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (!id) scrollToY(0);
      else if (isSection(id)) goTo(id, { push: false, focus: false });
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return null;
}

export function IntroSplash() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem('tm-intro') === '1';
    } catch {}
    const reduced = document.documentElement.dataset.motion === 'reduced';
    if (seen || reduced || location.hash || location.search.includes('project=') || navigator.webdriver) return;
    setShow(true);
    // lets the hero hold its entrance and the Moth draw until the splash lifts (see [data-intro='on'] in globals.css)
    document.documentElement.dataset.intro = 'on';
    try {
      sessionStorage.setItem('tm-intro', '1');
    } catch {}
    let done = false;
    const leave = () => {
      if (done) return;
      done = true;
      delete document.documentElement.dataset.intro;
      setLeaving(true);
      window.setTimeout(() => setShow(false), 800);
    };
    const ready = Promise.race([document.fonts.ready.catch(() => null), new Promise((r) => setTimeout(r, 700))]);
    let t = 0;
    ready.then(() => (t = window.setTimeout(leave, 2300)));
    const skip = () => leave();
    const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    evs.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }));
    return () => {
      clearTimeout(t);
      delete document.documentElement.dataset.intro;
      evs.forEach((e) => window.removeEventListener(e, skip));
    };
  }, []);

  if (!show) return null;
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[90] grid place-items-center"
      style={{
        background: 'var(--bg)',
        transform: leaving ? 'translateY(-100%)' : undefined,
        transition: 'transform .8s cubic-bezier(.16,1,.3,1)',
      }}
    >
      <svg viewBox="0 0 600 260" className="w-[min(88vw,620px)]">
        <defs>
          <linearGradient id="spec" x1="0" x2="1">
            <stop offset="0" stopColor="#5eead4" />
            <stop offset=".5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        {/* white beam enters, the prism splits it */}
        <line x1="0" y1="70" x2="262" y2="70" stroke="var(--fg)" strokeWidth="2" strokeDasharray="262" strokeDashoffset="262" style={{ animation: 'intro-draw .5s ease-out forwards' }} />
        <path d="M300 22 L338 92 L262 92 Z" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" style={{ animation: 'fade-in .4s .1s both' }} />
        {['#5eead4', '#38bdf8', '#a78bfa', '#fb7185', '#f59e0b'].map((c, i) => (
          <line
            key={c}
            x1="320"
            y1="70"
            x2="600"
            y2={46 + i * 12}
            stroke={c}
            strokeWidth="2"
            strokeDasharray="300"
            strokeDashoffset="300"
            style={{ animation: `intro-draw .6s ${0.45 + i * 0.05}s ease-out forwards` }}
          />
        ))}
        <text
          x="300"
          y="200"
          textAnchor="middle"
          fontFamily="var(--font-sig), cursive"
          fontSize="83"
          fill="url(#spec)"
          stroke="url(#spec)"
          strokeWidth="1.2"
          style={{ strokeDasharray: 900, strokeDashoffset: 900, fillOpacity: 0, animation: 'sig-stroke 1.3s .6s ease-out forwards, sig-fill .5s 1.7s forwards' }}
        >
          {personal.name}
        </text>
      </svg>
      <style>{`
        @keyframes intro-draw { to { stroke-dashoffset: 0; } }
        @keyframes sig-stroke { to { stroke-dashoffset: 0; } }
        @keyframes sig-fill { to { fill-opacity: 1; } }
      `}</style>
    </div>
  );
}

export function FloatingControls() {
  const { mode, toggle } = useMotion();
  const [scrolled, setScrolled] = useState(false);
  const [past, setPast] = useState(false);
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 600);
      setPast(window.scrollY > 120);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <>
      {/* On phones the toggle appears after 120px of scrolling so it never covers the hero actions. */}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={mode === 'reduced'}
        aria-label={`Motion mode: ${mode === 'full' ? 'Full' : 'Reduced'}. Switch to ${mode === 'full' ? 'Reduced' : 'Full'}.`}
        className={`mono fixed bottom-5 left-5 z-40 h-11 items-center gap-2 rounded-xl border border-line-2 px-3.5 text-[11.5px] font-bold uppercase tracking-wider text-fg shadow-lg backdrop-blur-md md:bottom-8 md:left-8 md:flex ${past ? 'flex' : 'hidden'}`}
        style={{ background: 'color-mix(in srgb, var(--panel) 85%, transparent)' }}
      >
        <Icon name={mode === 'full' ? 'spark' : 'pause'} size={15} />
        {mode === 'full' ? 'Full motion' : 'Reduced motion'}
      </button>
      <button
        type="button"
        onClick={() => goTo('hero', { push: true, focus: false })}
        aria-label="Back to top"
        className={`icon-btn fixed bottom-5 right-5 z-40 shadow-lg transition-[opacity,transform] duration-300 md:bottom-8 md:right-8 ${
          scrolled ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
        tabIndex={scrolled ? 0 : -1}
      >
        <Icon name="arrowUp" />
      </button>
    </>
  );
}

/** Polite toast region for copy confirmations etc. */
export function Toasts() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef(0);
  useEffect(
    () =>
      onUi((e) => {
        if (e.type !== 'toast') return;
        setMsg(e.text);
        clearTimeout(t.current);
        t.current = window.setTimeout(() => setMsg(null), 2200);
      }),
    [],
  );
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[95] flex justify-center">
      {msg && (
        <div className="panel anim-pop mono px-4 py-2 text-[13px] text-fg shadow-xl" style={{ background: 'var(--panel)' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function Konami() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let i = 0;
    const h = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        setOn(true);
        window.setTimeout(() => setOn(false), 6000);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  if (!on) return null;
  return (
    <div
      role="status"
      className="panel fixed bottom-24 left-1/2 z-[95] flex max-w-[92vw] -translate-x-1/2 items-center gap-3 px-4 py-3 shadow-2xl"
      style={{ background: 'var(--panel)', animation: 'konami .5s cubic-bezier(.34,1.56,.64,1) both' }}
    >
      <span className="text-xl" aria-hidden="true">◭</span>
      <span className="text-sm text-fg">
        <span className="ph-text" data-placeholder="">{plain(personal.easterEgg)}</span>
        <span className="ph-badge">Placeholder</span>
      </span>
    </div>
  );
}
