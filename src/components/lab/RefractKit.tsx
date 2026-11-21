'use client';

import { mulberry32 } from '@/lib/kit';
import { PrismCharacter } from '@/components/lab/legacy/Prism';

// Static drawing kit for the light & refraction mockups. Exploration only (see LabHero.tsx).

export const R_INK = '#eceaf3';
export const R_MUTED = '#a9a6b8';
export const R_DIM = '#77748a';
export const R_LINE = 'rgba(255,255,255,.09)';
export const R_BG = '#08080c';
export const BANDS = ['#5eead4', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'];
export const R_KIND = { software: BANDS[0], ai: BANDS[2], data: BANDS[4], systems: BANDS[1] } as const;
export const SPEC = `linear-gradient(90deg, ${BANDS.join(', ')})`;

/** Soft light falling across a section: one or two blurred spectral washes, a faint beam and film grain. */
export function LightBackdrop({ seed, w = 1440, h = 900 }: { seed: number; w?: number; h?: number }) {
  const r = mulberry32(seed);
  const ox = Math.round(w * (0.55 + r() * 0.35));
  const oy = Math.round(h * (0.05 + r() * 0.2));
  const id = `lb${seed}`;
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <filter id={`${id}-b`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
        <pattern id={`${id}-g`} width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".35" fill="#fff" opacity=".03" />
        </pattern>
      </defs>
      <g filter={`url(#${id}-b)`} opacity=".22" style={{ mixBlendMode: 'screen' }}>
        {BANDS.map((c, i) => {
          const a0 = ((100 + i * 9) * Math.PI) / 180;
          const a1 = ((100 + (i + 1) * 9) * Math.PI) / 180;
          const L = h * 1.4;
          return (
            <path
              key={c}
              d={`M${ox},${oy} L${Math.round(ox + Math.cos(a0) * L)},${Math.round(oy + Math.sin(a0) * L)} L${Math.round(ox + Math.cos(a1) * L)},${Math.round(oy + Math.sin(a1) * L)}Z`}
              fill={c}
            />
          );
        })}
      </g>
      <line x1={-20} y1={Math.round(oy - 120)} x2={ox} y2={oy} stroke="#fff" strokeOpacity=".08" strokeWidth="1" />
      <rect width={w} height={h} fill={`url(#${id}-g)`} />
    </svg>
  );
}

/** Glass panel: frosted, hairline border, a spectral sheen along the top edge. */
export function Glass({ children, className = '', sheen = true, tone }: { children: React.ReactNode; className?: string; sheen?: boolean; tone?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[14px] border ${className}`}
      style={{ borderColor: R_LINE, background: 'linear-gradient(160deg, rgba(255,255,255,.055), rgba(255,255,255,.015) 40%, rgba(255,255,255,.03))', backdropFilter: 'blur(6px)' }}
    >
      {sheen && <span aria-hidden className="absolute inset-x-6 top-0 h-px" style={{ background: tone ? `linear-gradient(90deg, transparent, ${tone}, transparent)` : SPEC, opacity: 0.7 }} />}
      {children}
    </div>
  );
}

/** Section header: a white beam runs along the rule, meets the seated prism and fans into a short spectrum. */
export function LightHeader({ n, label, title, accent, aside }: { n: string; label: string; title: string; accent?: string; aside: string }) {
  return (
    <header className="relative mb-12">
      <p className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: R_DIM }}>
        <svg width="12" height="11" viewBox="0 0 12 11" aria-hidden>
          <path d="M6 0 L12 11 L0 11Z" fill="none" stroke={R_INK} strokeWidth="1.2" />
        </svg>
        <span style={{ color: R_INK }}>{n}</span> {label}
        <span className="ml-auto normal-case tracking-[.08em]">{aside}</span>
      </p>
      <div className="mt-3 flex items-end gap-6">
        <h2 className="shrink-0 font-display text-[54px] font-bold leading-none tracking-[-0.035em]" style={{ color: R_INK }}>
          {title}
          {accent && (
            <>
              {' '}
              <span className="font-serif font-normal italic" style={{ background: SPEC, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingRight: '.08em' }}>
                {accent}
              </span>
            </>
          )}
        </h2>
        <div className="relative mb-2 h-[44px] flex-1">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 44" preserveAspectRatio="none" aria-hidden>
            <defs>
              <linearGradient id={`beam-${n}`} x1="0" y1="0" x2="520" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#fff" stopOpacity=".55" />
              </linearGradient>
            </defs>
            <line x1="0" y1="43" x2="520" y2="43" stroke={`url(#beam-${n})`} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            {BANDS.map((c, i) => (
              <line key={c} x1="545" y1="43" x2="600" y2={36 + i * 2} stroke={c} strokeOpacity=".8" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          <div className="absolute bottom-[-14px] right-[42px]">
            <PrismCharacter pose="sit" size={42} />
          </div>
        </div>
      </div>
    </header>
  );
}

/** A small spectrum swatch used as a bullet/legend mark. */
export function Swatch({ color, w = 10 }: { color: string; w?: number }) {
  return <span aria-hidden className="inline-block rounded-full" style={{ width: w, height: w, background: color, boxShadow: `0 0 10px ${color}66` }} />;
}
