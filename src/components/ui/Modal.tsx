'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { useMedia } from '@/lib/hooks';

let openCount = 0;
export const anyOverlayOpen = () => openCount > 0;

/**
 * Shared dialog shell: portal, scroll lock, focus trap, Escape, and a drag-to-dismiss bottom sheet on phones.
 */
export function Modal({
  open,
  onClose,
  label,
  children,
  width = 760,
  header,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  width?: number;
  header?: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const mobile = useMedia('(max-width: 767px)');
  const [drag, setDrag] = useState(0);
  const dragStart = useRef<{ y: number; t: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    openCount++;
    restore.current = document.activeElement as HTMLElement;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stopped');
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLElement>('[data-autofocus], button, a, input')?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab' && panel.current) {
        const f = [...panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])')].filter(
          (el) => el.offsetParent !== null,
        );
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      openCount--;
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      html.style.overflow = prev;
      if (!openCount) document.documentElement.classList.remove('lenis-stopped');
      restore.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!mobile) return;
    dragStart.current = { y: e.clientY, t: performance.now() };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    setDrag(Math.max(0, e.clientY - dragStart.current.y));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dy = e.clientY - dragStart.current.y;
    const v = (dy / (performance.now() - dragStart.current.t)) * 1000;
    dragStart.current = null;
    if (dy > 120 || v > 500) onClose();
    setDrag(0);
  };

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" role="presentation">
      <div className="backdrop anim-fade" onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="panel anim-pop sheet-mobile relative z-[71] flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-b-none bg-panel shadow-2xl md:rounded-2xl"
        style={{ maxWidth: width, transform: drag ? `translateY(${drag}px)` : undefined, background: 'var(--panel)' }}
      >
        {mobile && (
          <div
            className="flex h-6 shrink-0 cursor-grab items-center justify-center touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            aria-hidden="true"
          >
            <span className="h-1 w-10 rounded-full bg-line-2" />
          </div>
        )}
        <div className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-3 md:px-5">
          <div className="min-w-0 flex-1">{header ?? <span className="font-semibold">{label}</span>}</div>
          <button type="button" className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" data-lenis-prevent style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
