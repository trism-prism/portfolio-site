'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { glossary } from '@/data/glossary';
import { isPh } from '@/data/ph';
import { Text } from './Text';

const terms = Object.keys(glossary).sort((a, b) => b.length - a.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const re = new RegExp(`(?<![\\w-])(${terms.map(escape).join('|')})(?![\\w-])`, 'g');

/** Marks the first occurrence of each known term in `text` with a definition tooltip. */
export function GlossText({ text }: { text: string }) {
  if (isPh(text)) return <Text v={text} />;
  const parts: React.ReactNode[] = [];
  const used = new Set<string>();
  let last = 0;
  for (const m of text.matchAll(re)) {
    const term = m[1];
    if (used.has(term)) continue;
    used.add(term);
    parts.push(text.slice(last, m.index));
    parts.push(<Term key={m.index} term={term} />);
    last = m.index! + term.length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

function Term({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0, above: false });
  const ref = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>(0);
  const id = useId();

  const place = () => {
    const r = ref.current!.getBoundingClientRect();
    const w = 280;
    const x = Math.min(window.innerWidth - w - 12, Math.max(12, r.left + r.width / 2 - w / 2));
    const above = r.bottom + 140 > window.innerHeight;
    setPos({ x, y: above ? r.top - 8 : r.bottom + 8, above });
  };
  const show = () => {
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        setOpen(false);
        ref.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (e.target !== ref.current) setOpen(false);
    };
    window.addEventListener('scroll', close, { passive: true });
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('scroll', close);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="gloss inline p-0 text-left font-[inherit] text-inherit"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return;
          clearTimeout(timer.current);
          timer.current = window.setTimeout(show, 280);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'mouse') return;
          clearTimeout(timer.current);
          setOpen(false);
        }}
        onFocus={(e) => e.currentTarget.matches(':focus-visible') && show()}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
      >
        {term}
      </button>
      {open &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            className="panel anim-fade fixed z-[80] block w-[280px] p-3 text-[13px] leading-snug text-fg-2 shadow-xl"
            style={{ left: pos.x, top: pos.y, transform: pos.above ? 'translateY(-100%)' : undefined, animationDuration: '.16s' }}
          >
            <span className="mono mb-1 block text-[11px] uppercase tracking-wider text-accent">{term}</span>
            {glossary[term]}
          </span>,
          document.body,
        )}
    </>
  );
}
