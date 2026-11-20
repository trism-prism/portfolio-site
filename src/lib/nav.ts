'use client';

import { sectionIds } from '@/data/sections';

// Page-wide UI events. Components dispatch these instead of importing each other.
export type UiEvent =
  | { type: 'palette' }
  | { type: 'cv'; doc?: 'resume' | 'cv' }
  | { type: 'annotations' }
  | { type: 'project'; slug: string }
  | { type: 'theme' }
  | { type: 'email-pulse' }
  | { type: 'toast'; text: string };

const EVT = 'tm-ui';
export function emit(e: UiEvent) {
  window.dispatchEvent(new CustomEvent<UiEvent>(EVT, { detail: e }));
}
export function onUi(fn: (e: UiEvent) => void) {
  const h = (ev: Event) => fn((ev as CustomEvent<UiEvent>).detail);
  window.addEventListener(EVT, h);
  return () => window.removeEventListener(EVT, h);
}

export const HEADER_OFFSET = 64;

type Scroller = { scrollTo: (target: number, opts?: { immediate?: boolean }) => void } | null;
let scroller: Scroller = null;
export function setScroller(s: Scroller) {
  scroller = s;
}

export function scrollToY(y: number, immediate = false) {
  if (scroller && !immediate) scroller.scrollTo(y);
  else window.scrollTo({ top: y, behavior: immediate || document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth' });
}

/** Scrolls to a section, records it in history, and moves focus there for keyboard users. */
export function goTo(id: string, opts: { push?: boolean; focus?: boolean; immediate?: boolean } = {}) {
  const { push = true, focus = true, immediate = false } = opts;
  const el = id === 'hero' ? document.getElementById('hero') : document.getElementById(id);
  if (!el) return;
  const y = id === 'hero' ? 0 : el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  scrollToY(y, immediate);
  if (push) {
    const url = new URL(window.location.href);
    url.hash = id === 'hero' ? '' : id;
    history.pushState(null, '', url.pathname + url.search + (id === 'hero' ? '' : `#${id}`));
  }
  if (focus) {
    const h = el.querySelector<HTMLElement>('h2, h1') ?? el;
    if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
    window.setTimeout(() => h.focus({ preventScroll: true }), immediate ? 0 : 500);
  }
}

export const isSection = (id: string) => id === 'hero' || (sectionIds as string[]).includes(id);
