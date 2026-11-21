// Mascot concepts for the constellations & cartography direction (lab only).
// Each concept draws four poses from one set of shapes: hero, sit (on a section rule), footer and mark (logo/favicon).
// Characters keep fixed illustration colours in both themes, inked with a thin dark outline so they read on twilight.

import { PrismCharacter, PrismMark } from '@/components/lab/legacy/Prism';
import { mulberry32 } from '@/lib/kit';
import { dark, type Tokens } from './themeTokens';

export type Pose = 'hero' | 'sit' | 'footer' | 'mark';

const OUT = '#12122a'; // ink outline
const PALE = '#f3f0fb'; // mask / face
const DEEP = '#16152c'; // eyes
const NIGHT = '#272650'; // dark bodies
const GOLD = '#f5c45e';
const LAV = '#cfc9f5';
const SPEC = dark.spectrum;
const r1 = (v: number) => Math.round(v * 10) / 10;

type Draw = { w: number; x?: number; y?: number };

function Eyes({ cx, cy, gap, rx = 2.6, ry = 3.6, closed = false, look = 0 }: { cx: number; cy: number; gap: number; rx?: number; ry?: number; closed?: boolean; look?: number }) {
  return (
    <g>
      {[cx - gap / 2, cx + gap / 2].map((x) =>
        closed ? (
          <path key={x} d={`M${x - rx - 0.6} ${cy} Q${x} ${cy + ry * 0.9} ${x + rx + 0.6} ${cy}`} fill="none" stroke={DEEP} strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <g key={x}>
            <ellipse cx={x} cy={cy - look} rx={rx} ry={ry} fill={DEEP} />
            <circle cx={r1(x - rx * 0.35)} cy={r1(cy - look - ry * 0.4)} r={r1(rx * 0.38)} fill="#fff" />
          </g>
        ),
      )}
    </g>
  );
}

function Spark({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  const k = s * 0.28;
  return <path d={`M${x} ${y - s} L${r1(x + k)} ${r1(y - k)} L${x + s} ${y} L${r1(x + k)} ${r1(y + k)} L${x} ${y + s} L${r1(x - k)} ${r1(y + k)} L${x - s} ${y} L${r1(x - k)} ${r1(y - k)}Z`} fill={c} />;
}

/* ---------------- 1. Prism (current) ---------------- */
export function Prism({ pose, w }: { pose: Pose } & Draw) {
  if (pose === 'mark') return <PrismMark size={w} />;
  return <PrismCharacter pose={pose === 'hero' ? 'wave' : 'sit'} size={w} />;
}

/* ---------------- 2. Mote: a fallen star ---------------- */
const STAR = 'M60 14 C64 40 80 56 106 60 C80 64 64 80 60 106 C56 80 40 64 14 60 C40 56 56 40 60 14Z';

function MoteBody({ closed = false, id }: { closed?: boolean; id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-f`} cx=".5" cy=".5" r=".55">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#fff3cf" />
          <stop offset="1" stopColor="#ffd77a" />
        </radialGradient>
        <radialGradient id={`${id}-g`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={GOLD} stopOpacity=".45" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill={`url(#${id}-g)`} />
      <path d={STAR} fill={`url(#${id}-f)`} stroke={OUT} strokeWidth="1.6" strokeLinejoin="round" />
      <Eyes cx={60} cy={61} gap={14} closed={closed} />
      <circle cx="47.5" cy="67" r="2.6" fill="#f472b6" opacity=".35" />
      <circle cx="72.5" cy="67" r="2.6" fill="#f472b6" opacity=".35" />
    </g>
  );
}

export function Mote({ pose, w, x, y }: { pose: Pose } & Draw) {
  if (pose === 'mark')
    return (
      <svg width={w} height={w} viewBox="0 0 32 32" x={x} y={y} aria-hidden>
        <path d="M16 1.5 C17.2 11 21 14.8 30.5 16 C21 17.2 17.2 21 16 30.5 C14.8 21 11 17.2 1.5 16 C11 14.8 14.8 11 16 1.5Z" fill="#ffe9a8" stroke={OUT} strokeWidth=".8" strokeLinejoin="round" />
        <ellipse cx="13.6" cy="16.4" rx="1.2" ry="1.8" fill={DEEP} />
        <ellipse cx="18.4" cy="16.4" rx="1.2" ry="1.8" fill={DEEP} />
      </svg>
    );
  if (pose === 'sit')
    return (
      <svg width={w} height={w} viewBox="0 0 120 120" x={x} y={y} aria-hidden>
        <ellipse cx="60" cy="116" rx="26" ry="3" fill={GOLD} opacity=".35" />
        <g transform="translate(60 116) scale(1.06 .9) translate(-60 -106)">
          <MoteBody closed id={`mote-sit-${w}`} />
        </g>
      </svg>
    );
  // hero + footer: floating, tilted, with a spectral trail
  const trail = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    const px = (1 - t) * (1 - t) * 58 + 2 * (1 - t) * t * 26 + t * t * 6;
    const py = (1 - t) * (1 - t) * 96 + 2 * (1 - t) * t * 100 + t * t * 126;
    return { x: r1(px), y: r1(py), s: r1(4.2 - t * 3.4), c: SPEC[i % SPEC.length] };
  });
  return (
    <svg width={w} height={(w * 132) / 160} viewBox="0 0 160 132" x={x} y={y} aria-hidden>
      {trail.map((d) => (
        <Spark key={d.x} {...d} />
      ))}
      <g transform="translate(40 2) rotate(-14 60 60)">
        <MoteBody id={`mote-${pose}-${w}`} />
      </g>
    </svg>
  );
}

/* ---------------- 3. Moth: wings carry a star chart ---------------- */
const FORE = 'M74 50 C58 30 34 14 18 20 C9 24 13 48 26 66 C38 74 60 72 74 64Z';
const HIND = 'M74 66 C58 72 40 84 38 100 C38 112 54 114 66 104 C72 96 76 84 76 74Z';
const WING_STARS: [number, number][] = [
  [28, 32],
  [42, 28],
  [52, 44],
  [36, 54],
];

function Antennae({ cx, top, spread }: { cx: number; top: number; spread: number }) {
  const l = `M${cx - 3} ${top + 22} C${cx - 8} ${top + 10} ${cx - spread * 0.6} ${top + 4} ${cx - spread} ${top}`;
  const r = `M${cx + 3} ${top + 22} C${cx + 8} ${top + 10} ${cx + spread * 0.6} ${top + 4} ${cx + spread} ${top}`;
  return (
    <g fill="none" strokeLinecap="round">
      {[l, r].map((d) => (
        <g key={d}>
          <path d={d} stroke={LAV} strokeWidth="6" strokeDasharray="1 2.2" opacity=".55" />
          <path d={d} stroke={PALE} strokeWidth="1.6" />
        </g>
      ))}
    </g>
  );
}

function MothSpread({ eyes = 'open' }: { eyes?: MothEyes }) {
  return (
    <g>
      {[false, true].map((m) => (
        <g key={String(m)} transform={m ? 'translate(160 0) scale(-1 1)' : undefined}>
          <path d={HIND} fill={NIGHT} stroke={LAV} strokeWidth="1.4" strokeOpacity=".7" />
          <circle cx="54" cy="98" r="6.5" fill={GOLD} opacity=".9" />
          <circle cx="54" cy="98" r="2.6" fill={DEEP} />
          <path d={FORE} fill={NIGHT} stroke={LAV} strokeWidth="1.4" strokeOpacity=".7" />
          <polyline points={WING_STARS.map((p) => p.join(',')).join(' ')} fill="none" stroke={LAV} strokeWidth=".8" opacity=".55" />
          {WING_STARS.map(([sx, sy], i) => (
            <g key={sx}>
              <circle cx={sx} cy={sy} r="4.5" fill={SPEC[(i + (m ? 2 : 0)) % 5]} opacity=".22" />
              <circle cx={sx} cy={sy} r="1.9" fill={SPEC[(i + (m ? 2 : 0)) % 5]} />
            </g>
          ))}
        </g>
      ))}
      <ellipse cx="80" cy="86" rx="6.5" ry="14" fill="#d9d2ee" stroke={OUT} strokeWidth="1.2" />
      {[80, 86, 92].map((yy) => (
        <path key={yy} d={`M74.5 ${yy} Q80 ${yy + 2.4} 85.5 ${yy}`} fill="none" stroke="#b3a9d6" strokeWidth="1" />
      ))}
      <ellipse cx="80" cy="64" rx="9.5" ry="12" fill="#e9e4f5" stroke={OUT} strokeWidth="1.2" />
      <ellipse cx="80" cy="55" rx="12.5" ry="5.5" fill={PALE} />
      <Antennae cx={80} top={14} spread={22} />
      <circle cx="80" cy="44" r="10" fill={PALE} stroke={OUT} strokeWidth="1.2" />
      <Eyes cx={80} cy={45} gap={9} rx={3} ry={4.2} closed={eyes === 'closed'} look={eyes === 'up' ? 1.6 : 0} />
    </g>
  );
}

export type MothEyes = 'open' | 'closed' | 'up';

export function Moth({ pose, w, x, y, eyes = 'open' }: { pose: Pose; eyes?: MothEyes } & Draw) {
  if (pose === 'mark')
    return (
      <svg width={w} height={w} viewBox="0 0 32 32" x={x} y={y} aria-hidden>
        {[false, true].map((m) => (
          <g key={String(m)} transform={m ? 'translate(32 0) scale(-1 1)' : undefined}>
            <path d="M15 17 C10 19 7 24 9 27.5 C12 29.5 15 25 15.5 20Z" fill={NIGHT} stroke={LAV} strokeWidth=".7" />
            <path d="M15.5 13 C11.5 7 5 3.5 2.6 6.6 C1.2 10.6 6 16.6 15.5 17.6Z" fill={NIGHT} stroke={LAV} strokeWidth=".7" />
            <circle cx="8" cy="9.6" r="1.4" fill={m ? '#60a5fa' : GOLD} />
          </g>
        ))}
        <ellipse cx="16" cy="19" rx="2.2" ry="6.5" fill="#e9e4f5" />
        <circle cx="16" cy="11" r="3" fill={PALE} />
        <circle cx="14.9" cy="11.2" r=".9" fill={DEEP} />
        <circle cx="17.1" cy="11.2" r=".9" fill={DEEP} />
      </svg>
    );
  if (pose === 'sit')
    return (
      <svg width={w} height={w} viewBox="0 0 120 120" x={x} y={y} aria-hidden>
        {/* wings folded into a tent behind the body, like a cloak */}
        <path d="M60 34 C44 54 30 84 22 117 L98 117 C90 84 76 54 60 34Z" fill={NIGHT} stroke={LAV} strokeWidth="1.4" strokeOpacity=".7" />
        <polyline points="36,98 44,82 52,90 46,106" fill="none" stroke={LAV} strokeWidth=".8" opacity=".55" />
        {[
          [36, 98],
          [44, 82],
          [52, 90],
          [46, 106],
        ].map(([sx, sy], i) => (
          <circle key={sx * sy} cx={sx} cy={sy} r="1.9" fill={SPEC[i]} />
        ))}
        <circle cx="84" cy="100" r="5" fill={GOLD} opacity=".9" />
        <circle cx="84" cy="100" r="2" fill={DEEP} />
        <g stroke={OUT} strokeWidth="2" strokeLinecap="round">
          <path d="M55 92 L50 117" />
          <path d="M65 92 L70 117" />
        </g>
        <ellipse cx="60" cy="80" rx="10.5" ry="15" fill="#e9e4f5" stroke={OUT} strokeWidth="1.2" />
        <ellipse cx="60" cy="66" rx="13" ry="5.5" fill={PALE} />
        <Antennae cx={60} top={22} spread={20} />
        <circle cx="60" cy="55" r="10" fill={PALE} stroke={OUT} strokeWidth="1.2" />
        <Eyes cx={60} cy={56} gap={9} rx={3} ry={4.2} closed={eyes === 'closed'} look={eyes === 'up' ? 1.6 : 0} />
      </svg>
    );
  return (
    <svg width={w} height={(w * 120) / 160} viewBox="0 0 160 120" x={x} y={y} aria-hidden>
      <MothSpread eyes={eyes} />
    </svg>
  );
}

/* ---------------- 4. Snail: a surveyor carrying its map ---------------- */
function spiral(cx: number, cy: number, turns: number, rMax: number) {
  const end = turns * Math.PI * 2;
  const pts: string[] = [];
  for (let a = 0; a <= end; a += 0.14) {
    const r = (rMax * a) / end;
    pts.push(`${r1(cx + r * Math.cos(a + 2.4))},${r1(cy + r * Math.sin(a + 2.4))}`);
  }
  return pts.join(' ');
}

function SnailBody({ eyesClosed = false }: { eyesClosed?: boolean }) {
  return (
    <g>
      <path d="M40 102 C40 94 52 90 70 90 L128 90 C140 90 146 80 150 68 C153 58 162 56 167 62 C172 70 168 88 160 96 C154 101 146 104 132 104 L46 104 C42 104 40 104 40 102Z" fill="#e6e0f6" stroke={OUT} strokeWidth="1.4" />
      <g stroke="#e6e0f6" strokeWidth="3.4" strokeLinecap="round">
        <path d="M156 64 L150 38" />
        <path d="M164 65 L172 41" />
      </g>
      {[
        [150, 35],
        [172, 38],
      ].map(([ex, ey]) => (
        <g key={ex}>
          <circle cx={ex} cy={ey} r="5.6" fill={PALE} stroke={OUT} strokeWidth="1.1" />
          {eyesClosed ? (
            <path d={`M${ex - 3.4} ${ey} Q${ex} ${ey + 3} ${ex + 3.4} ${ey}`} fill="none" stroke={DEEP} strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <g>
              <circle cx={ex + 1} cy={ey + 0.4} r="2.8" fill={DEEP} />
              <circle cx={ex} cy={ey - 0.8} r="1" fill="#fff" />
            </g>
          )}
        </g>
      ))}
      <path d="M158 80 Q162 83 167 79" fill="none" stroke={DEEP} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="160" cy="74" r="2.4" fill="#f472b6" opacity=".3" />
      {/* shell: a measured spiral on a night globe */}
      <circle cx="100" cy="62" r="30" fill={NIGHT} stroke={OUT} strokeWidth="1.4" />
      <g fill="none" stroke={LAV} strokeOpacity=".22" strokeWidth=".9">
        <ellipse cx="100" cy="62" rx="12" ry="30" />
        <path d="M70 62 H130" />
      </g>
      <polyline points={spiral(100, 62, 2.6, 26)} fill="none" stroke={PALE} strokeWidth="1.7" strokeLinecap="round" />
      <Spark x={100} y={62} s={4.5} c={GOLD} />
      <circle cx="100" cy="62" r="30" fill="none" stroke={LAV} strokeOpacity=".7" strokeWidth="1.3" />
    </g>
  );
}

export function Snail({ pose, w, x, y }: { pose: Pose } & Draw) {
  if (pose === 'mark')
    return (
      <svg width={w} height={w} viewBox="0 0 32 32" x={x} y={y} aria-hidden>
        <path d="M2.5 27.5 H24 C27.5 27.5 29 24.5 28.6 20.6 C28.2 17.8 25 17.4 24 20 L23 23.5 H2.5Z" fill="#e6e0f6" />
        <path d="M26 19 L24.4 10 M28 19.6 L30 11" stroke={PALE} strokeWidth="1.1" strokeLinecap="round" />
        <circle cx="24.4" cy="9.6" r="1.6" fill={PALE} />
        <circle cx="30" cy="10.6" r="1.6" fill={PALE} />
        <circle cx="13.5" cy="16.5" r="9.5" fill={NIGHT} stroke={LAV} strokeWidth=".9" />
        <polyline points={spiral(13.5, 16.5, 2.2, 7.8)} fill="none" stroke={PALE} strokeWidth="1.1" strokeLinecap="round" />
        <Spark x={13.5} y={16.5} s={2} c={GOLD} />
      </svg>
    );
  if (pose === 'sit')
    return (
      <svg width={w} height={(w * 110) / 200} viewBox="0 0 200 110" x={x} y={y} aria-hidden>
        <path d="M0 105 H40" stroke={GOLD} strokeWidth="2" strokeDasharray="5 5" />
        <g transform="translate(0 2)">
          <SnailBody eyesClosed />
        </g>
      </svg>
    );
  return (
    <svg width={w} height={(w * 120) / 200} viewBox="0 0 200 120" x={x} y={y} aria-hidden>
      <path d="M40 103 C24 103 14 106 0 112" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="5 5" />
      <circle cx="18" cy="105.4" r="3.6" fill={dark.skyBottom} stroke={GOLD} strokeWidth="1.6" />
      <SnailBody />
    </svg>
  );
}

/* ---------------- 5. Sky whale: scale and wonder ---------------- */
const WHALE = 'M24 64 C24 42 54 32 88 34 C120 36 140 48 158 56 C166 59 172 56 178 48 L182 50 C178 60 172 68 160 72 C138 80 112 88 84 88 C52 88 24 82 24 64Z';
const FLUKES = 'M178 49 C179 39 187 32 197 29 C193 37 191 43 186 48 C192 50 198 56 200 63 C191 60 184 56 180 52Z';
const BACK_STARS: [number, number][] = [
  [62, 42],
  [82, 39],
  [104, 43],
  [124, 51],
  [112, 60],
];

function WhaleBody({ resting = false }: { resting?: boolean }) {
  return (
    <g>
      <path d={FLUKES} fill={NIGHT} stroke={OUT} strokeWidth="1.4" strokeLinejoin="round" />
      <path d={WHALE} fill="#2d2f62" stroke={OUT} strokeWidth="1.4" />
      <path d="M28 72 C40 84 64 88 88 88 C110 88 132 82 152 74 C130 79 102 81 80 80 C58 79 40 77 28 72Z" fill="#dcd8f0" />
      <g fill="none" stroke="#b9b2d9" strokeWidth=".9">
        <path d="M44 78 C70 84 110 84 138 78" />
        <path d="M54 83 C76 87 104 87 126 82" />
      </g>
      <polyline points={BACK_STARS.slice(0, 4).map((p) => p.join(',')).join(' ') + ` ${BACK_STARS[4].join(',')} ${BACK_STARS[2].join(',')}`} fill="none" stroke={LAV} strokeWidth=".8" opacity=".5" />
      {BACK_STARS.map(([sx, sy], i) => (
        <g key={sx}>
          <circle cx={sx} cy={sy} r="4" fill={SPEC[i]} opacity=".2" />
          <circle cx={sx} cy={sy} r="1.7" fill={i === 1 ? '#fff' : SPEC[i]} />
        </g>
      ))}
      <path d="M72 82 C74 92 68 100 58 105 C60 95 62 87 62 81Z" fill="#2d2f62" stroke={OUT} strokeWidth="1.2" strokeLinejoin="round" />
      {resting ? (
        <path d="M40 62 Q44.5 65.5 49 62" fill="none" stroke={DEEP} strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <g>
          <ellipse cx="44.5" cy="62" rx="2.6" ry="3.2" fill={PALE} />
          <circle cx="44.5" cy="62.4" r="2" fill={DEEP} />
        </g>
      )}
      <path d="M28 70 Q38 75 50 74" fill="none" stroke={DEEP} strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
    </g>
  );
}

export function Whale({ pose, w, x, y }: { pose: Pose } & Draw) {
  if (pose === 'mark')
    return (
      <svg width={w} height={w} viewBox="0 0 32 32" x={x} y={y} aria-hidden>
        <path d="M2 19 C2 12.5 8 10 14.5 10.5 C20.5 11 23.5 14 26 15.4 L28.6 11.6 C30.6 13 31 15.5 30.4 17 C28.6 21.6 22 25.5 13.5 25.5 C6.5 25.5 2 23 2 19Z" fill="#2d2f62" stroke={LAV} strokeWidth=".9" />
        <path d="M3.4 21.4 C7 24.4 15 25 21 23.3 C15 23.6 8 23.3 3.4 21.4Z" fill="#dcd8f0" />
        <circle cx="7.6" cy="18.2" r="1.1" fill={PALE} />
        <Spark x={9.5} y={5.5} s={3.4} c={GOLD} />
        <circle cx="5.6" cy="7.4" r=".9" fill={LAV} />
        <circle cx="13" cy="5" r=".9" fill={LAV} />
      </svg>
    );
  if (pose === 'sit')
    return (
      <svg width={w} height={(w * 100) / 204} viewBox="0 0 204 100" x={x} y={y} aria-hidden>
        <Spark x={56} y={14} s={4} c={GOLD} />
        <Spark x={48} y={4} s={2.6} c={SPEC[1]} />
        <Spark x={64} y={6} s={2.6} c={SPEC[2]} />
        <g transform="translate(0 8)">
          <WhaleBody resting />
        </g>
      </svg>
    );
  return (
    <svg width={w} height={(w * 124) / 204} viewBox="0 -18 204 124" x={x} y={y} aria-hidden>
      <g transform="rotate(-8 100 60)">
        {[
          [52, 18, 4.6, GOLD],
          [62, 6, 3.4, SPEC[0]],
          [44, 4, 3, SPEC[2]],
          [56, -8, 2.6, SPEC[3]],
          [70, -4, 2.2, SPEC[1]],
          [38, -10, 2, LAV],
        ].map(([sx, sy, s, c]) => (
          <Spark key={`${sx}${sy}`} x={sx as number} y={sy as number} s={s as number} c={c as string} />
        ))}
        <WhaleBody />
      </g>
    </svg>
  );
}

/* ---------------- 6. Compass: a small guide whose needle points ---------------- */
function CompassBody({ closed = false }: { closed?: boolean }) {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r0 = i % 9 === 0 ? 20.5 : 22.5;
    return `M${r1(60 + r0 * Math.cos(a))} ${r1(64 + r0 * Math.sin(a))} L${r1(60 + 25 * Math.cos(a))} ${r1(64 + 25 * Math.sin(a))}`;
  });
  return (
    <g>
      {/* rose points */}
      {[0, 90, 180, 270].map((a) => (
        <path key={a} transform={`rotate(${a} 60 64)`} d={a === 0 ? 'M60 14 L66.5 50 L60 56 L53.5 50Z' : 'M60 24 L66 50 L60 56 L54 50Z'} fill={a === 0 ? GOLD : PALE} stroke={OUT} strokeWidth="1.2" strokeLinejoin="round" />
      ))}
      {[45, 135, 225, 315].map((a) => (
        <path key={a} transform={`rotate(${a} 60 64)`} d="M60 32 L64 50 L60 54 L56 50Z" fill={LAV} stroke={OUT} strokeWidth="1" strokeLinejoin="round" />
      ))}
      <circle cx="60" cy="64" r="27" fill={NIGHT} stroke={OUT} strokeWidth="1.4" />
      <path d={ticks.join(' ')} stroke={LAV} strokeWidth="1" opacity=".75" />
      <circle cx="60" cy="64" r="17.5" fill={PALE} stroke={OUT} strokeWidth="1.2" />
      <Eyes cx={60} cy={65} gap={11} rx={2.8} ry={3.8} closed={closed} />
      <circle cx="51" cy="71" r="2.4" fill="#f472b6" opacity=".3" />
      <circle cx="69" cy="71" r="2.4" fill="#f472b6" opacity=".3" />
    </g>
  );
}

export function Compass({ pose, w, x, y }: { pose: Pose } & Draw) {
  if (pose === 'mark')
    return (
      <svg width={w} height={w} viewBox="0 0 32 32" x={x} y={y} aria-hidden>
        {[0, 90, 180, 270].map((a) => (
          <path key={a} transform={`rotate(${a} 16 16)`} d="M16 1 L18.6 10 L16 12 L13.4 10Z" fill={a === 0 ? GOLD : PALE} />
        ))}
        <circle cx="16" cy="16" r="8.6" fill={NIGHT} stroke={LAV} strokeWidth="1" />
        <circle cx="16" cy="16" r="5.6" fill={PALE} />
        <ellipse cx="14.2" cy="16.3" rx="1" ry="1.4" fill={DEEP} />
        <ellipse cx="17.8" cy="16.3" rx="1" ry="1.4" fill={DEEP} />
      </svg>
    );
  if (pose === 'sit')
    return (
      <svg width={w} height={(w * 120) / 120} viewBox="0 0 120 120" x={x} y={y} aria-hidden>
        <ellipse cx="60" cy="117" rx="22" ry="2.6" fill="#000" opacity=".35" />
        <g transform="translate(0 26)">
          <g transform="rotate(-24 60 64)">
            <CompassBody closed />
          </g>
        </g>
      </svg>
    );
  return (
    <svg width={w} height={(w * 140) / 120} viewBox="0 0 120 140" x={x} y={y} aria-hidden>
      <ellipse cx="60" cy="132" rx="18" ry="3" fill="#000" opacity=".28" />
      <g transform="translate(0 10) rotate(22 60 64)">
        <CompassBody />
      </g>
    </svg>
  );
}

/* ---------------- footer vignettes ---------------- */
function VSky({ seed, w = 320, h = 200 }: { seed: number; w?: number; h?: number }) {
  const r = mulberry32(seed);
  const t: Tokens = dark;
  return (
    <>
      <defs>
        <linearGradient id={`vs-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.skyTop} />
          <stop offset="1" stopColor={t.skyBottom} />
        </linearGradient>
      </defs>
      <rect width={w} height={h} fill={`url(#vs-${seed})`} />
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={Math.round(r() * w)} cy={Math.round(r() * h * 0.8)} r={r1(0.5 + r() * 0.8)} fill="#fff" opacity={r1(0.25 + r() * 0.6)} />
      ))}
    </>
  );
}

const HILL = 'M0 160 Q 80 136 160 148 T 320 144 V200 H0Z';

export function FooterVignette({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 320 200" width="100%" height="100%" preserveAspectRatio="xMidYMax slice" style={{ display: "block" }} aria-hidden>
      <VSky seed={id.length * 13 + 7} />
      {id === 'whale' && <Whale pose="hero" w={250} x={40} y={14} />}
      {id === 'compass' && (
        <>
          <path d="M172 72 L262 30" stroke={GOLD} strokeWidth="1" strokeDasharray="3 4" opacity=".8" />
          <Spark x={262} y={30} s={7} c="#fff" />
          <circle cx="262" cy="30" r="10" fill="#fff" opacity=".12" />
        </>
      )}
      <path d={HILL} fill={dark.horizon} />
      {id === 'whale' && <path d="M0 176 Q 120 166 220 172 T 320 168 V200 H0Z" fill="#000" opacity=".6" />}
      {id === 'prism' && (
        <g transform="translate(134 82)">
          <Prism pose="sit" w={52} />
        </g>
      )}
      {id === 'mote' && (
        <>
          <path d="M120 120 C112 120 108 112 116 108 C114 98 128 94 134 101 C138 92 154 94 154 104 C164 102 168 114 160 118 C162 124 150 126 146 122 C140 128 126 126 120 120Z" fill={LAV} opacity=".88" stroke={OUT} strokeWidth="1.2" />
          <Mote pose="hero" w={86} x={96} y={42} />
        </>
      )}
      {id === 'moth' && (
        <>
          <circle cx="226" cy="98" r="40" fill={GOLD} opacity=".12" />
          <path d="M226 146 V112" stroke="#3a3a5c" strokeWidth="3" />
          <rect x="216" y="94" width="20" height="20" rx="4" fill={GOLD} opacity=".9" stroke={OUT} strokeWidth="1.2" />
          <path d="M214 94 H238 L232 86 H220Z" fill="#3a3a5c" />
          <g transform="rotate(-18 150 80)">
            <Moth pose="hero" w={92} x={110} y={42} />
          </g>
        </>
      )}
      {id === 'snail' && (
        <>
          <path d="M0 160 Q 80 136 160 148" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="5 5" />
          <g transform="rotate(5 190 140)">
            <Snail pose="sit" w={92} x={140} y={98} />
          </g>
        </>
      )}
      {id === 'compass' && <Compass pose="hero" w={66} x={126} y={60} />}
    </svg>
  );
}
