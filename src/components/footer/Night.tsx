// Shared night-sky drawing for the four footer scenes: sky, hills, annotation and the moth placers.
// Shapes are recomposed from the approved lab frames (docs/design/mockups/footer-*.png) at 720 × 240;
// nothing here imports from src/components/lab/.

import { memo, useId, useMemo } from 'react';
import { MothCharacter, mothFeetInset, type MothPose } from '@/components/ui/Moth';
import { mulberry32 } from '@/lib/kit';

export const FW = 720;
export const FH = 240;
/** y of the hill crest the scenes stand on. */
export const GROUND = 205;

export const GOLD = '#f5c45e';
export const LAV = '#cfc9f5';
export const OUT = '#12122a';
export const STONE = '#232a4a';
export const mono = 'var(--font-jetbrains), monospace';

export const r1 = (v: number) => Math.round(v * 10) / 10;

/** Lab frames are 1104 × 400 with the ground at 342; this maps them onto 720 × 240 with the ground at 205. */
export const LAB = 0.652;
export const labX = (x: number) => r1(x * LAB);
export const labY = (y: number) => r1(y * LAB - 18);

/** Stars as [x, y, radius, opacity]. */
function makeStars(seed: number, n = 120): [number, number, number, number][] {
  const r = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const x = r1(r() * FW);
    const y = r1(r() * (GROUND - 18));
    const big = r() < 0.07;
    const s = big ? 1 : 0.3 + r() * 0.45;
    const o = 0.25 + r() * 0.6;
    return [x, y, r1(s), r1(o)];
  });
}

/** Vertical sky gradient, faint graticule arcs and seeded stars. `stars={false}` leaves the stars to the caller (Orbit). */
export const Sky = memo(function Sky({ seed, stars = true }: { seed: number; stars?: boolean }) {
  const id = useId().replace(/:/g, '');
  const list = useMemo(() => makeStars(seed), [seed]);
  return (
    <>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07080f" />
          <stop offset=".7" stopColor="#10142c" />
          <stop offset="1" stopColor="#1c2350" />
        </linearGradient>
      </defs>
      <rect width={FW} height={FH} fill={`url(#sky-${id})`} />
      <g fill="none" stroke="rgba(255,255,255,.045)">
        {[380, 520, 660].map((rr) => (
          <circle key={rr} cx={r1(FW * 0.86)} cy={r1(FH * 1.5)} r={r1((rr + 200) * LAB)} />
        ))}
      </g>
      {stars && list.map(([x, y, s, o], i) => <circle key={i} cx={x} cy={y} r={s} fill="#fff" opacity={o} />)}
    </>
  );
});

export { makeStars };

/** Far hill and near ground. `near` is a path in lab coordinates (1104 × 400). */
export function Hills({ near = 'M0 348 Q 260 324 560 338 T 1104 332 V400 H0Z' }: { near?: string }) {
  return (
    <g transform={`translate(0 -18) scale(${LAB})`}>
      <path d="M0 318 Q 200 292 420 306 T 840 298 T 1104 302 V400 H0Z" fill="#141a3a" />
      <path d={near} fill="var(--footer-ground)" />
    </g>
  );
}

/** The one mono annotation at the top left. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <text x="18" y="24" fontFamily={mono} fontSize="11" letterSpacing="2" fill="#8a879c">
      {children}
    </text>
  );
}

export function Spark({ x, y, s, c, opacity }: { x: number; y: number; s: number; c: string; opacity?: number }) {
  const k = s * 0.28;
  return (
    <path
      d={`M${r1(x)} ${r1(y - s)} L${r1(x + k)} ${r1(y - k)} L${r1(x + s)} ${r1(y)} L${r1(x + k)} ${r1(y + k)} L${r1(x)} ${r1(y + s)} L${r1(x - k)} ${r1(y + k)} L${r1(x - s)} ${r1(y)} L${r1(x - k)} ${r1(y - k)}Z`}
      fill={c}
      opacity={opacity}
    />
  );
}

const mirror = (cx: number) => `translate(${r1(cx)} 0) scale(-1 1) translate(${r1(-cx)} 0)`;

/** A spread-wing moth (`wave`, `jump`, `cheer`) centred on (cx, cy); `w` is the drawing's width. */
export function Flying({ cx, cy, w, pose = 'wave', rot = 0, flip = false }: { cx: number; cy: number; w: number; pose?: 'wave' | 'jump' | 'cheer'; rot?: number; flip?: boolean }) {
  const size = r1((w * 3) / 4);
  return (
    <g transform={`rotate(${r1(rot)} ${r1(cx)} ${r1(cy)})`}>
      <g transform={flip ? mirror(cx) : undefined}>
        <g transform={`translate(${r1(cx - w / 2)} ${r1(cy - size / 2)})`}>
          <MothCharacter pose={pose} size={size} />
        </g>
      </g>
    </g>
  );
}

/** A seated moth (`sit`, `idle`, `wink`, `sleep`, `crouch`, `land`) with its feet exactly on the surface at y = `base`. */
export function Seated({ cx, base, size, pose = 'sit', flip = false }: { cx: number; base: number; size: number; pose?: Exclude<MothPose, 'wave' | 'jump' | 'cheer'>; flip?: boolean }) {
  return (
    <g transform={flip ? mirror(cx) : undefined}>
      <g transform={`translate(${r1(cx - size / 2)} ${r1(base - size + mothFeetInset(size))})`}>
        <MothCharacter pose={pose} size={size} />
      </g>
    </g>
  );
}
