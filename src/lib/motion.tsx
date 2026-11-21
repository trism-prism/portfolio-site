'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { MOTION_KEY } from './boot';

// Motion preference. Unlike a "Full by default" policy, this one starts from the OS setting
// (prefers-reduced-motion) and lets the visitor override it; the override persists in localStorage.
export type MotionMode = 'full' | 'reduced';

type Ctx = { mode: MotionMode; reduced: boolean; setMode: (m: MotionMode) => void; toggle: () => void };
const MotionCtx = createContext<Ctx>({ mode: 'full', reduced: false, setMode: () => {}, toggle: () => {} });

export function readStoredMotion(): MotionMode | null {
  try {
    const v = localStorage.getItem(MOTION_KEY);
    return v === 'full' || v === 'reduced' ? v : null;
  } catch {
    return null;
  }
}


export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<MotionMode>('full');
  // The mode the page booted with (set by the inline head script), then the latest mode chosen. The server
  // and first client render both say 'full', so until state catches up with this value the DOM attribute is
  // left alone; otherwise React's dev double-mount would overwrite 'reduced' with 'full' and then read it back.
  const target = useRef<MotionMode | null>(null);

  useEffect(() => {
    target.current ??= document.documentElement.dataset.motion === 'reduced' ? 'reduced' : 'full';
    setModeState(target.current);
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      if (readStoredMotion()) return;
      target.current = mq.matches ? 'reduced' : 'full';
      setModeState(target.current);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (mode !== target.current) return;
    document.documentElement.dataset.motion = mode;
  }, [mode]);

  const setMode = useCallback((m: MotionMode) => {
    target.current = m;
    setModeState(m);
    try {
      localStorage.setItem(MOTION_KEY, m);
    } catch {}
  }, []);
  const toggle = useCallback(() => setMode(mode === 'full' ? 'reduced' : 'full'), [mode, setMode]);

  return <MotionCtx.Provider value={{ mode, reduced: mode === 'reduced', setMode, toggle }}>{children}</MotionCtx.Provider>;
}

export const useMotion = () => useContext(MotionCtx);
