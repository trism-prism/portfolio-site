'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

// Shared IntersectionObservers keyed by rootMargin, so dozens of covers do not each create one.
const observers = new Map<string, { io: IntersectionObserver; cbs: Map<Element, (v: boolean) => void> }>();

function observe(el: Element, margin: string, cb: (v: boolean) => void) {
  let entry = observers.get(margin);
  if (!entry) {
    const cbs = new Map<Element, (v: boolean) => void>();
    const io = new IntersectionObserver(
      (items) => items.forEach((it) => cbs.get(it.target)?.(it.isIntersecting)),
      { rootMargin: margin },
    );
    entry = { io, cbs };
    observers.set(margin, entry);
  }
  entry.cbs.set(el, cb);
  entry.io.observe(el);
  return () => {
    entry!.cbs.delete(el);
    entry!.io.unobserve(el);
  };
}

/** True while the element is within `margin` of the viewport. */
export function useNear<T extends Element>(margin = '300px'): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    return observe(ref.current, margin, setNear);
  }, [margin]);
  return [ref, near];
}

/** Becomes true once, the first time the element comes into view. */
export function useSeenOnce<T extends Element>(margin = '0px 0px -10% 0px'): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    return observe(ref.current, margin, (v) => v && setSeen(true));
  }, [margin, seen]);
  return [ref, seen];
}

function subscribeMq(q: string) {
  return (cb: () => void) => {
    const mq = matchMedia(q);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  };
}

export function useMedia(query: string, fallback = false): boolean {
  return useSyncExternalStore(
    subscribeMq(query),
    () => matchMedia(query).matches,
    () => fallback,
  );
}

export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)');

/** Fires `onIdle` after `ms` of no pointer/key/wheel/touch input; `onWake` on the next input. */
export function useIdle(ms: number): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), ms);
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), ms);
    };
    const evs = ['pointermove', 'keydown', 'wheel', 'touchstart', 'scroll'] as const;
    evs.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    return () => {
      clearTimeout(timer);
      evs.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [ms]);
  return idle;
}
