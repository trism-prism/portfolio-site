import { describe, expect, test } from 'vitest';
import { MOTH_LINES, MOTH_TAIL, MOTH_VIEW } from '@/components/ui/MothConstellation';
import { crossings, routeControls, sampleBezier, segmentsIntersect, type Pt } from './heroRoute';

describe('segmentsIntersect', () => {
  test('detects a proper crossing, a miss and a touch', () => {
    expect(segmentsIntersect([0, 0], [10, 10], [0, 10], [10, 0])).toBe(true);
    expect(segmentsIntersect([0, 0], [10, 0], [0, 5], [10, 5])).toBe(false);
    expect(segmentsIntersect([0, 0], [10, 0], [10, 0], [10, 10])).toBe(true);
  });
});

// The layout the hero CSS produces at >= 1024px: the figure is right-aligned in the 1152px content box
// (64px in from the edge below 1280px, 36px from 1280px up), 32vw wide clamped to 320..460, centred 50px above
// the middle of the hero; the marker sits 35% of the figure width left of it and 130px above the hero's bottom.
function layout(W: number, H: number) {
  const cw = Math.min(W, 1152);
  const rightEdge = (W - cw) / 2 + cw - (W < 1280 ? 64 : 36);
  const w = Math.min(460, Math.max(320, 0.32 * W));
  const s = w / MOTH_VIEW.w;
  const h = MOTH_VIEW.h * s;
  const left = rightEdge - w;
  const top = H * 0.5 - 50 - h / 2;
  const to = (p: Pt): Pt => [left + p[0] * s, top + p[1] * s];
  return { s, to, marker: [left - 0.35 * w, H - 130] as Pt, tail: to(MOTH_TAIL) };
}

describe('hero route', () => {
  // 852 is about the shortest hero at these widths (text column plus padding); taller screens follow.
  for (const W of [1024, 1280, 1440, 1920]) {
    for (const H of [852, 900, 1080]) {
      test(`reaches the tail star without crossing a constellation line at ${W} x ${H}`, () => {
        const { s, to, marker, tail } = layout(W, H);
        const { c1, c2 } = routeControls(marker, tail, s);
        // the route ends on the star, where the mid-tail line also ends; test up to the star's edge
        const pts = sampleBezier(marker, c1, c2, tail).filter(([x, y]) => Math.hypot(x - tail[0], y - tail[1]) > 3.4 * s);
        const lines = MOTH_LINES.map(([a, b]) => [to(a), to(b)] as [Pt, Pt]);
        expect(lines).toHaveLength(15);
        expect(crossings(pts, lines)).toBe(0);
        // and it stays out of the "the Moth" name (viewBox 160..240 x 234..258)
        const [nx0, ny0] = to([160, 234]);
        const [nx1, ny1] = to([240, 258]);
        expect(pts.some(([x, y]) => x > nx0 && x < nx1 && y > ny0 && y < ny1)).toBe(false);
      });
    }
  }
});
