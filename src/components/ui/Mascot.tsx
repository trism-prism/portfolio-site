'use client';

import { useEffect, useRef, useState } from 'react';
import { PrismCharacter, type PrismPose } from './Prism';
import { useMotion } from '@/lib/motion';
import { useIdle } from '@/lib/hooks';

// The roaming prism sits on the rule of whichever section heading is active. On arrival it drops in,
// squashes on landing, idles, winks and sits; on departure it crouches and hops out. After 20 s of no
// input it falls asleep. In Reduced motion it simply sits.

const ACTIVE_EVT = 'tm-active-section';
export function announceActive(id: string) {
  window.dispatchEvent(new CustomEvent(ACTIVE_EVT, { detail: id }));
}

type Phase = 'away' | 'drop' | 'land' | 'idle' | 'wink' | 'sit' | 'leave';

export function Mascot({ sectionId }: { sectionId: string }) {
  const { reduced } = useMotion();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<Phase>('away');
  const timers = useRef<number[]>([]);
  const idle = useIdle(20000);

  useEffect(() => {
    const h = (e: Event) => setActive((e as CustomEvent<string>).detail === sectionId);
    window.addEventListener(ACTIVE_EVT, h);
    return () => window.removeEventListener(ACTIVE_EVT, h);
  }, [sectionId]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const at = (ms: number, p: Phase) => timers.current.push(window.setTimeout(() => setPhase(p), ms));
    if (active) {
      if (reduced) {
        setPhase('sit');
        return;
      }
      setPhase('drop');
      at(420, 'land');
      at(700, 'idle');
      at(1020, 'wink');
      at(1240, 'sit');
    } else {
      setPhase((p) => (p === 'away' ? p : reduced ? 'away' : 'leave'));
      if (!reduced) at(440, 'away');
    }
    return () => timers.current.forEach(clearTimeout);
  }, [active, reduced]);

  if (phase === 'away') return null;
  const asleep = idle && phase === 'sit';
  const pose: PrismPose =
    asleep ? 'sleep' : phase === 'drop' ? 'jump' : phase === 'land' ? 'land' : phase === 'wink' ? 'wink' : phase === 'leave' ? 'crouch' : phase === 'sit' ? 'sit' : 'idle';
  const style: React.CSSProperties =
    phase === 'drop'
      ? { transform: 'translateY(0)', animation: 'mascot-drop .42s cubic-bezier(.5,0,.75,0) both' }
      : phase === 'leave'
        ? { animation: 'mascot-leave .44s cubic-bezier(.16,1,.3,1) .12s both' }
        : {};
  return (
    <div className="mascot-slot" aria-hidden="true">
      <div className="mascot" style={{ ...style, bottom: pose === 'sit' || pose === 'sleep' ? -14 : 0 }}>
        <PrismCharacter pose={pose} size={46} />
        {asleep && !reduced && (
          <span className="mono absolute -top-3 right-0 text-xs text-muted" style={{ animation: 'zz 2.4s ease-out infinite' }}>
            z
          </span>
        )}
      </div>
      <style>{`
        @keyframes mascot-drop { from { transform: translateY(-110px); opacity: 0; } 30% { opacity: 1; } to { transform: translateY(0); } }
        @keyframes mascot-leave { to { transform: translateY(-90px); opacity: 0; } }
      `}</style>
    </div>
  );
}
