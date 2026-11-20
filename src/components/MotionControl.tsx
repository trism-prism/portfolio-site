'use client';

import { useEffect, useId, useState } from 'react';
import {
  MOTION_OPTIONS,
  MOTION_STORAGE_KEY,
  parsePreference,
  resolveMotion,
  type MotionPreference,
} from '@/lib/motion';

function readStored(): MotionPreference {
  try {
    return parsePreference(localStorage.getItem(MOTION_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function apply(pref: MotionPreference) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  document.documentElement.setAttribute('data-motion', resolveMotion(pref, reduced));
}

export default function MotionControl() {
  const id = useId();
  // Server render and first client render both use 'system'; the stored value is applied after mount.
  const [pref, setPref] = useState<MotionPreference>('system');

  useEffect(() => {
    // Sync from browser storage after hydration; the boot script already set the attribute.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPref(readStored());
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onChange = () => apply(readStored());
    mq?.addEventListener('change', onChange);
    return () => mq?.removeEventListener('change', onChange);
  }, []);

  function choose(next: MotionPreference) {
    setPref(next);
    try {
      if (next === 'system') localStorage.removeItem(MOTION_STORAGE_KEY);
      else localStorage.setItem(MOTION_STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice still applies for this page view.
    }
    apply(next);
  }

  return (
    <div>
      <label htmlFor={id}>Motion </label>
      <select id={id} value={pref} onChange={(e) => choose(parsePreference(e.target.value))}>
        {MOTION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
