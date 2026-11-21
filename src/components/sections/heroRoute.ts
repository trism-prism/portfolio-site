// Geometry for the hero route: a cubic curve from the "you are here" marker up to the Moth's tail star.
// Pure, so the no-crossing property can be tested for the layouts the hero CSS produces.

export type Pt = [number, number];

/**
 * Control points for the curve from `marker` to `tail`, both in the same pixel space. `scale` is the rendered
 * size of the figure over its 400-wide viewBox. The curve rises from the marker, then sweeps in from the
 * lower left and arrives under the tail star, inside the open bottom of the hind wings.
 */
export function routeControls(marker: Pt, tail: Pt, scale: number): { c1: Pt; c2: Pt } {
  const c2: Pt = [tail[0] - 90 * scale, tail[1] + 54 * scale];
  const c1: Pt = [marker[0] + (c2[0] - marker[0]) * 0.12, marker[1] - (marker[1] - c2[1]) * 0.45];
  return { c1, c2 };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function routePath(marker: Pt, tail: Pt, scale: number): string {
  const { c1, c2 } = routeControls(marker, tail, scale);
  return `M${r1(marker[0])} ${r1(marker[1])} C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(tail[0])} ${r1(tail[1])}`;
}

/** Points along the cubic Bézier p0 → p3. */
export function sampleBezier(p0: Pt, c1: Pt, c2: Pt, p3: Pt, n = 240): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n;
    const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1]] as Pt;
  });
}

const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/** True when segments ab and cd cross or touch. */
export function segmentsIntersect(a: Pt, b: Pt, c: Pt, d: Pt): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const on = (p: Pt, q: Pt, r: Pt) => Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);
  return (d1 === 0 && on(c, d, a)) || (d2 === 0 && on(c, d, b)) || (d3 === 0 && on(a, b, c)) || (d4 === 0 && on(a, b, d));
}

/** Number of constellation lines the sampled route crosses. Lines are pairs of points in the route's pixel space. */
export function crossings(route: Pt[], lines: [Pt, Pt][]): number {
  let n = 0;
  for (const [c, d] of lines) {
    for (let i = 0; i < route.length - 1; i++) {
      if (segmentsIntersect(route[i], route[i + 1], c, d)) {
        n++;
        break;
      }
    }
  }
  return n;
}
