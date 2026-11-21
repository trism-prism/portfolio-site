import { describe, expect, test } from 'vitest';
import { projects, type Project } from '@/data/projects';
import { KINDS, MIN_GAP, layoutSkyMap, type SkyMapLayout } from './skyMap';

const allStars = (l: SkyMapLayout) => l.groups.flatMap((g) => g.stars);
const synthetic = (slug: string, date: string, kind: Project['kind'] = 'data'): Project => ({ ...projects[0], id: 900 + slug.length, slug, kind, date, featured: false, spotlight: false });

describe('layoutSkyMap', () => {
  test('one group per kind, in filter order, with the documented view boxes', () => {
    const four = layoutSkyMap(projects, 4);
    expect(four.groups.map((g) => g.kind)).toEqual(['software', 'ai', 'data', 'systems']);
    expect(KINDS).toEqual(['software', 'ai', 'data', 'systems']);
    expect([four.width, four.height]).toEqual([1104, 210]);
    expect(four.groups.map((g) => g.cell.x)).toEqual([0, 276, 552, 828]);
    const two = layoutSkyMap(projects, 2);
    expect([two.width, two.height]).toEqual([552, 380]);
    expect(two.groups.map((g) => [g.cell.x, g.cell.y])).toEqual([[0, 0], [276, 0], [0, 190], [276, 190]]);
  });

  test('is deterministic', () => {
    for (const cols of [4, 2] as const) expect(layoutSkyMap(projects, cols)).toEqual(layoutSkyMap([...projects].reverse(), cols));
  });

  test('every project appears exactly once, in its own kind, in both layouts', () => {
    for (const cols of [4, 2] as const) {
      const l = layoutSkyMap(projects, cols);
      expect(allStars(l).map((s) => s.slug).sort()).toEqual(projects.map((p) => p.slug).sort());
      for (const g of l.groups) {
        expect(g.count).toBe(g.stars.length);
        for (const s of g.stars) expect(projects.find((p) => p.slug === s.slug)!.kind).toBe(g.kind);
      }
    }
  });

  test('every star sits inside its cell inner area (36px sides and top, 44px bottom)', () => {
    for (const cols of [4, 2] as const) {
      for (const g of layoutSkyMap(projects, cols).groups) {
        expect(g.inner).toEqual({ x0: g.cell.x + 36, y0: g.cell.y + 36, x1: g.cell.x + g.cell.w - 36, y1: g.cell.y + g.cell.h - 44 });
        for (const s of g.stars) {
          expect(s.x).toBeGreaterThanOrEqual(g.inner.x0);
          expect(s.x).toBeLessThanOrEqual(g.inner.x1);
          expect(s.y).toBeGreaterThanOrEqual(g.inner.y0);
          expect(s.y).toBeLessThanOrEqual(g.inner.y1);
        }
      }
    }
  });

  test('all stars are at least 30px apart, even in a crowded kind', () => {
    const crowded = [...projects, ...Array.from({ length: 12 }, (_, i) => synthetic(`crowd-${i}`, `2026-0${(i % 9) + 1}`))];
    for (const list of [projects, crowded]) {
      for (const cols of [4, 2] as const) {
        const stars = allStars(layoutSkyMap(list, cols));
        for (let i = 0; i < stars.length; i++)
          for (let j = i + 1; j < stars.length; j++) expect(Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y)).toBeGreaterThanOrEqual(MIN_GAP);
      }
    }
  });

  test('coordinates are rounded to one decimal', () => {
    for (const s of allStars(layoutSkyMap(projects, 4))) for (const n of [s.x, s.y]) expect(Math.round(n * 10) / 10).toBe(n);
  });

  test('lines join each kind in date order; a kind with one project has no line', () => {
    for (const g of layoutSkyMap(projects, 4).groups) {
      const dates = g.stars.map((s) => s.date);
      expect(dates).toEqual([...dates].sort());
      expect(g.line).toBe(g.stars.length > 1 ? g.stars.map((s) => `${s.x},${s.y}`).join(' ') : null);
    }
    const one = layoutSkyMap(projects.filter((p) => p.kind !== 'ai' || p.slug === 'docs-qa-copilot'), 4);
    expect(one.groups.find((g) => g.kind === 'ai')!.line).toBeNull();
  });

  test('a position depends only on the slug: a newer project never moves an older star', () => {
    for (const cols of [4, 2] as const) {
      const before = layoutSkyMap(projects, cols);
      for (const kind of KINDS) {
        const after = layoutSkyMap([...projects, synthetic('a-brand-new-project', '2099-01', kind)], cols);
        for (const s of allStars(before)) expect(allStars(after).find((x) => x.slug === s.slug)).toMatchObject({ x: s.x, y: s.y });
      }
    }
  });

  test('an older project moves nothing when it does not collide with an existing star', () => {
    const before = layoutSkyMap(projects, 4);
    const existing = allStars(before);
    let checked = 0;
    for (let i = 0; i < 40 && checked < 4; i++) {
      const slug = `early-bird-${i}`;
      const solo = layoutSkyMap([synthetic(slug, '2001-01')], 4);
      const raw = allStars(solo)[0]; // its seeded position, with nothing placed before it
      const near = existing.some((s) => s.kind === raw.kind && Math.hypot(s.x - raw.x, s.y - raw.y) < MIN_GAP);
      if (near) continue;
      checked++;
      const after = allStars(layoutSkyMap([...projects, synthetic(slug, '2001-01')], 4));
      for (const s of existing) expect(after.find((x) => x.slug === s.slug)).toMatchObject({ x: s.x, y: s.y });
      expect(after.find((x) => x.slug === slug)).toMatchObject({ x: raw.x, y: raw.y });
    }
    expect(checked).toBeGreaterThan(0);
  });
});
