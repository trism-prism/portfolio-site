import { describe, expect, it } from 'vitest';
import { introBootScript } from './boot';

type Env = { motion?: string; search?: string; hash?: string; seen?: boolean; webdriver?: boolean; overlay?: boolean };

/** Runs the inline script against a fake page; returns the dataset and the timers it set. */
function run(env: Env) {
  const dataset: Record<string, string | undefined> = { motion: env.motion ?? 'full' };
  const timers: { fn: () => void; ms: number }[] = [];
  const document = { documentElement: { dataset }, querySelector: () => (env.overlay ? {} : null) };
  const location = { search: env.search ?? '', hash: env.hash ?? '' };
  const sessionStorage = { getItem: (k: string) => (k === 'tm-intro' && env.seen ? '1' : null) };
  const navigator = { webdriver: !!env.webdriver };
  const setTimeout = (fn: () => void, ms: number) => void timers.push({ fn, ms });
  new Function('document', 'location', 'sessionStorage', 'navigator', 'setTimeout', introBootScript)(document, location, sessionStorage, navigator, setTimeout);
  return { dataset, timers };
}

describe('introBootScript', () => {
  it('sets data-intro on a first visit', () => {
    expect(run({}).dataset.intro).toBe('on');
  });
  it('does not when the session flag is set, motion is reduced, or there is a hash or ?project=', () => {
    expect(run({ seen: true }).dataset.intro).toBeUndefined();
    expect(run({ motion: 'reduced' }).dataset.intro).toBeUndefined();
    expect(run({ hash: '#about' }).dataset.intro).toBeUndefined();
    expect(run({ search: '?project=kiln' }).dataset.intro).toBeUndefined();
  });
  it('does not under webdriver, unless ?intro forces it (which also ignores the flag)', () => {
    expect(run({ webdriver: true }).dataset.intro).toBeUndefined();
    expect(run({ webdriver: true, search: '?intro' }).dataset.intro).toBe('on');
    expect(run({ webdriver: true, search: '?intro=2.1' }).dataset.intro).toBe('on');
    expect(run({ seen: true, search: '?x=1&intro' }).dataset.intro).toBe('on');
  });
  it('forcing never overrides Reduced motion, a hash or ?project=', () => {
    expect(run({ search: '?intro', motion: 'reduced' }).dataset.intro).toBeUndefined();
    expect(run({ search: '?intro', hash: '#about' }).dataset.intro).toBeUndefined();
    expect(run({ search: '?intro&project=kiln' }).dataset.intro).toBeUndefined();
  });
  it('?intro=<seconds> at 4.2 or more is the finished site: no intro, no cover', () => {
    expect(run({ search: '?intro=4.3' }).dataset.intro).toBeUndefined();
    expect(run({ search: '?intro=4.2' }).dataset.intro).toBeUndefined();
    expect(run({ search: '?intro=4.1' }).dataset.intro).toBe('on');
  });
  it('has a 6 s failsafe that lifts the hold if the overlay never mounts, and leaves it while the overlay is there', () => {
    const a = run({});
    expect(a.timers).toHaveLength(1);
    expect(a.timers[0].ms).toBe(6000);
    a.timers[0].fn();
    expect(a.dataset.intro).toBeUndefined();
    const b = run({ overlay: true });
    b.timers[0].fn();
    expect(b.dataset.intro).toBe('on');
  });
});
