'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSceneTime } from '@/lib/clock';
import { useMotion } from '@/lib/motion';
import { mulberry32 } from '@/lib/kit';
import { LabHero, SPECTRUM, TILES } from './LabHero';

/* Light & refraction. A single white beam crosses the page and meets a large glass prism (the prism
   character, blinking). It leaves as a spectrum that washes the lower right of the hero. The pointer
   nudges the beam a little, like tilting the glass; it is not a flashlight. Tiles become glass shards
   whose edges pick up the colour of the nearest band. */

const VW = 1440, VH = 900;
// Prism geometry (equilateral-ish, apex up).
const P = { top: [1090, 210] as const, left: [900, 560] as const, right: [1280, 560] as const };

export function RefractionLab() {
  const { reduced } = useMotion();
  const t = useSceneTime(!reduced, 0);
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0, target = 0;
    const move = (e: PointerEvent) => {
      target = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(step);
    };
    const step = () => {
      raf = 0;
      setTilt((v) => {
        const n = v + (target - v) * 0.12;
        if (Math.abs(target - n) > 0.002) raf = requestAnimationFrame(step);
        return n;
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const entryY = 400 + tilt * 26; // where the beam meets the left face
  // Point on the left face at entryY.
  const fy = (entryY - P.top[1]) / (P.left[1] - P.top[1]);
  const entry: [number, number] = [P.top[0] + (P.left[0] - P.top[0]) * fy, entryY];
  const exitY = entryY + 34 + tilt * 6;
  const fr = (exitY - P.top[1]) / (P.right[1] - P.top[1]);
  const exit: [number, number] = [P.top[0] + (P.right[0] - P.top[0]) * fr, exitY];
  const spread = 1 + 0.06 * Math.sin(t * 0.4);
  const breath = 0.85 + 0.15 * Math.sin(t * 0.6);

  // Spectrum bands fan downward to the right.
  const bands = SPECTRUM.map((c, i) => {
    const a0 = (4 + i * 10 * spread) * (Math.PI / 180);
    const a1 = (4 + (i + 1) * 10 * spread) * (Math.PI / 180);
    const L = 1100;
    const q = (n: number) => Math.round(n * 10) / 10;
    return {
      c,
      d: `M${q(exit[0])},${q(exit[1])} L${q(exit[0] + Math.cos(a0) * L)},${q(exit[1] + Math.sin(a0) * L)} L${q(exit[0] + Math.cos(a1) * L)},${q(exit[1] + Math.sin(a1) * L)}Z`,
    };
  });

  const motes = useMemo(() => {
    const r = mulberry32(11);
    return Array.from({ length: 46 }, () => ({ p: r(), off: (r() - 0.5) * 34, s: 0.6 + r() * 1.4, sp: 0.01 + r() * 0.03, ph: r() * 6 }));
  }, []);

  const beamStart: [number, number] = [-40, entryY - 360];
  const blink = !reduced && t % 6.2 > 6.05;

  const background = (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="rf-vignette" cx="35%" cy="40%" r="80%">
          <stop offset="0" stopColor="#11131d" />
          <stop offset="1" stopColor="#06070b" />
        </radialGradient>
        <linearGradient id="rf-beam" x1={beamStart[0]} y1={beamStart[1]} x2={entry[0]} y2={entry[1]} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity=".9" />
        </linearGradient>
        {bands.map((b, i) => (
          <radialGradient key={i} id={`rf-band-${i}`} cx={exit[0]} cy={exit[1]} r="1100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={b.c} stopOpacity={0.9 * breath} />
            <stop offset=".45" stopColor={b.c} stopOpacity={0.3 * breath} />
            <stop offset="1" stopColor={b.c} stopOpacity="0" />
          </radialGradient>
        ))}
        <linearGradient id="rf-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".14" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".04" />
          <stop offset="1" stopColor="#fff" stopOpacity=".08" />
        </linearGradient>
        <filter id="rf-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="rf-soft">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <pattern id="rf-grain" width="3" height="3" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill="transparent" />
          <circle cx="1" cy="1" r=".35" fill="#fff" opacity=".035" />
        </pattern>
      </defs>
      <rect width={VW} height={VH} fill="url(#rf-vignette)" />
      <rect width={VW} height={VH} fill="url(#rf-grain)" />

      {/* spectrum wash, blurred then crisp */}
      <g style={{ mixBlendMode: 'screen' }} filter="url(#rf-blur)">
        {bands.map((b, i) => (
          <path key={i} d={b.d} fill={`url(#rf-band-${i})`} />
        ))}
      </g>
      <g style={{ mixBlendMode: 'screen' }} opacity=".55">
        {bands.map((b, i) => (
          <path key={i} d={b.d} fill={`url(#rf-band-${i})`} />
        ))}
      </g>

      {/* incoming beam */}
      <line x1={beamStart[0]} y1={beamStart[1]} x2={entry[0]} y2={entry[1]} stroke="url(#rf-beam)" strokeWidth="10" filter="url(#rf-blur)" />
      <line x1={beamStart[0]} y1={beamStart[1]} x2={entry[0]} y2={entry[1]} stroke="url(#rf-beam)" strokeWidth="1.6" />
      {motes.map((m, i) => {
        const p = (m.p + t * m.sp) % 1;
        const x = beamStart[0] + (entry[0] - beamStart[0]) * p;
        const y = beamStart[1] + (entry[1] - beamStart[1]) * p + m.off + Math.sin(t * 0.8 + m.ph) * 4;
        return <circle key={i} cx={x} cy={y} r={m.s} fill="#fff" opacity={0.15 + 0.35 * Math.sin(p * Math.PI)} />;
      })}

      {/* path inside the glass */}
      <line x1={entry[0]} y1={entry[1]} x2={exit[0]} y2={exit[1]} stroke="#fff" strokeOpacity=".7" strokeWidth="2" filter="url(#rf-soft)" />

      {/* the prism (the character, at scale) */}
      <path d={`M${P.top} L${P.right} L${P.left}Z`} fill="url(#rf-glass)" stroke="#fff" strokeOpacity=".28" strokeWidth="1.4" strokeLinejoin="round" />
      <path d={`M${P.top} L${P.left[0] + 40},${P.left[1] - 8}`} stroke="#fff" strokeOpacity=".18" strokeWidth="1" />
      <path d={`M${P.top[0] + 6},${P.top[1] + 24} L${P.left[0] + 70},${P.left[1] - 30}`} stroke="#fff" strokeOpacity=".22" strokeWidth="3" strokeLinecap="round" filter="url(#rf-soft)" />
      <g transform={`translate(${P.top[0]} 452)`}>
        <ellipse cx="-30" cy="0" rx="9" ry={blink ? 1.2 : 12} fill="#eceaf3" opacity=".85" />
        <ellipse cx="30" cy="0" rx="9" ry={blink ? 1.2 : 12} fill="#eceaf3" opacity=".85" />
      </g>
      {/* caustic pool where the light lands */}
      <ellipse cx="1180" cy="860" rx="420" ry="60" fill="url(#rf-band-2)" opacity=".35" filter="url(#rf-blur)" />
    </svg>
  );

  // Glass shards: edge colour from the nearest spectrum band (by vertical position).
  const tiles = (
    <>
      {TILES.map((tile, i) => {
        const c = SPECTRUM[Math.min(SPECTRUM.length - 1, Math.floor((tile.y / 100) * SPECTRUM.length))];
        const lit = tile.side === 'r' && tile.y > 40;
        return (
          <div
            key={tile.label}
            className="lab-shard absolute grid h-[52px] w-[46px] place-items-center"
            style={{
              [tile.side === 'l' ? 'left' : 'right']: `max(16px, calc((100vw - 1152px) / 2 - 70px))`,
              top: `${tile.y}%`,
              animationDelay: `${i * -1.3}s`,
            }}
          >
            <svg viewBox="0 0 46 52" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id={`sh-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor={c} stopOpacity={lit ? 0.9 : 0.55} />
                  <stop offset="1" stopColor="#fff" stopOpacity=".08" />
                </linearGradient>
              </defs>
              <path d="M23 2 L44 14 L44 38 L23 50 L2 38 L2 14Z" fill={lit ? `${c}14` : 'rgba(255,255,255,.035)'} stroke={`url(#sh-${i})`} strokeWidth="1.2" />
              <path d="M23 2 L23 50 M2 14 L44 38" stroke="#fff" strokeOpacity=".05" />
            </svg>
            <span className="relative font-mono text-[13px] font-bold" style={{ color: lit ? c : '#c9c6d6' }}>
              {tile.label}
            </span>
          </div>
        );
      })}
      <style>{`
        .lab-shard { animation: shard 11s ease-in-out infinite; }
        @keyframes shard { 50% { transform: translate(4px, -10px) rotate(3deg); } }
        [data-motion='reduced'] .lab-shard { animation: none; }
      `}</style>
    </>
  );

  return (
    <LabHero
      variant="refraction"
      name="Motif A · light & refraction"
      background={background}
      tiles={tiles}
      note="A beam of white light crosses the page into a large glass prism with eyes and leaves as a spectrum."
    />
  );
}
