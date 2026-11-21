import { describe, expect, it } from 'vitest';
import { figures } from './figures';
import { projects } from '@/data/projects';

const FW = 720;
const FH = 240;

describe('footer constellation figures', () => {
  it('has at least three figures, one per project', () => {
    expect(figures.length).toBeGreaterThanOrEqual(3);
    expect(new Set(figures.map((f) => f.slug)).size).toBe(figures.length);
  });

  for (const f of figures) {
    describe(f.slug, () => {
      it('charts a project that exists', () => {
        expect(projects.some((p) => p.slug === f.slug)).toBe(true);
      });
      it('has lines that refer to existing points', () => {
        expect(f.lines.length).toBeGreaterThan(0);
        for (const l of f.lines) {
          expect(Number.isInteger(l.a) && l.a >= 0 && l.a < f.points.length).toBe(true);
          expect(Number.isInteger(l.b) && l.b >= 0 && l.b < f.points.length).toBe(true);
          expect(l.a).not.toBe(l.b);
        }
      });
      it('has a brightest star that is one of its points', () => {
        expect(Number.isInteger(f.brightest) && f.brightest >= 0 && f.brightest < f.points.length).toBe(true);
      });
      it('keeps every point inside the 720 × 240 frame', () => {
        for (const [x, y] of f.points) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(FW);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(FH);
        }
      });
      it('has a hint and a name', () => {
        expect(f.hint.length).toBeGreaterThan(0);
        expect(f.name.length).toBeGreaterThan(0);
      });
    });
  }
});
