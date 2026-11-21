// The moth: a night moth whose wings carry a star chart; folded wings become a cloak when it sits.
// Geometry copied from the approved lab drawing (src/components/lab/Mascots.tsx, concept 3).
// Characters keep fixed illustration colours in both themes, inked with a thin dark outline so they read on twilight.
// Drawn in SVG so every pose is geometry, not a sprite sheet.

export type MothPose = 'idle' | 'wink' | 'crouch' | 'jump' | 'land' | 'wave' | 'sit' | 'sleep' | 'cheer';

const OUT = '#12122a'; // ink outline
const PALE = '#f3f0fb'; // mask / face
const DEEP = '#16152c'; // eyes
const NIGHT = '#272650'; // wings
const GOLD = '#f5c45e';
const LAV = '#cfc9f5';
const SPEC = ['#5eead4', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'];
const r1 = (v: number) => Math.round(v * 10) / 10;

// Seated poses use a 120 x 120 box with the feet at FEET_Y; spread poses use a 160 x 120 box.
const SEAT = 120;
const SPREAD_W = 160;
/** y of the feet's centre line in the seated viewBox (the stroke is 2 wide, so the ink reaches FEET_Y + 1). */
export const MOTH_FEET_Y = 117;

/** Distance in px from the bottom of the rendered seated moth to the bottom edge of its feet, for a given `size`. */
export function mothFeetInset(size: number): number {
  return r1(((SEAT - (MOTH_FEET_Y + 1)) / SEAT) * size);
}

type EyeState = 'open' | 'closed';

function Eyes({ cx, cy, gap, rx = 3, ry = 4.2, left = 'open', right = 'open', look = 0 }: { cx: number; cy: number; gap: number; rx?: number; ry?: number; left?: EyeState; right?: EyeState; look?: number }) {
  return (
    <g>
      {[
        [cx - gap / 2, left],
        [cx + gap / 2, right],
      ].map(([x, state]) =>
        state === 'closed' ? (
          <path key={x as number} d={`M${r1((x as number) - rx - 0.6)} ${cy} Q${x} ${r1(cy + ry * 0.9)} ${r1((x as number) + rx + 0.6)} ${cy}`} fill="none" stroke={DEEP} strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <g key={x as number}>
            <ellipse cx={x as number} cy={r1(cy - look)} rx={rx} ry={ry} fill={DEEP} />
            <circle cx={r1((x as number) - rx * 0.35)} cy={r1(cy - look - ry * 0.4)} r={r1(rx * 0.38)} fill="#fff" />
          </g>
        ),
      )}
    </g>
  );
}

function Spark({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  const k = s * 0.28;
  return <path d={`M${x} ${r1(y - s)} L${r1(x + k)} ${r1(y - k)} L${r1(x + s)} ${y} L${r1(x + k)} ${r1(y + k)} L${x} ${r1(y + s)} L${r1(x - k)} ${r1(y + k)} L${r1(x - s)} ${y} L${r1(x - k)} ${r1(y - k)}Z`} fill={c} />;
}

/** `droop` lowers the antennae tips (sleep). */
function Antennae({ cx, top, spread, droop = 0 }: { cx: number; top: number; spread: number; droop?: number }) {
  const tip = top + droop;
  const mid = r1(top + 4 + droop);
  const bend = r1(top + 10 + droop * 0.4);
  const l = `M${cx - 3} ${top + 22} C${cx - 8} ${bend} ${r1(cx - spread * 0.6)} ${mid} ${cx - spread} ${tip}`;
  const r = `M${cx + 3} ${top + 22} C${cx + 8} ${bend} ${r1(cx + spread * 0.6)} ${mid} ${cx + spread} ${tip}`;
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

/* ---------------- wings spread (hero) ---------------- */
const FORE = 'M74 50 C58 30 34 14 18 20 C9 24 13 48 26 66 C38 74 60 72 74 64Z';
const HIND = 'M74 66 C58 72 40 84 38 100 C38 112 54 114 66 104 C72 96 76 84 76 74Z';
const WING_STARS: [number, number][] = [
  [28, 32],
  [42, 28],
  [52, 44],
  [36, 54],
];

function MothSpread({ up = false }: { up?: boolean }) {
  return (
    <g>
      {[false, true].map((m) => (
        <g key={String(m)} transform={m ? `translate(${SPREAD_W} 0) scale(-1 1)` : undefined}>
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
      <Eyes cx={80} cy={45} gap={9} look={up ? 1.6 : 0} />
    </g>
  );
}

/* ---------------- emerging (the intro): the spread moth with folded wings, curled antennae and unlit wing stars ---------------- */
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
/** Root of a wing at the body, in the 160 x 120 spread box (left wing; the right one is mirrored). */
const WING_ROOT: [number, number] = [75, 58];
/** Wing stars light from the body outward: indices into WING_STARS, nearest the root first. */
const STAR_ORDER = [2, 3, 1, 0];

/** One antenna: `k` 0 is curled tight against the head (small spread, tip drooped), 1 is the normal antenna of the spread pose. */
function AntennaSide({ cx, top, spread, k, side }: { cx: number; top: number; spread: number; k: number; side: -1 | 1 }) {
  const sp = mix(5, spread, k);
  const droop = mix(10, 0, k);
  const tip = top + droop;
  const mid = r1(top + 4 + droop);
  const bend = r1(top + 10 + droop * 0.4);
  const d = `M${cx + side * 3} ${top + 22} C${cx + side * 8} ${bend} ${r1(cx + side * sp * 0.6)} ${mid} ${r1(cx + side * sp)} ${r1(tip)}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={LAV} strokeWidth="6" strokeDasharray="1 2.2" opacity=".55" />
      <path d={d} stroke={PALE} strokeWidth="1.6" />
    </g>
  );
}

/**
 * The spread moth as it comes out of the chrysalis, in the 160 x 120 spread box, as a <g> for use inside an <svg>.
 * `wings` 0 is folded and crumpled (each wing scaled about its root to 15% wide and 80% tall, tilted toward the body),
 * 1 is exactly the spread drawing; the opening runs outward from the body. `antennaeL` and `antennaeR` (0 curled, 1 normal)
 * are drawn separately. `wingStars` is the fraction of the eight wing stars lit, in order from the body outward.
 */
export function MothEmerging({ wings = 1, antennaeL = 1, antennaeR = 1, wingStars = 1 }: { wings?: number; antennaeL?: number; antennaeR?: number; wingStars?: number }) {
  const w = clamp01(wings);
  const lit = clamp01(wingStars) * 8;
  const open = w >= 1 ? undefined : `translate(${WING_ROOT[0]} ${WING_ROOT[1]}) rotate(${r1(mix(-10, 0, w))}) scale(${r1(mix(0.15, 1, w) * 1000) / 1000} ${r1(mix(0.8, 1, w) * 1000) / 1000}) translate(${-WING_ROOT[0]} ${-WING_ROOT[1]})`;
  return (
    <g>
      {[false, true].map((m) => (
        <g key={String(m)} transform={m ? `translate(${SPREAD_W} 0) scale(-1 1)` : undefined}>
          <g transform={open}>
            <path d={HIND} fill={NIGHT} stroke={LAV} strokeWidth="1.4" strokeOpacity=".7" />
            <circle cx="54" cy="98" r="6.5" fill={GOLD} opacity=".9" />
            <circle cx="54" cy="98" r="2.6" fill={DEEP} />
            <path d={FORE} fill={NIGHT} stroke={LAV} strokeWidth="1.4" strokeOpacity=".7" />
            {(() => {
              // star i of this wing has rank STAR_ORDER.indexOf(i) * 2 (+1 on the right wing) among the eight
              const lightOf = (i: number) => clamp01(lit - (STAR_ORDER.indexOf(i) * 2 + (m ? 1 : 0)));
              return (
                <>
                  {WING_STARS.slice(1).map(([x2, y2], i) => {
                    const [x1, y1] = WING_STARS[i];
                    const o = Math.min(lightOf(i), lightOf(i + 1)) * 0.55;
                    return o > 0 ? <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={LAV} strokeWidth=".8" opacity={r1(o * 100) / 100} /> : null;
                  })}
                  {WING_STARS.map(([sx, sy], i) => {
                    const a = lightOf(i);
                    return a > 0 ? (
                      <g key={sx}>
                        <circle cx={sx} cy={sy} r="4.5" fill={SPEC[(i + (m ? 2 : 0)) % 5]} opacity={r1(a * 22) / 100} />
                        <circle cx={sx} cy={sy} r="1.9" fill={SPEC[(i + (m ? 2 : 0)) % 5]} opacity={r1(a * 100) / 100} />
                      </g>
                    ) : null;
                  })}
                </>
              );
            })()}
          </g>
        </g>
      ))}
      <ellipse cx="80" cy="86" rx="6.5" ry="14" fill="#d9d2ee" stroke={OUT} strokeWidth="1.2" />
      {[80, 86, 92].map((yy) => (
        <path key={yy} d={`M74.5 ${yy} Q80 ${yy + 2.4} 85.5 ${yy}`} fill="none" stroke="#b3a9d6" strokeWidth="1" />
      ))}
      <ellipse cx="80" cy="64" rx="9.5" ry="12" fill="#e9e4f5" stroke={OUT} strokeWidth="1.2" />
      <ellipse cx="80" cy="55" rx="12.5" ry="5.5" fill={PALE} />
      <AntennaSide cx={80} top={14} spread={22} k={clamp01(antennaeL)} side={-1} />
      <AntennaSide cx={80} top={14} spread={22} k={clamp01(antennaeR)} side={1} />
      <circle cx="80" cy="44" r="10" fill={PALE} stroke={OUT} strokeWidth="1.2" />
      <Eyes cx={80} cy={45} gap={9} />
    </g>
  );
}

/* ---------------- seated: wings folded into a cloak ---------------- */
const SIT_STARS: [number, number][] = [
  [36, 98],
  [44, 82],
  [52, 90],
  [46, 106],
];

function MothSeated({ left = 'open', right = 'open', droop = 0 }: { left?: EyeState; right?: EyeState; droop?: number }) {
  return (
    <g>
      {/* wings folded into a tent behind the body, like a cloak */}
      <path d="M60 34 C44 54 30 84 22 117 L98 117 C90 84 76 54 60 34Z" fill={NIGHT} stroke={LAV} strokeWidth="1.4" strokeOpacity=".7" />
      <polyline points={SIT_STARS.map((p) => p.join(',')).join(' ')} fill="none" stroke={LAV} strokeWidth=".8" opacity=".55" />
      {SIT_STARS.map(([sx, sy], i) => (
        <circle key={sx * sy} cx={sx} cy={sy} r="1.9" fill={SPEC[i]} />
      ))}
      <circle cx="84" cy="100" r="5" fill={GOLD} opacity=".9" />
      <circle cx="84" cy="100" r="2" fill={DEEP} />
      <g stroke={OUT} strokeWidth="2" strokeLinecap="round">
        <path d={`M55 92 L50 ${MOTH_FEET_Y}`} />
        <path d={`M65 92 L70 ${MOTH_FEET_Y}`} />
      </g>
      <ellipse cx="60" cy="80" rx="10.5" ry="15" fill="#e9e4f5" stroke={OUT} strokeWidth="1.2" />
      <ellipse cx="60" cy="66" rx="13" ry="5.5" fill={PALE} />
      <Antennae cx={60} top={22} spread={20} droop={droop} />
      <circle cx="60" cy="55" r="10" fill={PALE} stroke={OUT} strokeWidth="1.2" />
      <Eyes cx={60} cy={56} gap={9} left={left} right={right} />
    </g>
  );
}

/** The logo / favicon pose. viewBox 0 0 32 32. With `animated` the eyes blink and one closes on hover (see `.mark` in globals.css). */
export function MothMark({ size = 40, animated = false, title }: { size?: number; animated?: boolean; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={animated ? 'mark' : undefined}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {[false, true].map((m) => (
        <g key={String(m)} transform={m ? 'translate(32 0) scale(-1 1)' : undefined}>
          <path d="M15 17 C10 19 7 24 9 27.5 C12 29.5 15 25 15.5 20Z" fill={NIGHT} stroke={LAV} strokeWidth=".7" />
          <path d="M15.5 13 C11.5 7 5 3.5 2.6 6.6 C1.2 10.6 6 16.6 15.5 17.6Z" fill={NIGHT} stroke={LAV} strokeWidth=".7" />
          <circle cx="8" cy="9.6" r="1.4" fill={m ? '#60a5fa' : GOLD} />
        </g>
      ))}
      <ellipse cx="16" cy="19" rx="2.2" ry="6.5" fill="#e9e4f5" />
      <circle cx="16" cy="11" r="3" fill={PALE} />
      <g className={animated ? 'mark-eyes' : undefined}>
        <circle cx="14.9" cy="11.2" r=".9" fill={DEEP} />
        <circle className="eye-r" cx="17.1" cy="11.2" r=".9" fill={DEEP} />
      </g>
      {animated && <path className="wink" d="M16.2 11.4 Q17.1 10.5 18 11.4" stroke={DEEP} strokeWidth=".7" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

/**
 * Full character for the roaming mascot and the 404 page. `size` is the width of the seated drawing (120 units);
 * spread poses use the same scale, so the body never changes size between poses, and are 4/3 as wide.
 * Seated and spread drawings are both `size` tall with the feet row at the same height, so callers can pin the
 * bottom edge on a rule (see `mothFeetInset`).
 */
export function MothCharacter({ pose = 'idle', size = 46, flip = false }: { pose?: MothPose; size?: number; flip?: boolean }) {
  const spread = pose === 'jump' || pose === 'wave' || pose === 'cheer';
  const squash =
    pose === 'crouch' ? `translate(60 ${MOTH_FEET_Y}) scale(1.08 .9) translate(-60 -${MOTH_FEET_Y})` :
    pose === 'land' ? `translate(60 ${MOTH_FEET_Y}) scale(1.12 .86) translate(-60 -${MOTH_FEET_Y})` : undefined;
  const style = flip ? { transform: 'scaleX(-1)' } : undefined;

  if (spread) {
    const stretch = pose === 'jump' ? `translate(80 ${MOTH_FEET_Y}) scale(.94 1.06) translate(-80 -${MOTH_FEET_Y})` : undefined;
    return (
      <svg width={r1((size * SPREAD_W) / SEAT)} height={size} viewBox={`0 0 ${SPREAD_W} ${SEAT}`} aria-hidden="true" style={style}>
        <g transform={stretch}>
          <MothSpread up={pose === 'cheer'} />
          {pose === 'cheer' && (
            <g>
              <Spark x={44} y={9} s={3} c={SPEC[0]} />
              <Spark x={80} y={6} s={3.6} c={SPEC[3]} />
              <Spark x={116} y={9} s={3} c={SPEC[4]} />
            </g>
          )}
        </g>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${SEAT} ${SEAT}`} aria-hidden="true" style={style}>
      <g transform={squash}>
        {pose === 'sleep' ? (
          <MothSeated left="closed" right="closed" droop={4} />
        ) : pose === 'wink' ? (
          <MothSeated right="closed" />
        ) : (
          <MothSeated />
        )}
      </g>
    </svg>
  );
}
