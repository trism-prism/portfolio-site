'use client';

import { useId } from 'react';
import { useNear } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';
import { useSceneTime } from '@/lib/clock';

// Shared drawing vocabulary for every scene: one dot-grid stage, 8px mono labels, thin lines,
// low-contrast panels, and accent/semantic signal colors. Scenes change the mechanism, not the grammar.

export const C = {
  line: 'var(--sc-line)',
  faint: 'var(--sc-faint)',
  panel: 'var(--sc-panel)',
  label: 'var(--sc-label)',
  ink: 'var(--sc-ink)',
  fg: 'var(--fg)',
  accent: 'var(--accent)',
  soft: 'var(--accent-soft)',
  violet: 'var(--violet)',
  amber: 'var(--amber)',
  green: 'var(--green)',
  red: 'var(--red)',
  coral: 'var(--coral)',
  sky: 'var(--sky)',
};

export type SceneProps = { t: number; reduced: boolean };

/**
 * Mounts the scene only within 300px of the viewport (a same-size placeholder keeps layout still),
 * runs it on the shared clock while near, and freezes it at `frozenAt` in Reduced motion.
 */
export function SceneHost({
  Scene,
  frozenAt,
  w = 320,
  h = 200,
  label,
  className = '',
}: {
  Scene: React.ComponentType<SceneProps>;
  frozenAt: number;
  w?: number;
  h?: number;
  label: string;
  className?: string;
}) {
  const [ref, near] = useNear<HTMLDivElement>('300px');
  const { reduced } = useMotion();
  const t = useSceneTime(near && !reduced, reduced ? frozenAt : undefined);
  return (
    <div ref={ref} className={className} role="img" aria-label={label}>
      {near || reduced ? (
        <Stage w={w} h={h}>
          <Scene t={reduced ? frozenAt : t} reduced={reduced} />
        </Stage>
      ) : (
        <Stage w={w} h={h} />
      )}
    </div>
  );
}

export function Stage({ w = 320, h = 200, children }: { w?: number; h?: number; children?: React.ReactNode }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="cover-stage block h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <pattern id={`dots-${id}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".6" fill="var(--sc-faint)" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#dots-${id})`} />
      {children}
    </svg>
  );
}

export function Label({ x, y, children, anchor = 'middle', fill = C.label, size = 8 }: { x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; fill?: string; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily="var(--font-jetbrains), monospace" fontSize={size} fontWeight={700} letterSpacing=".08em" fill={fill}>
      {children}
    </text>
  );
}

export function Box({ x, y, w, h, r = 5, stroke = C.line, fill = C.panel, sw = 1, opacity = 1, dash }: { x: number; y: number; w: number; h: number; r?: number; stroke?: string; fill?: string; sw?: number; opacity?: number; dash?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth={sw} opacity={opacity} strokeDasharray={dash} />;
}

/** Thin placeholder text lines inside a panel. */
export function Lines({ x, y, widths, gap = 6, color = C.line, sw = 2 }: { x: number; y: number; widths: number[]; gap?: number; color?: string; sw?: number }) {
  return (
    <g stroke={color} strokeWidth={sw} strokeLinecap="round">
      {widths.map((w, i) => (
        <line key={i} x1={x} y1={y + i * gap} x2={x + w} y2={y + i * gap} />
      ))}
    </g>
  );
}

/** A glowing packet. */
export function Packet({ x, y, color = C.accent, r = 3, opacity = 1 }: { x: number; y: number; color?: string; r?: number; opacity?: number }) {
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={r * 2.4} fill={color} opacity=".18" />
      <circle cx={x} cy={y} r={r} fill={color} />
    </g>
  );
}

export function Check({ x, y, s = 1, color = C.green }: { x: number; y: number; s?: number; color?: string }) {
  return <path d={`M${x - 4 * s},${y} l${3 * s},${3 * s} l${5.5 * s},${-6 * s}`} stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

export function Cross({ x, y, s = 1, color = C.red }: { x: number; y: number; s?: number; color?: string }) {
  return <path d={`M${x - 3.5 * s},${y - 3.5 * s} l${7 * s},${7 * s} M${x + 3.5 * s},${y - 3.5 * s} l${-7 * s},${7 * s}`} stroke={color} strokeWidth={1.8} strokeLinecap="round" />;
}
