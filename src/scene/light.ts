import { toPoints, visibilityPolygon, type Point } from '../lib/visibility';
import { occluders, sceneBounds, scenes, type Scene, type SceneId } from './geometry';

/** The lit polygon for a lantern at `light`, limited to the lantern's reach so far walls are not scanned. */
export function litPolygon(scene: Scene, light: Point): Point[] {
  const full = sceneBounds(scene);
  const reach = scene.reach.outer;
  const x = Math.max(full.x, light.x - reach);
  const y = Math.max(full.y, light.y - reach);
  const x2 = Math.min(full.x + full.w, light.x + reach);
  const y2 = Math.min(full.y + full.h, light.y + reach);
  return visibilityPolygon(light, { x, y, w: x2 - x, h: y2 - y }, occluders(scene, light));
}

/** Computed at build time for the default lantern position, so the HTML is complete without JavaScript. */
export const initialLit = Object.fromEntries(
  (Object.keys(scenes) as SceneId[]).map((id) => [id, toPoints(litPolygon(scenes[id], scenes[id].lantern))]),
) as Record<SceneId, string>;
