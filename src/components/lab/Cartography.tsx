'use client';

import { useMemo } from 'react';
import { useSceneTime } from '@/lib/clock';
import { useMotion } from '@/lib/motion';
import { mulberry32, seg, easeOut } from '@/lib/kit';
import { projects } from '@/data/projects';
import { LabHero, SPECTRUM, TILES } from './LabHero';

/* Constellations & cartography. A night sky charted like an old survey: a curved graticule, your real
   coordinates, a compass and scale bar. The projects are stars, coloured by kind the way astronomers
   class stars by spectrum, and the featured four plus two eyes trace "the Prism" constellation. A route
   draws itself from "you are here" to the first project. Tiles become chart markers. */

const VW = 1440, VH = 900;
const kindColor = { software: SPECTRUM[0], ai: SPECTRUM[2], data: SPECTRUM[4], systems: SPECTRUM[1] } as const;

// The Prism constellation: apex, base corners and a mid-base star; two faint "eye" stars inside.
const SHAPE: [number, number][] = [
  [1030, 210], // apex
  [1200, 548], // base right
  [860, 548], // base left
  [1108, 365], // right face
];
const EYES: [number, number][] = [
  [1002, 452],
  [1058, 452],
];

export function CartographyLab() {
  const { reduced } = useMotion();
  const t = useSceneTime(!reduced, 30);

  const stars = useMemo(() => {
    const r = mulberry32(2026);
    return Array.from({ length: 260 }, () => ({ x: Math.round(r() * VW), y: Math.round(r() * VH), s: r() < 0.08 ? 1.4 : 0.5 + r() * 0.7, o: 0.2 + r() * 0.6, tw: r() < 0.2, ph: r() * 6, hue: r() }));
  }, []);

  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const others = projects.filter((p) => !p.featured);
  const otherPos = useMemo(() => {
    const r = mulberry32(77);
    return others.map((_, i) => [880 + r() * 480, 620 + (i % 3) * 70 + r() * 40] as [number, number]);
  }, [others.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const lines: [number, number][] = [[0, 3], [3, 1], [1, 2], [2, 0]];
  const draw = (i: number) => easeOut(seg(t, 0.6 + i * 0.5, 1.4 + i * 0.5));
  const route = easeOut(seg(t, 2.8, 4.6));
  const here: [number, number] = [640, 760];

  const background = (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="ct-sky" cx="70%" cy="40%" r="90%">
          <stop offset="0" stopColor="#141428" />
          <stop offset=".55" stopColor="#0a0b16" />
          <stop offset="1" stopColor="#05060b" />
        </radialGradient>
        <filter id="ct-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <radialGradient id="ct-milky" cx="0" cy="0" r="1" gradientTransform="translate(980 380) rotate(-28) scale(760 150)" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#a78bfa" stopOpacity=".12" />
          <stop offset=".6" stopColor="#60a5fa" stopOpacity=".05" />
          <stop offset="1" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={VW} height={VH} fill="url(#ct-sky)" />
      <rect width={VW} height={VH} fill="url(#ct-milky)" />

      {/* graticule: arcs of a sky dome centred off-screen right */}
      <g fill="none" stroke="#fff" strokeOpacity=".055">
        {[260, 420, 580, 740, 900].map((r) => (
          <circle key={r} cx="1250" cy="1150" r={r * 1.35} />
        ))}
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI + (i / 8) * Math.PI * 0.62 + 0.25;
          return <line key={i} x1="1250" y1="1150" x2={Math.round(1250 + Math.cos(a) * 1600)} y2={Math.round(1150 + Math.sin(a) * 1600)} />;
        })}
      </g>
      <g fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#fff" fillOpacity=".22" letterSpacing=".12em">
        {[20, 40, 60].map((d, i) => (
          <text key={d} x={1250 - [420, 580, 740][i] * 1.35 * 0.72} y={1150 - [420, 580, 740][i] * 1.35 * 0.69}>
            {d}°
          </text>
        ))}
      </g>

      {/* background stars */}
      {stars.map((s, i) => {
        const tw = s.tw && !reduced ? 0.55 + 0.45 * Math.sin(t * 1.4 + s.ph) : 1;
        const c = s.hue > 0.92 ? SPECTRUM[Math.floor(s.hue * 50) % 5] : '#fff';
        return <circle key={i} cx={s.x} cy={s.y} r={s.s} fill={c} opacity={s.o * tw} />;
      })}

      {/* the Prism constellation */}
      <g stroke="#eceaf3" strokeOpacity=".35" strokeWidth="1">
        {lines.map(([a, b], i) => {
          const p = draw(i);
          const A = SHAPE[a], B = SHAPE[b];
          return <line key={i} x1={A[0]} y1={A[1]} x2={A[0] + (B[0] - A[0]) * p} y2={A[1] + (B[1] - A[1]) * p} />;
        })}
      </g>
      {EYES.map(([x, y], i) => (
        <g key={i} opacity={seg(t, 2.6, 3.2)}>
          <circle cx={x} cy={y} r="5" fill="#eceaf3" opacity=".25" filter="url(#ct-glow)" />
          <circle cx={x} cy={y} r="2.2" fill="#eceaf3" />
        </g>
      ))}
      {featured.map((p, i) => {
        const [x, y] = SHAPE[i];
        const c = kindColor[p.kind];
        const on = seg(t, 0.3 + i * 0.4, 0.9 + i * 0.4);
        const pulse = reduced ? 1 : 0.8 + 0.2 * Math.sin(t * 1.2 + i);
        const flip = i === 1; // base-right label sits left of its star, clear of the markers
        const lx = flip ? x - 16 : x + 16;
        const anchor = flip ? 'end' : 'start';
        return (
          <g key={p.slug} opacity={on}>
            <circle cx={x} cy={y} r={16 * pulse} fill={c} opacity=".35" filter="url(#ct-glow)" />
            <circle cx={x} cy={y} r="4.5" fill={c} />
            <path d={`M${x - 12},${y} h6 M${x + 6},${y} h6 M${x},${y - 12} v6 M${x},${y + 6} v6`} stroke={c} strokeOpacity=".6" />
            <text x={lx} y={y - 10} textAnchor={anchor} fontFamily="var(--font-jetbrains), monospace" fontSize="11" letterSpacing=".14em" fill="#eceaf3" fillOpacity=".8">
              {p.title.toUpperCase().replace('2D VISIBILITY & LIGHTING ENGINE', 'VISIBILITY ENGINE')}
            </text>
            <text x={lx} y={y + 4} textAnchor={anchor} fontFamily="var(--font-jetbrains), monospace" fontSize="9" letterSpacing=".12em" fill={c} fillOpacity=".8">
              {p.kind.toUpperCase()} · {p.period.toUpperCase()}
            </text>
          </g>
        );
      })}
      <text x="1030" y="604" textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="22" fill="#eceaf3" fillOpacity={0.5 * seg(t, 3, 4)}>
        the Prism
      </text>

      {/* the rest of the work, as fainter stars */}
      {others.map((p, i) => {
        const [x, y] = otherPos[i];
        return (
          <g key={p.slug} opacity={0.4 + 0.6 * seg(t, 1.5 + i * 0.15, 2.2 + i * 0.15)}>
            <circle cx={x} cy={y} r="2.6" fill={kindColor[p.kind]} />
            <circle cx={x} cy={y} r="7" fill={kindColor[p.kind]} opacity=".2" filter="url(#ct-glow)" />
          </g>
        );
      })}

      {/* route from "you are here" to the apex */}
      <path
        d={`M${here[0]},${here[1]} C ${here[0] + 200},${here[1] - 40} ${SHAPE[2][0] - 160},${SHAPE[2][1] + 140} ${SHAPE[2][0]},${SHAPE[2][1]}`}
        fill="none"
        stroke="#fbbf24"
        strokeOpacity=".7"
        strokeWidth="1.4"
        strokeDasharray="5 6"
        pathLength={1}
        style={{ strokeDasharray: `${route * 1} 1`, strokeDashoffset: 0 }}
      />
      <g transform={`translate(${here[0]} ${here[1]})`}>
        <circle r="6" fill="none" stroke="#fbbf24" />
        <circle r="1.8" fill="#fbbf24" />
        <circle r={6 + ((t * 10) % 18)} fill="none" stroke="#fbbf24" opacity={reduced ? 0 : 1 - ((t * 10) % 18) / 18} />
        <text x="14" y="4" fontFamily="var(--font-jetbrains), monospace" fontSize="10" letterSpacing=".14em" fill="#fbbf24" fillOpacity=".85">
          YOU ARE HERE
        </text>
      </g>

      {/* compass + scale bar */}
      <g transform="translate(1340 800)" stroke="#fff" strokeOpacity=".35" fill="none">
        <circle r="26" />
        <circle r="18" strokeOpacity=".15" />
        <path d="M0 -34 L5 0 L0 34 L-5 0Z" fill="#fff" fillOpacity=".12" />
        <text y="-40" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#fff" fillOpacity=".4" stroke="none">
          N
        </text>
      </g>
      <g transform="translate(1110 838)" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#fff" fillOpacity=".35" letterSpacing=".12em">
        <path d="M0 0 h120 M0 -4 v8 M60 -3 v6 M120 -4 v8" stroke="#fff" strokeOpacity=".35" />
        <text x="0" y="18">0</text>
        <text x="120" y="18" textAnchor="end">ONE PROJECT</text>
      </g>
    </svg>
  );

  // Chart markers: a ringed plate with tick marks; faint survey lines link neighbours on each side.
  const tiles = (
    <>
      {(['l', 'r'] as const).map((side) => {
        const list = TILES.filter((x) => x.side === side);
        return (
          <svg
            key={side}
            className="absolute top-0 h-full"
            style={{ [side === 'l' ? 'left' : 'right']: 'max(10px, calc((100vw - 1152px) / 2 - 80px))', width: 64 }}
            viewBox="0 0 64 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline points={list.map((x) => `32,${x.y + 3}`).join(' ')} fill="none" stroke="#fff" strokeOpacity=".08" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
          </svg>
        );
      })}
      {TILES.map((tile, i) => {
        const c = SPECTRUM[i % SPECTRUM.length];
        return (
          <div
            key={tile.label}
            className="lab-marker absolute grid h-[52px] w-[52px] place-items-center"
            style={{
              [tile.side === 'l' ? 'left' : 'right']: 'max(16px, calc((100vw - 1152px) / 2 - 74px))',
              top: `${tile.y}%`,
              animationDelay: `${i * -1.1}s`,
            }}
          >
            <svg viewBox="0 0 52 52" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <circle cx="26" cy="26" r="19" fill="rgba(10,11,22,.7)" stroke="#fff" strokeOpacity=".16" />
              <circle cx="26" cy="26" r="23" fill="none" stroke={c} strokeOpacity=".45" strokeDasharray="2 4" />
              <path d="M26 1 v6 M26 45 v6 M1 26 h6 M45 26 h6" stroke={c} strokeOpacity=".7" />
            </svg>
            <span className="relative font-mono text-[12.5px] font-bold text-[#dcd9e8]">{tile.label}</span>
          </div>
        );
      })}
      <style>{`
        .lab-marker { animation: marker 13s ease-in-out infinite; }
        @keyframes marker { 50% { transform: translateY(-8px); } }
        [data-motion='reduced'] .lab-marker { animation: none; }
      `}</style>
    </>
  );

  return (
    <LabHero
      variant="cartography"
      name="Motif B · constellations & cartography · 39.12° N 77.56° W"
      background={background}
      tiles={tiles}
      note="A charted night sky; the featured projects form a constellation called the Prism, and a route runs from you are here."
    />
  );
}
