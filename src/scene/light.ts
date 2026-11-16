import { toPoints, visibilityPolygon, type Point } from '../lib/visibility';
import { LIGHT_BANDS, occluders, sceneBounds, scenes, type Scene, type SceneId } from './geometry';

const REACH = LIGHT_BANDS[0].r;

/** The lit polygon for a lantern at `light`, limited to the lantern's reach. */
export function litPolygon(scene: Scene, light: Point): Point[] {
  const full = sceneBounds(scene);
  const x = Math.max(full.x, light.x - REACH);
  const y = Math.max(full.y, light.y - REACH);
  const x2 = Math.min(full.x + full.w, light.x + REACH);
  const y2 = Math.min(full.y + full.h, light.y + REACH);
  return visibilityPolygon(light, { x, y, w: x2 - x, h: y2 - y }, occluders(scene, light));
}

/** Computed at build time for the default lantern position, so the HTML is complete without JavaScript. */
export const initialLit = Object.fromEntries(
  (Object.keys(scenes) as SceneId[]).map((id) => [id, toPoints(litPolygon(scenes[id], scenes[id].lantern))]),
) as Record<SceneId, string>;
