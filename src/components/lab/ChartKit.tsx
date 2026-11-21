import { mulberry32 } from '@/lib/kit';
import { PrismCharacter } from '@/components/lab/legacy/Prism';

// Static drawing kit for the constellation mockups. Exploration only (see LabHero.tsx).

export const INK = '#eceaf3';
export const MUTED = '#a9a6b8';
export const DIM = '#77748a';
export const LINE = 'rgba(255,255,255,.09)';
export const BG = '#07080d';
export const KIND = { software: '#5eead4', ai: '#a78bfa', data: '#fbbf24', systems: '#60a5fa' } as const;
export const ROSE = '#f472b6';
export const GOLD = '#fbbf24';
export const mono = 'var(--font-jetbrains), monospace';

/** Sparse seeded star field + faint graticule + corner registration marks, behind a section. */
export function ChartBackdrop({ seed, w = 1440, h = 900, arcs = true }: { seed: number; w?: number; h?: number; arcs?: boolean }) {
  const r = mulberry32(seed);
  const stars = Array.from({ length: Math.round((w * h) / 9000) }, () => ({
    x: Math.round(r() * w),
    y: Math.round(r() * h),
    s: r() < 0.06 ? 1.3 : 0.4 + r() * 0.6,
    o: 0.12 + r() * 0.45,
  }));
  const cx = Math.round(w * (0.6 + r() * 0.5));
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {arcs && (
        <g fill="none" stroke="#fff" strokeOpacity=".04">
          {[0.5, 0.75, 1, 1.25].map((k) => (
            <circle key={k} cx={cx} cy={h * 1.5} r={Math.round(h * k * 1.4)} />
          ))}
        </g>
      )}
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} />
      ))}
    </svg>
  );
}

/** Corner registration ticks, like the corners of a printed chart plate. */
export function Corners({ color = 'rgba(255,255,255,.35)', size = 12 }: { color?: string; size?: number }) {
  const s = size;
  const st = { position: 'absolute' as const, width: s, height: s, borderColor: color };
  return (
    <>
      <span aria-hidden style={{ ...st, left: -1, top: -1, borderLeftWidth: 1, borderTopWidth: 1 }} />
      <span aria-hidden style={{ ...st, right: -1, top: -1, borderRightWidth: 1, borderTopWidth: 1 }} />
      <span aria-hidden style={{ ...st, left: -1, bottom: -1, borderLeftWidth: 1, borderBottomWidth: 1 }} />
      <span aria-hidden style={{ ...st, right: -1, bottom: -1, borderRightWidth: 1, borderBottomWidth: 1 }} />
    </>
  );
}

/** Section header: index + name, title with serif accent, and a ruler-style rule with the prism sitting on it. */
export function ChartHeader({ n, label, title, accent, coord }: { n: string; label: string; title: string; accent?: string; coord: string }) {
  return (
    <header className="relative mb-12">
      <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: DIM }}>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          <path d="M6 0 L7.2 4.8 L12 6 L7.2 7.2 L6 12 L4.8 7.2 L0 6 L4.8 4.8Z" fill={INK} />
        </svg>
        <span style={{ color: INK }}>{n}</span> {label}
        <span className="ml-auto normal-case tracking-[.1em]">{coord}</span>
      </p>
      <div className="mt-3 flex items-end gap-6">
        <h2 className="shrink-0 font-display text-[54px] font-bold leading-none tracking-[-0.035em]" style={{ color: INK }}>
          {title}
          {accent && (
            <>
              {' '}
              <span className="font-serif font-normal italic tracking-[-0.01em]" style={{ color: '#cfc9f5' }}>
                {accent}
              </span>
            </>
          )}
        </h2>
        <div className="relative mb-2 h-[10px] flex-1">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 10" aria-hidden>
            <line x1="0" y1="9.5" x2="100" y2="9.5" stroke="rgba(255,255,255,.22)" strokeWidth=".6" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between" aria-hidden>
            {Array.from({ length: 41 }, (_, i) => (
              <span key={i} style={{ width: 1, height: i % 10 === 0 ? 10 : i % 5 === 0 ? 7 : 4, background: 'rgba(255,255,255,.22)' }} />
            ))}
          </div>
          <div className="absolute bottom-0 right-10" style={{ transform: 'translateY(16px)' }}>
            <PrismCharacter pose="sit" size={42} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function StarGlyph({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden>
      <circle cx="6" cy="6" r="5.5" fill={color} opacity=".2" />
      <path d="M6 1 L7 5 L11 6 L7 7 L6 11 L5 7 L1 6 L5 5Z" fill={color} />
    </svg>
  );
}

/** A catalogue designation like TM-001 for a project id. Display-only label. */
export const designation = (id: number) => `TM-${String(id).padStart(3, '0')}`;
