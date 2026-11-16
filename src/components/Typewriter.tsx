'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { initialTypeState, typewriterStep, type TypeState } from '../lib/typewriter';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

/** Types and deletes each role in a loop. With reduced motion, or before hydration, it shows the first role. */
export function Typewriter({ roles }: { roles: string[] }) {
  // Start from the full first role (what the server HTML shows), hold, then delete: the text never blanks on hydration.
  const [state, setState] = useState<TypeState>({ ...initialTypeState, len: roles[0].length });
  const still = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true);

  useEffect(() => {
    if (still) return;
    let timer: number;
    let s: TypeState = { ...initialTypeState, len: roles[0].length };
    const tick = () => {
      const next = typewriterStep(s, roles);
      s = next.state;
      setState(s);
      timer = window.setTimeout(tick, next.delay);
    };
    timer = window.setTimeout(tick, 1600);
    return () => window.clearTimeout(timer);
  }, [roles, still]);

  const text = roles[state.role].slice(0, state.len);
  return (
    <>
      <span aria-hidden="true">{text}</span>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{roles.join(', ')}</span>
      {!still && (
        <span aria-hidden="true" style={{ display: 'inline-block', width: '0.6ch', animation: 'blink 1s steps(1) infinite' }}>
          ▌
        </span>
      )}
    </>
  );
}
