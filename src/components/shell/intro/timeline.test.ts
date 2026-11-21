import { describe, expect, it } from 'vitest';
import { ARRIVE_AT, BEATS, INTRO_SECONDS, LANDING_AT, beatProgress, introState, type IntroState } from './timeline';

const s = introState;
const keys = Object.keys(s(0)) as (keyof IntroState)[];

describe('timeline structure', () => {
  it('runs 4.2 s over nine beats with the storyboard ranges', () => {
    expect(INTRO_SECONDS).toBe(4.2);
    expect(BEATS).toEqual([[0, 0.4], [0.4, 1], [1, 1.5], [1.5, 1.9], [1.9, 2.3], [2.3, 2.8], [2.8, 3.3], [3.3, 3.6], [3.6, 4.2]]);
  });
  it('eases each beat and starts it 0.15 s early (beat 1 excepted)', () => {
    expect(beatProgress(0, 0)).toBe(0);
    expect(beatProgress(0, 0.2)).toBeCloseTo(0.5, 5);
    expect(beatProgress(1, 0.25)).toBe(0);
    expect(beatProgress(1, 0.26)).toBeGreaterThan(0);
    expect(beatProgress(1, 1.0)).toBe(1);
    expect(beatProgress(4, 1.75 + 0.275)).toBeCloseTo(0.5, 5); // midpoint of 1.75..2.3
  });
  it('phases the landing and the logo arrival at the end', () => {
    expect(LANDING_AT).toBe(3.6);
    expect(ARRIVE_AT).toBeCloseTo(INTRO_SECONDS - 0.1, 5);
  });
});

describe('values at the nine key moments', () => {
  it('0.2 s, night: stars fading in, nothing else', () => {
    const v = s(0.2);
    expect(v.stars).toBeCloseTo(0.5, 2);
    expect(v.anchor).toBeGreaterThan(0.2);
    expect(v.thread + v.drawn + v.facets + v.seam + v.wings).toBe(0);
    expect(v.night).toBe(1);
  });
  it('0.8 s, charted: thread done, about five of eight points', () => {
    const v = s(0.8);
    expect(v.thread).toBe(1);
    expect(v.drawn).toBeGreaterThan(4);
    expect(v.drawn).toBeLessThan(7);
    expect(v.facets).toBe(0);
    expect(v.seam).toBe(0);
  });
  it('1.3 s, prismatic: outline closed, facets mostly in, the glow breathing', () => {
    const v = s(1.3);
    expect(v.drawn).toBeCloseTo(8, 1);
    expect(v.facets).toBeGreaterThan(0.5);
    expect(v.glowScale).toBeGreaterThan(1.02);
    expect(v.glow).toBeGreaterThan(0.08);
    expect(v.seam).toBe(0);
  });
  it('1.7 s, seam: bright seam, pulsing, halves still together', () => {
    const v = s(1.7);
    expect(v.seam).toBeGreaterThan(0.6);
    expect(v.bloom).toBeGreaterThan(0.5);
    expect(v.pulse).toBeGreaterThanOrEqual(1);
    // two small pulses across the beat, never more than 3%
    const peaks = Array.from({ length: 41 }, (_, i) => s(1.5 + i * 0.01).pulse);
    expect(Math.max(...peaks)).toBeCloseTo(1.03, 3);
    expect(peaks.filter((x, i) => i > 0 && i < 40 && x > peaks[i - 1] && x > peaks[i + 1])).toHaveLength(2);
    expect(v.halves).toBe(0);
    expect(v.head).toBe(0);
  });
  it('2.1 s, head and antennae: slot open, head rising, left antenna leads', () => {
    const v = s(2.1);
    expect(v.halves).toBeGreaterThan(1.5);
    expect(v.halves).toBeLessThan(4);
    expect(v.head).toBeGreaterThan(0.5);
    expect(v.antL).toBeGreaterThan(v.antR);
    expect(v.antL).toBeLessThan(1);
    expect(v.solid).toBeGreaterThan(0.5);
    expect(v.wings).toBe(0);
    expect(v.fall).toBe(0);
  });
  it('2.6 s, pulls free: halves falling, rays flashing, wings still crumpled', () => {
    const v = s(2.6);
    expect(v.fall).toBeGreaterThan(0.4);
    expect(v.halves).toBeGreaterThan(8);
    expect(v.rays).toBeGreaterThan(0.8);
    expect(v.shards).toBeGreaterThan(0);
    expect(v.wings).toBe(0);
    expect(v.antL).toBe(1);
  });
  it('3.1 s, wings expand: partly open, only some wing stars lit, no constellation yet', () => {
    const v = s(3.1);
    expect(v.wings).toBeGreaterThan(0.3);
    expect(v.wings).toBeLessThan(0.97);
    expect(v.wingStars).toBeGreaterThan(0.1);
    expect(v.wingStars).toBeLessThan(0.7);
    expect(v.constellation).toBe(0);
    expect(v.rays).toBeCloseTo(0, 5);
  });
  it('3.5 s, fully open: wings open, the constellation drawing in', () => {
    const v = s(3.5);
    expect(v.wings).toBe(1);
    expect(v.wingStars).toBeGreaterThan(0.9);
    expect(v.constellation).toBeGreaterThan(0.5);
    expect(v.goldGlow).toBeGreaterThan(0.5);
    expect(v.ring).toBe(0);
    expect(v.night).toBe(1);
  });
  it('3.9 s, light reaches the site: ring out, wingbeat, flying, the night thinning', () => {
    const v = s(3.9);
    expect(v.ring).toBeGreaterThan(0.2);
    expect(v.wings).toBeLessThan(1);
    expect(v.flight).toBeGreaterThan(0);
    expect(v.flight).toBeLessThan(1);
    expect(v.night).toBeLessThanOrEqual(0.5 + 1e-9);
    expect(v.stage).toBeLessThan(0.5);
  });
});

describe('end state and clamping', () => {
  it('introState(4.2) is the finished state', () => {
    const v = s(4.2);
    expect(v.ring).toBe(1);
    expect(v.night).toBe(0);
    expect(v.flight).toBe(1);
    expect(v.mothOpacity).toBe(0);
    expect(v.stage).toBe(0);
    expect(v.wings).toBe(1);
    expect(v.wingStars).toBe(1);
    expect(v.constellation).toBe(1);
    expect(v.antL).toBe(1);
    expect(v.antR).toBe(1);
    expect(v.seam).toBe(0);
    expect(v.fall).toBe(1);
    expect(v.glow).toBe(0);
    expect(v.goldGlow).toBe(0);
  });
  it('clamps t below 0 and above 4.2', () => {
    expect(s(-1)).toEqual(s(0));
    expect(s(99)).toEqual(s(4.2));
  });
});

describe('continuity', () => {
  it('has no jump between t and t + 1 ms for any value', () => {
    // values in 0..1 may move at most 0.08 per ms; the two in stage units (halves 0..14, mothY ~60..100) 0.3
    const EPS = (k: keyof IntroState) => (k === 'halves' || k === 'mothY' ? 0.3 : 0.08);
    for (let ms = 0; ms < 4200; ms++) {
      const a = s(ms / 1000);
      const b = s((ms + 1) / 1000);
      for (const k of keys) expect(Math.abs(a[k] - b[k]), `${k} at ${ms} ms`).toBeLessThan(EPS(k));
    }
  });
});
