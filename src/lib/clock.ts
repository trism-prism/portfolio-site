'use client';

import { useEffect, useRef, useState } from 'react';

// One shared scene clock for every animated SVG on the page.
// - Subscribers get elapsed seconds since they subscribed.
// - Updates are capped near 60 Hz, so high-refresh displays do not repaint SVG geometry at 120-240 Hz.
// - It stops entirely while the tab is hidden or nobody is subscribed.

type Sub = (now: number) => void;
const subs = new Set<Sub>();
let raf = 0;
let last = 0;
const MIN_GAP = 1000 / 61;

function tick(now: number) {
  raf = requestAnimationFrame(tick);
  if (now - last < MIN_GAP) return;
  last = now;
  for (const s of subs) s(now);
}

function start() {
  if (!raf && subs.size && typeof document !== 'undefined' && !document.hidden) raf = requestAnimationFrame(tick);
}
function stop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}

export function subscribe(fn: Sub): () => void {
  subs.add(fn);
  start();
  return () => {
    subs.delete(fn);
    if (!subs.size) stop();
  };
}

/**
 * Elapsed seconds while `running`; when not running the value holds where it stopped
 * (or `frozenAt`, if given, which lets Reduced motion show an informative finished frame).
 */
export function useSceneTime(running: boolean, frozenAt?: number): number {
  const [t, setT] = useState(frozenAt ?? 0);
  const base = useRef<number | null>(null);
  const acc = useRef(0);
  useEffect(() => {
    if (!running) {
      base.current = null;
      if (frozenAt !== undefined) setT(frozenAt);
      return;
    }
    const unsub = subscribe((now) => {
      if (base.current === null) base.current = now - acc.current * 1000;
      acc.current = (now - base.current) / 1000;
      setT(acc.current);
    });
    return () => {
      unsub();
      base.current = null;
    };
  }, [running, frozenAt]);
  return t;
}
