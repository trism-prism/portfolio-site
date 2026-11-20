'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

  useEffect(() => {
    const initial = document.documentElement.dataset.motion === 'reduced' ? 'reduced' : 'full';
    setModeState(initial);
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      if (!readStoredMotion()) setModeState(mq.matches ? 'reduced' : 'full');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = mode;
  }, [mode]);

  const setMode = useCallback((m: MotionMode) => {
    setModeState(m);
    try {
      localStorage.setItem(MOTION_KEY, m);
    } catch {}
  }, []);
  const toggle = useCallback(() => setMode(mode === 'full' ? 'reduced' : 'full'), [mode, setMode]);

  return <MotionCtx.Provider value={{ mode, reduced: mode === 'reduced', setMode, toggle }}>{children}</MotionCtx.Provider>;
}

export const useMotion = () => useContext(MotionCtx);
