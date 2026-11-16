import { toPoints } from '../lib/visibility';
import { COLORS, LANTERN_PARTS, LIGHT_BANDS, shapePath, steppedDisc, type Scene, type Shape } from './geometry';
import { litPolygon } from './light';

const attr = (s: Shape) =>
  `fill="${s.fill ?? 'none'}"` +
  (s.evenodd ? ' fill-rule="evenodd"' : '') +
  (s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.strokeWidth ?? 1}" stroke-linecap="square"` : '');

const path = (s: Shape) => `<path d="${shapePath(s)}" ${attr(s)}/>`;

/** The scene as a standalone SVG string at its default lantern position (used for the share image). */
export function sceneSvg(scene: Scene, width: number, height: number): string {
  const { x, y, railY } = scene.lantern;
  const lit = toPoints(litPolygon(scene, { x, y }));
  const clips = LIGHT_BANDS.map(
    (b, i) =>
      `<clipPath id="b${i}"><polygon transform="translate(${x} ${y})" points="${toPoints(steppedDisc(b.r))}"/></clipPath>`,
  ).join('');
  const bands = LIGHT_BANDS.map(
    (b, i) => `<g clip-path="url(#b${i})"><polygon points="${lit}" fill="${b.fill}" fill-opacity="${b.opacity}"/></g>`,
  ).join('');
  const lantern = LANTERN_PARTS.map((q) => `<rect x="${q.x}" y="${q.y}" width="${q.w}" height="${q.h}" fill="${q.fill}"/>`).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${scene.w} ${scene.h}" preserveAspectRatio="xMidYMid slice">` +
    `<defs>${clips}</defs>` +
    scene.back.map(path).join('') +
    bands +
    scene.front.map(path).join('') +
    `<rect x="${x - 2}" y="${railY + 8}" width="4" height="${y - railY - 40}" fill="${COLORS.plum}"/>` +
    `<rect x="${x - 8}" y="${railY - 4}" width="16" height="16" fill="${COLORS.plum}"/>` +
    `<g transform="translate(${x} ${y})">${lantern}</g></svg>`
  );
}
