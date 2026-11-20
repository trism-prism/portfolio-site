'use client';

import { useEffect, useRef } from 'react';
import { useFinePointer } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';

// Each letter's variable-font weight follows pointer distance: 600 + 200 * max(0, 1 - d/150)^2.
// Reads (letter centers) and writes (weights) happen in separate passes inside one frame,
// and the listener idles when the pointer is far from the line.
export function ProximityText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fine = useFinePointer();
  const { reduced } = useMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || !fine || reduced) return;
    const letters = [...root.querySelectorAll<HTMLSpanElement>('[data-l]')];
    let raf = 0;
    let px = -1e4, py = -1e4;
    let active = false;
    const frame = () => {
      raf = 0;
      const centers = letters.map((l) => {
        const r = l.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      });
      centers.forEach(([cx, cy], i) => {
        const d = Math.hypot(px - cx, py - cy);
        const k = Math.max(0, 1 - d / 150);
        letters[i].style.fontVariationSettings = `'wght' ${Math.round(600 + 200 * k * k)}`;
      });
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      const r = root.getBoundingClientRect();
      const near = py > r.top - 160 && py < r.bottom + 160;
      if (!near && !active) return;
      active = near;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
      letters.forEach((l) => (l.style.fontVariationSettings = ''));
    };
  }, [fine, reduced]);

  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      {text.split(' ').map((w, wi, arr) => (
        <span key={wi} className="inline-block whitespace-nowrap" aria-hidden="true">
          {[...w].map((ch, ci) => (
            <span key={ci} data-l="" style={{ fontVariationSettings: "'wght' 600", transition: 'font-variation-settings .12s' }}>
              {ch}
            </span>
          ))}
          {wi < arr.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}
