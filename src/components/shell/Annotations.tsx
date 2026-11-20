'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { annotations } from '@/data/annotations';
import { onUi } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';

type Pin = { x: number; y: number; fixed: boolean; found: boolean };

// "How it's built": pins placed from real element rectangles, with a card per note.
export function Annotations() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [pins, setPins] = useState<Pin[]>([]);

  const measure = useCallback(() => {
    setPins(
      annotations.map((a) => {
        const el = document.querySelector<HTMLElement>(`[data-annotate="${a.target}"]`);
        if (!el) return { x: 0, y: 0, fixed: false, found: false };
        const r = el.getBoundingClientRect();
        const fixed = !!el.closest('header.fixed, .fixed');
        return { x: r.left + Math.min(r.width - 13, 13), y: r.top + (fixed ? 0 : window.scrollY) + 13, fixed, found: true };
      }),
    );
  }, []);

  useEffect(() => onUi((e) => e.type === 'annotations' && (setI(0), setOpen(true))), []);

  useEffect(() => {
    if (!open) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (!pending) pending = window.setTimeout(() => ((pending = 0), measure()), 250);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'ArrowRight') setI((v) => (v + 1) % annotations.length);
      if (e.key === 'ArrowLeft') setI((v) => (v - 1 + annotations.length) % annotations.length);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      ro.disconnect();
      mo.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, measure]);

  // Bring the current target into view.
  useEffect(() => {
    if (!open) return;
    const el = document.querySelector<HTMLElement>(`[data-annotate="${annotations[i].target}"]`);
    if (el && !el.closest('header.fixed')) el.scrollIntoView({ block: 'center', behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth' });
  }, [i, open]);

  if (!open) return null;
  const a = annotations[i];
  return createPortal(
    <>
      {pins.map((p, k) =>
        p.found ? (
          <button
            key={annotations[k].target}
            type="button"
            onClick={() => setI(k)}
            aria-label={`Note ${k + 1}: ${annotations[k].title}`}
            className="mono z-[66] grid h-[26px] w-[26px] place-items-center rounded-full text-[11px] font-bold shadow-lg"
            style={{
              position: p.fixed ? 'fixed' : 'absolute',
              left: p.x - 13,
              top: p.y - 13,
              background: k === i ? 'var(--accent)' : 'var(--panel)',
              color: k === i ? 'var(--accent-ink)' : 'var(--fg)',
              border: '1px solid var(--accent)',
            }}
          >
            {k + 1}
          </button>
        ) : null,
      )}
      <div
        role="dialog"
        aria-label="How this site is built"
        className="panel anim-pop fixed bottom-20 left-1/2 z-[67] w-[min(340px,calc(100vw-24px))] -translate-x-1/2 p-4 shadow-2xl md:bottom-8"
        style={{ background: 'var(--panel)' }}
      >
        <div className="mb-2 flex items-center gap-2">
          <span className="label !text-accent">
            {i + 1} / {annotations.length}
          </span>
          <button type="button" onClick={() => setOpen(false)} className="icon-btn ml-auto h-8 w-8" aria-label="Close notes" data-autofocus>
            <Icon name="close" size={15} />
          </button>
        </div>
        <h3 className="mb-1 font-semibold text-fg">{a.title}</h3>
        <p className="text-[13.5px] leading-relaxed text-fg-2">{a.body}</p>
        {!pins[i]?.found && <p className="mono mt-2 text-[11px] text-muted">(This element is not on screen right now.)</p>}
        <div className="mt-3 flex gap-2">
          <button type="button" className="btn h-9 min-h-0 flex-1 text-sm" onClick={() => setI((v) => (v - 1 + annotations.length) % annotations.length)}>
            <Icon name="chevronLeft" size={15} /> Prev
          </button>
          <button type="button" className="btn btn-primary h-9 min-h-0 flex-1 text-sm" onClick={() => setI((v) => (v + 1) % annotations.length)}>
            Next <Icon name="chevronRight" size={15} />
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
