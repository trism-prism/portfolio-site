import { toPoints } from '../lib/visibility';
import { LANTERN_IRON, LANTERN_PARTS, LANTERN_TOP, LIGHT_STEP, mix, shapePath, steppedEllipse, type Scene, type Shape } from './geometry';
import { initialLit, initialShadows } from './light';


/** 0 unlit, 1 lit, 2 the half-lit outer ring (halfway between the two). */
function paint(shape: Shape, i: 0 | 1 | 2) {
  const pick = (t: readonly [string, string]) => (i === 2 ? mix(t[0], t[1], 0.5) : t[i]);
  if (shape.strokeTone) {
    return { fill: 'none', stroke: pick(shape.strokeTone), strokeWidth: shape.strokeWidth, strokeLinecap: 'square' as const };
  }
  return { fill: shape.tone ? pick(shape.tone) : 'none', fillRule: shape.evenodd ? ('evenodd' as const) : undefined };
}

/**
 * The scene as one SVG: the unlit night scene, then the same scene in lantern colours, shown only inside the
 * visibility polygon (and inside a stepped ellipse, so the light has a reach). Pure markup (no hooks), shared by the page and the share image.
 */
export function SceneMarkup({ scene, className, width, height }: { scene: Scene; className?: string; width?: number; height?: number }) {
  const id = scene.id;
  const { x, y, rodY } = scene.lantern;
  const drawn = scene.shapes.filter((s) => !s.hidden);
  const lit = drawn.filter((s) => !s.unlitOnly);
  const backPlane = lit.filter((s) => s.plane === 'back');
  const rest = lit.filter((s) => s.plane !== 'back');
  const outer = toPoints(steppedEllipse(scene.reach.outer.rx, scene.reach.outer.ry, LIGHT_STEP));
  const inner = toPoints(steppedEllipse(scene.reach.inner.rx, scene.reach.inner.ry, LIGHT_STEP));
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 ${scene.top} ${scene.w} ${scene.h - scene.top}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
      data-scene={id}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {drawn.map((s) => (
          <path key={s.id} id={`${id}-${s.id}`} d={shapePath(s)} />
        ))}
        <clipPath id={`${id}-poly`}>
          <polygon data-poly points={initialLit[id]} />
        </clipPath>
        <clipPath id={`${id}-shadow`}>
          {initialShadows[id].map((pts, i) => (
            <polygon key={i} data-shadow points={pts} />
          ))}
        </clipPath>
        <clipPath id={`${id}-outer`} data-disc transform={`translate(${x} ${y})`}>
          <polygon points={outer} />
        </clipPath>
        <clipPath id={`${id}-inner`} data-disc transform={`translate(${x} ${y})`}>
          <polygon points={inner} />
        </clipPath>
      </defs>
      <g>
        {drawn.map((s) => (
          <use key={s.id} href={`#${id}-${s.id}`} {...paint(s, 0)} />
        ))}
      </g>
      <g clipPath={`url(#${id}-poly)`}>
        <g clipPath={`url(#${id}-outer)`}>
          {backPlane.map((s) => (
            <use key={s.id} href={`#${id}-${s.id}`} {...paint(s, 2)} />
          ))}
          <g clipPath={`url(#${id}-shadow)`}>
            {backPlane.map((s) => (
              <use key={s.id} href={`#${id}-${s.id}`} {...paint(s, 0)} />
            ))}
          </g>
          {rest.map((s) => (
            <use key={s.id} href={`#${id}-${s.id}`} {...paint(s, 2)} />
          ))}
        </g>
        <g clipPath={`url(#${id}-inner)`}>
          {backPlane.map((s) => (
            <use key={s.id} href={`#${id}-${s.id}`} {...paint(s, 1)} />
          ))}
          <g clipPath={`url(#${id}-shadow)`}>
            {backPlane.map((s) => (
              <use key={s.id} href={`#${id}-${s.id}`} {...paint(s, 0)} />
            ))}
          </g>
          {rest.map((s) => (
            <use key={s.id} href={`#${id}-${s.id}`} {...paint(s, 1)} />
          ))}
        </g>
      </g>
      <g data-trolley transform={`translate(${x} 0)`}>
        <rect x={-8} y={rodY - 4} width={16} height={12} fill={LANTERN_IRON} />
        <rect data-chain x={-2} y={rodY + 8} width={4} height={Math.max(0, y - LANTERN_TOP - rodY - 8)} fill={LANTERN_IRON} />
      </g>
      <g data-lantern transform={`translate(${x} ${y})`}>
        {LANTERN_PARTS.map((q, i) => (
          <rect key={i} x={q.x} y={q.y} width={q.w} height={q.h} fill={q.fill} />
        ))}
      </g>
    </svg>
  );
}
