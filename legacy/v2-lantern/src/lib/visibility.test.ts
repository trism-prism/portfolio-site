import { describe, expect, it } from 'vitest';
import { clipSegment, distanceToSegment, pointInPolygon, toPoints, visibilityPolygon, type Point, type Rect, type Segment } from './visibility';

const room: Rect = { x: 0, y: 0, w: 100, h: 60 };

function area(poly: Point[]) {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

const seg = (ax: number, ay: number, bx: number, by: number): Segment => ({
  a: { x: ax, y: ay },
  b: { x: bx, y: by },
});

describe('visibilityPolygon', () => {
  it('returns the whole rectangle in an open room', () => {
    const poly = visibilityPolygon({ x: 30, y: 20 }, room, []);
    expect(area(poly)).toBeCloseTo(6000, 0);
    for (const p of [
      { x: 1, y: 1 },
      { x: 99, y: 1 },
      { x: 99, y: 59 },
      { x: 1, y: 59 },
    ]) {
      expect(pointInPolygon(p, poly)).toBe(true);
    }
  });

  it('puts a point behind a wall outside the polygon', () => {
    const wall = seg(50, 20, 50, 40);
    const poly = visibilityPolygon({ x: 20, y: 30 }, room, [wall]);
    expect(pointInPolygon({ x: 80, y: 30 }, poly)).toBe(false); // directly behind
    expect(pointInPolygon({ x: 40, y: 30 }, poly)).toBe(true); // in front
    expect(pointInPolygon({ x: 80, y: 5 }, poly)).toBe(true); // around the top end
    expect(area(poly)).toBeLessThan(6000);
  });

  it('keeps a light inside a closed box inside it', () => {
    const box = [seg(40, 20, 60, 20), seg(60, 20, 60, 40), seg(60, 40, 40, 40), seg(40, 40, 40, 20)];
    const poly = visibilityPolygon({ x: 50, y: 30 }, room, box);
    expect(area(poly)).toBeCloseTo(400, 0);
    for (const p of poly) {
      expect(p.x).toBeGreaterThanOrEqual(39.99);
      expect(p.x).toBeLessThanOrEqual(60.01);
      expect(p.y).toBeGreaterThanOrEqual(19.99);
      expect(p.y).toBeLessThanOrEqual(40.01);
    }
    expect(pointInPolygon({ x: 80, y: 30 }, poly)).toBe(false);
  });

  it('gives no NaN when the light is collinear with a wall', () => {
    const walls = [seg(50, 30, 70, 30), seg(10, 30, 20, 30), seg(30, 10, 30, 20)];
    const poly = visibilityPolygon({ x: 30, y: 30 }, room, walls);
    expect(poly.length).toBeGreaterThan(4);
    for (const p of poly) {
      expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });

  it('keeps a positive area when the light sits on a wall endpoint or on a wall', () => {
    const walls = [seg(50, 10, 50, 50), seg(50, 30, 80, 30), seg(10, 10, 40, 40)];
    for (const light of [{ x: 50, y: 10 }, { x: 50, y: 30 }, { x: 50, y: 25 }, { x: 25, y: 25 }]) {
      const poly = visibilityPolygon(light, room, walls);
      expect(area(poly)).toBeGreaterThan(100);
      for (const p of poly) expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
  });

  it('still sees round a box when the light is on its corner', () => {
    const box = [seg(40, 20, 60, 20), seg(60, 20, 60, 40), seg(60, 40, 40, 40), seg(40, 40, 40, 20)];
    const poly = visibilityPolygon({ x: 40, y: 20 }, room, box);
    expect(area(poly)).toBeGreaterThan(1000);
  });

  it('returns nothing for a light outside the bounds', () => {
    expect(visibilityPolygon({ x: 500, y: 5 }, room, [])).toEqual([]);
  });

  it('formats points for an SVG attribute', () => {
    expect(toPoints([{ x: 1, y: 2.25 }, { x: 3, y: 4 }])).toBe('1,2.3 3,4');
  });
});

describe('clipSegment', () => {
  it('keeps a segment inside, trims one that crosses, and drops one outside', () => {
    expect(clipSegment(seg(10, 10, 20, 20), room)).toEqual(seg(10, 10, 20, 20));
    expect(clipSegment(seg(-50, 30, 50, 30), room)).toEqual(seg(0, 30, 50, 30));
    expect(clipSegment(seg(-20, 10, -5, 40), room)).toBeNull();
    expect(clipSegment(seg(0, -10, 0, -5), room)).toBeNull();
  });
});

describe('distanceToSegment', () => {
  it('measures to the nearest point, including the ends', () => {
    expect(distanceToSegment({ x: 5, y: 3 }, seg(0, 0, 10, 0))).toBe(3);
    expect(distanceToSegment({ x: 13, y: 4 }, seg(0, 0, 10, 0))).toBe(5);
    expect(distanceToSegment({ x: 1, y: 1 }, seg(2, 2, 2, 2))).toBeCloseTo(Math.SQRT2);
  });
});
