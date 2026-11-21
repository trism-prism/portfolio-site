'use client';

// The first-visit intro: a chrysalis is charted, turns prismatic, the moth emerges and unfolds over the Moth constellation,
// then a ring of light lights the site as the moth flies into the nav logo. One timeline (timeline.ts) drives one rAF loop;
// this file only draws what introState(t) says. Storyboard: docs/design/mockups/mothsky-02-intro-storyboard.png.
//
// The page behind reads <html data-intro>: 'on' from mount until beat 9 (the hero holds its entrance and the Moth draw),
// 'landing' from beat 9 until the end (they play as the ring passes), then removed. While it has any value the nav logo's
// moth is hidden ([data-intro-target], see globals.css), so there is one moth, never two.

import { memo, useEffect, useRef, useState } from 'react';
import { MothEmerging } from '@/components/ui/Moth';
import { MothConstellation } from '@/components/ui/MothConstellation';
import { Chrysalis } from './Chrysalis';
import { ARRIVE_AT, INTRO_SECONDS, LANDING_AT, introState } from './timeline';

const FW = 420; // the storyboard's frame space
const FH = 236;
const SKIP_MS = 220; // skipping reaches the end state inside 0.35 s: the fade, then one frame to remove the overlay
const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** Where the ring of light starts: the moth's body when it is fully open. */
const RING_C = [210, 116] as const;
/** The nav logo's wingspan in px, as a fraction of the 160-unit moth box (the spread wings span about 142 units). */
const LOGO_SPAN_PX = 31;
const MOTH_SPAN_UNITS = 142;

type Geo = { iw: number; ih: number; k: number; left: number; top: number };

/** Stage geometry: the SVG is centred at min(92vw, 760px) wide. Reads only the window size, so it never forces a layout. */
function stageGeo(): Geo {
  const iw = window.innerWidth;
  const ih = window.innerHeight;
  // phones (under 640px) get a stage 125vw wide, centred and cropped by the overlay: the frame's empty sides fall off the screen
  const k = (iw < 640 ? iw * 1.25 : Math.min(iw * 0.92, 760)) / FW;
  return { iw, ih, k, left: (iw - FW * k) / 2, top: (ih - FH * k) / 2 };
}

/** The nav logo's centre in viewport px. Reading it forces a layout, so it runs well after hydration, not at mount. */
function logoCentre(): { cx: number; cy: number } | null {
  const el = document.querySelector('[data-intro-target]');
  const b = el?.getBoundingClientRect();
  return b && b.width > 0 ? { cx: b.left + b.width / 2, cy: b.top + b.height / 2 } : null;
}

// the night sky's own sparse stars, seeded so every visit is the same
const SKY_STARS = (() => {
  let a = 40 + 7;
  const rnd = () => {
    a = (a * 1664525 + 1013904223) % 4294967296;
    return a / 4294967296;
  };
  return Array.from({ length: 64 }, () => ({ x: r1(rnd() * 1000), y: r1(rnd() * 1000), r: r2(0.6 + rnd() * 1.1), o: r2(0.25 + rnd() * 0.6) }));
})();

const Stars = memo(function Stars() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {SKY_STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
      ))}
    </svg>
  );
});

/** Quadratic bezier through the nav logo: up, then left. */
function flightPath(p0: [number, number], target: [number, number], k: number): [number, number] {
  const p1: [number, number] = [mix(p0[0], target[0], 0.12), mix(p0[1], target[1], 0.55)];
  const a = (1 - k) * (1 - k);
  const b = 2 * (1 - k) * k;
  const c = k * k;
  return [a * p0[0] + b * p1[0] + c * target[0], a * p0[1] + b * p1[1] + c * target[1]];
}

export function Intro() {
  const [on, setOn] = useState(false);
  const [t, setT] = useState(0);
  const [fade, setFade] = useState(1);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [logo, setLogo] = useState<{ cx: number; cy: number } | null>(null);
  const [frozen, setFrozen] = useState(false);
  const skipRef = useRef<() => void>(null);

  useEffect(() => {
    const html = document.documentElement;
    const params = new URLSearchParams(location.search);
    const forced = params.has('intro');
    const raw = params.get('intro');
    const freeze = forced && raw ? Number(raw) : NaN;
    if (forced) {
      // review parameter: read once, then remove it
      params.delete('intro');
      const q = params.toString();
      history.replaceState(history.state, '', location.pathname + (q ? `?${q}` : '') + location.hash);
    }
    let seen = false;
    try {
      seen = sessionStorage.getItem('tm-intro') === '1';
    } catch {}
    const reduced = html.dataset.motion === 'reduced';
    // the head boot script (src/lib/boot.ts) may already have set data-intro='on' and put up the cover: lift it if we don't play
    const bail = () => void delete html.dataset.intro;
    if (reduced || location.hash || location.search.includes('project=')) return bail();
    if (!forced && (seen || navigator.webdriver)) return bail();
    if (!Number.isNaN(freeze) && freeze >= INTRO_SECONDS) return bail(); // the finished site

    const phase = (v: 'on' | 'landing' | null) => {
      if (v) html.dataset.intro = v;
      else delete html.dataset.intro;
    };
    const arrive = (yes: boolean) => {
      if (yes) html.dataset.introArrive = '';
      else delete html.dataset.introArrive;
    };
    const place = () => setLogo(logoCentre());
    const resize = () => {
      setGeo(stageGeo());
      place();
    };
    setGeo(stageGeo());
    window.addEventListener('resize', resize);
    setOn(true);

    if (!Number.isNaN(freeze)) {
      // frozen at one moment, for review captures: no clock, no skipping, no session flag
      const at = Math.max(0, freeze);
      setFrozen(true);
      setT(at);
      const tl = window.setTimeout(place, 250);
      phase(at >= LANDING_AT ? 'landing' : 'on');
      arrive(at >= ARRIVE_AT);
      return () => {
        clearTimeout(tl);
        window.removeEventListener('resize', resize);
        phase(null);
        arrive(false);
      };
    }

    try {
      sessionStorage.setItem('tm-intro', '1');
    } catch {}
    phase('on');
    const tl = window.setTimeout(place, 1800); // measured once the page has settled, long before beat 9

    let t0 = 0;
    let raf = 0;
    let skipAt = 0;
    let landed = false;
    let arrived = false;
    let done = false;
    let tFinish = 0;
    let tArrive = 0;
    const evs = ['keydown', 'pointerdown', 'wheel', 'touchstart', 'scroll'] as const;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(tl);
      clearTimeout(tFinish);
      clearTimeout(tArrive);
      cancelAnimationFrame(raf);
      evs.forEach((e) => window.removeEventListener(e, skip));
      window.removeEventListener('resize', resize);
      phase(null);
      arrive(false);
      setOn(false);
    };
    const land = () => {
      if (landed) return;
      landed = true;
      phase('landing');
    };
    const skip = () => {
      if (skipAt || done) return;
      skipAt = performance.now();
      land();
      // timers, not frames: a busy frame (a key press can start a scroll) must not stretch the skip
      tArrive = window.setTimeout(() => {
        arrived = true;
        arrive(true);
      }, SKIP_MS * 0.6);
      tFinish = window.setTimeout(finish, SKIP_MS);
    };
    evs.forEach((e) => window.addEventListener(e, skip, { passive: true }));
    skipRef.current = skip;

    const frame = (now: number) => {
      if (!t0) t0 = now;
      if (skipAt) {
        const k = Math.min(1, Math.max(0, (now - skipAt) / SKIP_MS));
        setFade(r2(1 - k));
        if (k >= 1) return;
      } else {
        const tt = Math.min(INTRO_SECONDS, (now - t0) / 1000);
        setT(tt);
        if (tt >= LANDING_AT) land();
        if (tt >= ARRIVE_AT && !arrived) {
          arrived = true;
          arrive(true);
        }
        if (tt >= INTRO_SECONDS) return finish();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      done = true;
      clearTimeout(tl);
      clearTimeout(tFinish);
      clearTimeout(tArrive);
      cancelAnimationFrame(raf);
      evs.forEach((e) => window.removeEventListener(e, skip));
      window.removeEventListener('resize', resize);
      phase(null);
      arrive(false);
    };
  }, []);

  if (!on || !geo) return null;
  const s = introState(t);

  // the moth: it sits where the timeline puts it, then flies to the logo along a gentle curve while shrinking to its size
  const S = s.mothScale;
  const home: [number, number] = [210, s.mothY + 16 * S];
  const target: [number, number] = logo ? [(logo.cx - geo.left) / geo.k, (logo.cy - geo.top) / geo.k] : [36, 20];
  const pos = s.flight > 0 ? flightPath(home, target, s.flight) : home;
  const size = s.flight > 0 ? mix(S, LOGO_SPAN_PX / MOTH_SPAN_UNITS / geo.k, s.flight) : S;
  const mothT = `translate(${r1(pos[0] - 80 * size)} ${r1(pos[1] - 60 * size)}) scale(${r2(size * 1000) / 1000})`;
  const clipBottom = r1(72 + 100 * s.head + 64 * s.fall);

  // the ring of light and the opening it leaves in the night sky
  const cx = geo.left + RING_C[0] * geo.k;
  const cy = geo.top + RING_C[1] * geo.k;
  const far = Math.hypot(Math.max(cx, geo.iw - cx), Math.max(cy, geo.ih - cy)) + 8;
  const R = s.ring * far;
  const mask = s.ring > 0 ? `radial-gradient(circle at ${r1(cx)}px ${r1(cy)}px, transparent ${r1(R)}px, #000 ${r1(R + 2)}px)` : undefined;

  const dim = { opacity: r2(s.stage) };
  return (
    <div className="intro-overlay intro-night" style={{ opacity: fade < 1 ? fade : undefined }}>
      <div className="intro-sky" style={{ opacity: r2(s.night), maskImage: mask, WebkitMaskImage: mask }}>
        <div style={{ opacity: r2(s.stars), height: '100%' }}>
          <Stars />
        </div>
      </div>
      <svg className="intro-stage" viewBox={`0 0 ${FW} ${FH}`} aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="intro-reveal">
            <rect x="-600" y="-600" width="1620" height={clipBottom + 600} />
          </clipPath>
        </defs>

        {/* gold glow and the Moth constellation, behind everything */}
        <g {...dim}>
          {s.goldGlow > 0.001 && <circle cx="210" cy="116" r="64" style={{ fill: 'var(--route)' }} opacity={r2(0.08 * s.goldGlow)} />}
          {s.constellation > 0 && (
            <g transform={`translate(54 ${r1(s.mothY - 51.5)})`}>
              <MothConstellation size={312} progress={s.constellation} />
            </g>
          )}
        </g>

        {/* the moth, behind the chrysalis until it pulls free */}
        <g data-intro-moth="" opacity={r2(s.mothOpacity)} clipPath={s.fall < 1 && s.flight === 0 ? 'url(#intro-reveal)' : undefined}>
          {s.head > 0 && (
            <g transform={mothT}>
              <MothEmerging wings={s.wings} antennaeL={s.antL} antennaeR={s.antR} wingStars={s.wingStars} />
            </g>
          )}
        </g>

        <g {...dim}>
          <Chrysalis s={s} />
        </g>

        {s.ring > 0 && s.ring < 1 && <circle cx={RING_C[0]} cy={RING_C[1]} r={r1(R / geo.k)} fill="none" strokeWidth={r2(2 / geo.k)} style={{ stroke: 'var(--accent-serif)' }} opacity={r2(0.6 * (1 - s.ring * s.ring))} />}
      </svg>
      <button type="button" className="intro-skip" onClick={() => !frozen && skipRef.current?.()}>
        Skip intro
      </button>
    </div>
  );
}
