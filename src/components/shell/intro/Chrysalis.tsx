// The chrysalis, its glow, seam, falling halves, shards and the spectrum rays, drawn in the intro's 420 x 236 stage space.
// Geometry is copied from the storyboard lab (CHRYS, the facets, Rays); everything animated is read from introState.
import type { IntroState } from './timeline';

type P = [number, number];
export const CHRYS: P[] = [
  [210, 66],
  [230, 90],
  [236, 124],
  [224, 158],
  [210, 170],
  [196, 158],
  [184, 124],
  [190, 90],
];
const C: P = [210, 122];
const SPECTRUM = ['var(--kind-software)', 'var(--kind-systems)', 'var(--kind-ai)', 'var(--rose)', 'var(--route)'];
const LAV = 'var(--accent-serif)';
const r1 = (v: number) => Math.round(v * 10) / 10;
const r2 = (v: number) => Math.round(v * 100) / 100;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

const FACETS = CHRYS.map((p, k) => {
  const q = CHRYS[(k + 1) % CHRYS.length];
  return { d: `M${C[0]} ${C[1]} L${p[0]} ${p[1]} L${q[0]} ${q[1]}Z`, col: SPECTRUM[k % 5], left: p[0] < 210 || q[0] < 210, mid: [r1((C[0] + p[0] + q[0]) / 3), r1((C[1] + p[1] + q[1]) / 3)] as P };
});

// Shards: a small triangle at the middle of each facet, plus a second one for every other facet, each with its own drift.
const SHARDS = Array.from({ length: 12 }, (_, i) => {
  const f = FACETS[i < 8 ? i : (i - 8) * 2];
  const a = Math.atan2(f.mid[1] - C[1], f.mid[0] - C[0]) + (i < 8 ? 0 : 0.5);
  const reach = 26 + (i % 4) * 9;
  return { col: f.col, x: f.mid[0], y: f.mid[1], dx: r1(Math.cos(a) * reach), dy: r1(Math.sin(a) * reach + 18), rot: (i % 2 ? 1 : -1) * (40 + i * 9), size: 4.5 + (i % 3) * 1.6 };
});

export function Rays({ k, opacity }: { k: number; opacity: number }) {
  return (
    <g strokeLinecap="round" opacity={r2(opacity)}>
      {SPECTRUM.map((c, i) => {
        const a = ((-150 + i * 30) * Math.PI) / 180;
        const L = 150 * k;
        return <line key={c} x1={C[0]} y1={C[1]} x2={r1(C[0] + Math.cos(a) * L)} y2={r1(C[1] + Math.sin(a) * L)} stroke={c} strokeWidth="2" opacity=".75" />;
      })}
    </g>
  );
}

export function Chrysalis({ s }: { s: IntroState }) {
  const open = s.halves;
  const outlineOn = 1 - clamp01(open / 1.2); // the outline and its points give way as the halves part
  const u = Math.min(s.drawn, 8); // line head along the closed outline, in vertices
  const whole = Math.floor(u);
  const V: P[] = [...CHRYS, CHRYS[0]];
  const closed: P[] = V.slice(0, whole + 1);
  if (whole < 8) {
    const [a, b, f] = [V[whole], V[whole + 1], u - whole];
    closed.push([r1(a[0] + (b[0] - a[0]) * f), r1(a[1] + (b[1] - a[1]) * f)]);
  }
  const pts = closed.map((p) => p.join(',')).join(' ');
  const solid = s.solid;
  const facetOpacity = (0.62 + 0.3 * solid) * s.facets * (1 - clamp01(s.fall * 1.25));
  const sc = (k: number, cx: number, cy: number) => `translate(${cx} ${cy}) scale(${r2(k)}) translate(${-cx} ${-cy})`;

  return (
    <g>
      {/* the thread and its anchor */}
      <line x1="210" y1="26" x2="210" y2="66" pathLength={1} strokeDasharray="1" strokeDashoffset={r2(1 - s.thread)} style={{ stroke: 'var(--constellation)' }} />
      <circle cx="210" cy="26" r={r2(2.6 + 0.4 * s.thread)} fill="#fff" opacity={r2(s.anchor)} />

      {s.glow > 0.001 && <circle cx={C[0]} cy={C[1]} r="70" fill={LAV} opacity={r2(s.glow)} transform={sc(s.glowScale, C[0], C[1])} />}
      {s.bloom > 0.001 && <circle cx={C[0]} cy={C[1] - 2} r="80" fill={LAV} opacity={r2(0.06 * s.bloom)} />}

      <g transform={s.pulse > 1.0001 ? sc(s.pulse, C[0], C[1]) : undefined}>
        {s.facets > 0.001 && s.fall < 1 && (
          <g opacity={r2(facetOpacity)}>
            {FACETS.map((f, k) => {
              const dir = f.left ? -1 : 1;
              const move = open > 0.001 ? `translate(${r1(dir * open)} ${r1(open * 0.3 + 34 * s.fall * s.fall)}) rotate(${r1(dir * open)} 210 170)` : undefined;
              return <path key={k} d={f.d} style={{ fill: f.col }} stroke="#fff" strokeOpacity=".5" strokeWidth=".8" transform={move} />;
            })}
          </g>
        )}
        {outlineOn > 0.001 && (
          <g opacity={r2(outlineOn)}>
            {s.drawn > 0 && <polyline points={pts} fill="none" style={{ stroke: 'var(--constellation)' }} opacity={r2(1 - s.facets)} />}
            {s.drawn > 0 && s.facets > 0 && <polyline points={pts} fill="none" stroke="#fff" strokeOpacity={r2(0.7 * s.facets)} strokeWidth={r2(1 + 0.2 * s.facets)} />}
            {CHRYS.map(([x, y], k) => {
              const a = clamp01(s.drawn - k);
              // the point that is about to appear shows a faint 6px glow first, which gives way as the point lights
              const glow = 0.25 * (s.drawn < k ? clamp01(s.drawn - (k - 1)) : 1 - a);
              return (
                <g key={k}>
                  {glow > 0.005 && <circle cx={x} cy={y} r="6" fill="#fff" opacity={r2(glow)} />}
                  {a > 0 && <circle cx={x} cy={y} r={r2(2.8 - 0.4 * s.facets)} fill="#fff" opacity={r2(a)} />}
                </g>
              );
            })}
          </g>
        )}
      </g>

      {/* the seam of light */}
      {s.seam > 0.001 && (
        <g opacity={r2(s.seam)}>
          <line x1="210" y1="70" x2="210" y2="166" stroke={LAV} strokeWidth={r2(7 * s.seam)} opacity=".25" />
          <line x1="210" y1="70" x2="210" y2="166" stroke="#fff" strokeWidth={r2(2.2 * s.seam)} />
        </g>
      )}

      {/* broken facets drifting away */}
      {s.shards > 0.001 && s.shards < 0.999 && (
        <g opacity={r2(0.85 * Math.sin(Math.PI * s.shards))}>
          {SHARDS.map((h, i) => {
            const z = s.shards;
            const t = `translate(${r1(h.x + h.dx * z)} ${r1(h.y + h.dy * z)}) rotate(${r1(h.rot * z)}) scale(${r2(1 - 0.4 * z)})`;
            return <path key={i} d={`M0 ${-h.size} L${h.size * 0.8} ${h.size * 0.7} L${-h.size * 0.8} ${h.size * 0.7}Z`} style={{ fill: h.col }} stroke="#fff" strokeOpacity=".5" strokeWidth=".6" transform={t} />;
          })}
        </g>
      )}

      {s.rays > 0.001 && <Rays k={0.2 + 0.4 * s.rays} opacity={s.rays} />}
    </g>
  );
}
