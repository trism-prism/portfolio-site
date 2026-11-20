'use client';

import { useSeenOnce } from '@/lib/hooks';

/** Fades/rises children in the first time they enter the viewport. Content is in the HTML regardless. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'section';
}) {
  const [ref, seen] = useSeenOnce<HTMLDivElement>();
  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`reveal ${seen ? 'in' : ''} ${className}`}
      style={{ transitionDelay: seen ? `${delay}s` : undefined }}
    >
      {children}
    </Tag>
  );
}

/** Per-character spring reveal. Words never break mid-word; screen readers get the plain sentence. */
export function CharacterReveal({ text, className = '', stagger = 0.018 }: { text: string; className?: string; stagger?: number }) {
  const [ref, seen] = useSeenOnce<HTMLSpanElement>();
  let i = 0;
  return (
    <span ref={ref} className={`${className} ${seen ? 'cr-in' : ''}`} aria-label={text} role="text">
      {text.split(' ').map((word, w) => (
        <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
          {[...word].map((ch) => {
            const d = i++ * stagger;
            return (
              <span key={d} className="cr-char" style={{ transitionDelay: `${d}s` }}>
                {ch}
              </span>
            );
          })}
          {w < text.split(' ').length - 1 && <span className="cr-char">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
