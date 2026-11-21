// The Moth constellation: wings spread, drawn in a 400 × 260 box. The stars carry no project meaning;
// the head is the brightest and five soft spectrum stars sit on the wing tips and tail. Colours are
// theme tokens, so it follows dark and twilight. The figure is ported from the lab reference
// (src/components/lab/MothSky.tsx, variant A) and must not import from it.
//
// The draw-in is pure CSS (see .moth-draw in globals.css): the markup is always the finished frame, so
// server output, Reduced motion and `draw={false}` all show the complete figure.

type P = [number, number];
type Star = { id: string; p: P };

const SPREAD: Star[] = [
  { id: 'head', p: [200, 66] },
  { id: 'antL', p: [176, 34] },
  { id: 'antR', p: [224, 34] },
  { id: 'thorax', p: [200, 100] },
  { id: 'mid', p: [200, 146] },
  { id: 'tail', p: [200, 196] },
  { id: 'foreL', p: [70, 52] },
  { id: 'foreLlow', p: [112, 134] },
  { id: 'foreR', p: [330, 52] },
  { id: 'foreRlow', p: [288, 134] },
  { id: 'hindL', p: [128, 214] },
  { id: 'hindR', p: [272, 214] },
];

const LINES: [string, string][] = [
  ['antL', 'head'],
  ['antR', 'head'],
  ['head', 'thorax'],
  ['thorax', 'mid'],
  ['mid', 'tail'],
  ['thorax', 'foreL'],
  ['foreL', 'foreLlow'],
  ['foreLlow', 'thorax'],
  ['thorax', 'foreR'],
  ['foreR', 'foreRlow'],
  ['foreRlow', 'thorax'],
  ['foreLlow', 'hindL'],
  ['hindL', 'mid'],
  ['foreRlow', 'hindR'],
  ['hindR', 'mid'],
];

// Spectrum token order: software, systems, ai, rose, route.
const SPECTRUM = ['--kind-software', '--kind-systems', '--kind-ai', '--rose', '--route'] as const;
const SOFT: Record<string, number> = { foreL: 2, foreR: 0, hindL: 3, hindR: 1, tail: 4 };

/** Position of the head star in the 400 × 260 viewBox, for the intro to aim at. */
export const MOTH_HEAD: P = [200, 66];
/** Position of the tail star (the gold one) in the viewBox: where the hero route ends. */
export const MOTH_TAIL: P = [200, 196];
export const MOTH_VIEW = { w: 400, h: 260 } as const;

const r2 = (n: number) => Math.round(n * 100) / 100;
const at = (id: string) => SPREAD.find((s) => s.id === id)!.p;

/** The 15 constellation lines as point pairs in viewBox units, for geometry checks. */
export const MOTH_LINES: [P, P][] = LINES.map(([a, b]) => [at(a), at(b)]);

// Draw order: breadth-first from the head, so the lines grow outward through the figure.
const dist: Record<string, number> = { head: 0 };
for (let changed = true; changed; ) {
  changed = false;
  for (const [a, b] of LINES) {
    for (const [from, to] of [[a, b], [b, a]] as const) {
      if (dist[from] !== undefined && (dist[to] === undefined || dist[to] > dist[from] + 1)) {
        dist[to] = dist[from] + 1;
        changed = true;
      }
    }
  }
}

const LINE_DUR = 0.42;
const LEVEL_GAP = 0.4;
const WITHIN = 0.04;
const START = 0.4; // seconds before the first line, so the hero text has begun to arrive

const seen: Record<number, number> = {};
const DRAWN = LINES.map(([a, b]) => {
  // each line starts at its end nearer the head and grows away from it
  const [from, to] = dist[a] <= dist[b] ? [a, b] : [b, a];
  const level = Math.max(dist[a], dist[b]);
  const k = (seen[level] = (seen[level] ?? -1) + 1);
  const delay = r2(START + (level - 1) * LEVEL_GAP + k * WITHIN);
  return { key: a + b, from: at(from), to: at(to), ends: [a, b], delay };
});

/** Total time the draw takes, from mount, in seconds. */
export const MOTH_DRAW_SECONDS = r2(Math.max(...DRAWN.map((l) => l.delay)) + LINE_DUR);

function starDelay(id: string) {
  if (id === 'head') return START;
  const reach = DRAWN.filter((l) => l.ends.includes(id)).map((l) => l.delay + LINE_DUR * 0.85);
  return r2(Math.min(...reach));
}

export function MothConstellation({ size = 400, named = false, draw = false, className }: { size?: number; named?: boolean; draw?: boolean; className?: string }) {
  const d = (s: number) => ({ ['--d' as string]: `${s}s` }) as React.CSSProperties;
  return (
    <svg
      viewBox={`0 0 ${MOTH_VIEW.w} ${MOTH_VIEW.h}`}
      width={size}
      height={r2((size * MOTH_VIEW.h) / MOTH_VIEW.w)}
      className={`${draw ? 'moth-draw ' : ''}${className ?? ''}`.trim() || undefined}
      aria-hidden="true"
      focusable="false"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {DRAWN.map((l) => (
        <line
          key={l.key}
          className="moth-line"
          x1={l.from[0]}
          y1={l.from[1]}
          x2={l.to[0]}
          y2={l.to[1]}
          pathLength={1}
          style={{ stroke: 'var(--constellation)', strokeWidth: 1, ...d(l.delay) }}
        />
      ))}
      {SPREAD.map((s) => {
        const [x, y] = s.p;
        const delay = d(starDelay(s.id));
        if (s.id === 'head')
          return (
            <g key={s.id} className="moth-star" style={delay}>
              <circle cx={x} cy={y} r={13} opacity={0.16} style={{ fill: 'var(--star)' }} />
              <circle cx={x} cy={y} r={4.6} strokeWidth={1.5} style={{ fill: 'var(--star)', stroke: 'var(--star-halo)' }} />
            </g>
          );
        const k = SOFT[s.id];
        if (k !== undefined)
          return (
            <g key={s.id} className="moth-star" style={delay}>
              <circle cx={x} cy={y} r={9} opacity={0.18} style={{ fill: `var(${SPECTRUM[k]})` }} />
              <circle cx={x} cy={y} r={3.4} opacity={0.85} style={{ fill: `var(${SPECTRUM[k]})` }} />
            </g>
          );
        return <circle key={s.id} className="moth-star" cx={x} cy={y} r={2} opacity={0.75} style={{ fill: 'var(--star)', stroke: 'var(--star-halo)', ...delay }} />;
      })}
      {named && (
        <text className="moth-name" x={200} y={250} textAnchor="middle" fontSize={20} fontStyle="italic" style={{ fontFamily: 'var(--font-serif)', fill: 'var(--accent-serif)', ...d(MOTH_DRAW_SECONDS - 0.3) }}>
          the Moth
        </text>
      )}
    </svg>
  );
}
