import { describe, expect, it } from 'vitest';
import { pointInPolygon, type Point } from '../lib/visibility';
import { occluders, scenes, steppedEllipse, type SceneId } from './geometry';
import { litPolygon, pillarShadows } from './light';

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

  it('casts a shadow: a point just behind a pedestal, seen from the lantern, is outside the polygon', () => {
    const light = scene.lantern;
    const poly = litPolygon(scene, light);
    const centre = (sh: (typeof scene.shapes)[number]) => {
      const pts = sh.rings[0];
      return { x: pts.reduce((a, q) => a + q.x, 0) / pts.length, y: pts.reduce((a, q) => a + q.y, 0) / pts.length };
    };
    const near = scene.shapes
      .filter((sh) => sh.occlude && sh.id.startsWith('pedestal'))
      .map((sh) => ({ c: centre(sh) }))
      .sort((a, b) => Math.hypot(a.c.x - light.x, a.c.y - light.y) - Math.hypot(b.c.x - light.x, b.c.y - light.y))[0].c;
    const d = Math.hypot(near.x - light.x, near.y - light.y);
    const behind = { x: near.x + ((near.x - light.x) / d) * 40, y: near.y + ((near.y - light.y) / d) * 40 };
    expect(pointInPolygon(behind, poly)).toBe(false);
  });

  it('projects each pillar onto the wall, away from the lantern', () => {
    expect(scene.casters.length).toBeGreaterThan(1);
    const l = scene.lantern;
    const shadows = pillarShadows(scene, l);
    scene.casters.forEach((c, i) => {
      const cx = c.x + c.w / 2;
      const sx = shadows[i].reduce((a, q) => a + q.x, 0) / shadows[i].length;
      // farther from the lantern than the pillar, on the same side, and wider
      expect(Math.sign(sx - l.x)).toBe(Math.sign(cx - l.x));
      expect(Math.abs(sx - l.x)).toBeGreaterThan(Math.abs(cx - l.x));
      expect(Math.max(...shadows[i].map((q) => q.x)) - Math.min(...shadows[i].map((q) => q.x))).toBeGreaterThan(c.w);
    });
  });
});

describe('steppedEllipse', () => {
  it('uses only multiples of the step and is symmetric', () => {
    const d = steppedEllipse(256, 128, 32);
    for (const p of d) {
      expect(Math.abs(p.x) % 32).toBe(0);
      expect(Math.abs(p.y) % 32).toBe(0);
    }
    expect(Math.min(...d.map((p) => p.x))).toBe(-Math.max(...d.map((p) => p.x)));
  });
});
