import { toPoints, visibilityPolygon, type Point } from '../lib/visibility';
import { occluders, sceneBounds, scenes, type Scene, type SceneId } from './geometry';

/** The lit polygon for a lantern at `light`, limited to the lantern's reach so far walls are not scanned. */
export function litPolygon(scene: Scene, light: Point): Point[] {
  const full = sceneBounds(scene);
  // The bounding rectangle lies outside the stepped ellipse, so its edges are never visible.
  const rx = scene.reach.outer.rx + 16;
  const ry = scene.reach.outer.ry + 16;
  const x = Math.max(full.x, light.x - rx);
  const y = Math.max(full.y, light.y - ry);
  const x2 = Math.min(full.x + full.w, light.x + rx);
  const y2 = Math.min(full.y + full.h, light.y + ry);
  return visibilityPolygon(light, { x, y, w: x2 - x, h: y2 - y }, occluders(scene, light));
}

/** Each pillar's shadow on the wall: its footprint scaled about the lantern by 1/depth. */
export function pillarShadows(scene: Scene, light: Point): Point[][] {
  const t = scene.shadowDepth;
  return scene.casters.map((r) =>
    [
      { x: r.x, y: r.y },
      { x: r.x + r.w, y: r.y },
      { x: r.x + r.w, y: r.y + r.h },
      { x: r.x, y: r.y + r.h },
    ].map((q) => ({ x: light.x + (q.x - light.x) / t, y: light.y + (q.y - light.y) / t })),
  );
}

/** Computed at build time for the default lantern position, so the HTML is complete without JavaScript. */
export const initialShadows = Object.fromEntries(
  (Object.keys(scenes) as SceneId[]).map((id) => [id, pillarShadows(scenes[id], scenes[id].lantern).map(toPoints)]),
) as Record<SceneId, string[]>;

export const initialLit = Object.fromEntries(
  (Object.keys(scenes) as SceneId[]).map((id) => [id, toPoints(litPolygon(scenes[id], scenes[id].lantern))]),
) as Record<SceneId, string>;
