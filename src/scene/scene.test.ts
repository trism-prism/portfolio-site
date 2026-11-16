import { describe, expect, it } from 'vitest';
import { pointInPolygon, type Point } from '../lib/visibility';
import { occluders, scenes, steppedDisc, type SceneId } from './geometry';
import { litPolygon } from './light';

function area(poly: Point[]) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

describe.each(Object.keys(scenes) as SceneId[])('%s scene', (id) => {
  const scene = scenes[id];
  const { minX, maxX, minY, maxY } = scene.lantern;

  it('has a lit polygon of real size everywhere the lantern can go', () => {
    for (let x = minX; x <= maxX; x += 24) {
      for (let y = minY; y <= maxY; y += 16) {
        const poly = litPolygon(scene, { x, y });
        expect(area(poly)).toBeGreaterThan(5000);
        expect(poly.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(true);
      }
    }
  });

  it('keeps a positive area with the light on an occluder vertex or edge', () => {
    const [first] = occluders(scene, { x: -999, y: -999 });
    const spots: Point[] = [first.a, { x: (first.a.x + first.b.x) / 2, y: (first.a.y + first.b.y) / 2 }];
    for (const light of spots) {
      expect(area(litPolygon(scene, light))).toBeGreaterThan(1000);
    }
  });

  it('casts a shadow: a point just behind a pedestal is outside the polygon', () => {
    const light = scene.lantern;
    const poly = litPolygon(scene, light);
    const dist = (s: (typeof scene.shapes)[number]) => Math.hypot(s.rings[0][0].x - light.x, s.rings[0][0].y - light.y);
    const pedestal = scene.shapes.filter((s) => s.occlude && s.id.startsWith('pedestal')).sort((a, b) => dist(a) - dist(b))[0];
    expect(pedestal).toBeDefined();
    const pts = pedestal!.rings[0];
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
    const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
    expect(pointInPolygon({ x: cx, y: cy }, poly)).toBe(false);
  });
});

describe('steppedDisc', () => {
  it('uses only multiples of the step and is symmetric', () => {
    const d = steppedDisc(128, 32);
    for (const p of d) {
      expect(Math.abs(p.x) % 32).toBe(0);
      expect(Math.abs(p.y) % 32).toBe(0);
    }
    expect(Math.min(...d.map((p) => p.x))).toBe(-Math.max(...d.map((p) => p.x)));
  });
});
