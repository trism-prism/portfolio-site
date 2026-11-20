import { describe, expect, test } from 'vitest';
import { fnv1a } from './fnv';
import { counts, filterProjects, matches } from './search';
import { LIMITS, isBot, mailtoHref, sendReducer, validate, type Fields, type SendState } from './contact';
import { boxWalls, buildGrid, polyArea, visibility, gridCast, raySeg, type Seg } from './visibility';
import { cleanDays, currentStreak, longestStreak, placeholderYear, withLevels } from './calendar';
import { buildVCard, fold } from './vcard';
import { along, cubicAtLength, seg } from './kit';
import { projects } from '@/data/projects';

describe('fnv1a', () => {
  test('is deterministic, 7 hex chars, and matches the reference value', () => {
    expect(fnv1a('', 8)).toBe('811c9dc5');
    expect(fnv1a('a', 8)).toBe('e40c292c');
    expect(fnv1a('kiln2026-09-01')).toMatch(/^[0-9a-f]{7}$/);
    expect(fnv1a('x')).toBe(fnv1a('x'));
  });
});

describe('project search', () => {
  test('every term must match title, summary or tech', () => {
    const kiln = projects.find((p) => p.slug === 'kiln')!;
    expect(matches(kiln, 'react dexie')).toBe(true);
    expect(matches(kiln, 'react kubernetes')).toBe(false);
    expect(matches(kiln, '   ')).toBe(true);
  });
  test('spotlight first when not searching, newest first when searching', () => {
    expect(filterProjects(projects, 'all', '')[0].spotlight).toBe(true);
    const searched = filterProjects(projects, 'all', 'python');
    expect(searched.length).toBeGreaterThan(1);
    for (let i = 1; i < searched.length; i++) expect(searched[i - 1].date >= searched[i].date).toBe(true);
  });
  test('counts agree with filtering, and a no-match query returns nothing', () => {
    const c = counts(projects, '');
    expect(c.all).toBe(projects.length);
    expect(c.featured).toBe(projects.filter((p) => p.featured).length);
    expect(filterProjects(projects, 'all', 'zzzz-no-such-thing')).toEqual([]);
  });
});

describe('contact form', () => {
  const ok: Fields = { name: 'Ada', email: 'ada@example.com', message: 'Hello there, Tristan!', website: '' };
  test('accepts a complete message', () => expect(validate(ok)).toEqual({}));
  test('rejects missing, short, long and malformed fields', () => {
    expect(validate({ ...ok, name: ' ' }).name).toBeTruthy();
    expect(validate({ ...ok, name: 'x'.repeat(LIMITS.name + 1) }).name).toBeTruthy();
    expect(validate({ ...ok, email: 'ada@example' }).email).toBeTruthy();
    expect(validate({ ...ok, email: 'ada example.com' }).email).toBeTruthy();
    expect(validate({ ...ok, message: 'short' }).message).toBeTruthy();
    expect(validate({ ...ok, message: 'x'.repeat(LIMITS.messageMax + 1) }).message).toBeTruthy();
  });
  test('honeypot', () => {
    expect(isBot(ok)).toBe(false);
    expect(isBot({ ...ok, website: 'spam.example' })).toBe(true);
  });
  test('a timeout keeps the send pending, and a late success wins', () => {
    let s: SendState = { status: 'idle' };
    s = sendReducer(s, { type: 'submit' });
    expect(s.status).toBe('sending');
    expect(sendReducer(s, { type: 'submit' })).toBe(s);
    s = sendReducer(s, { type: 'timeout' });
    expect(s).toMatchObject({ status: 'error', pending: true });
    expect(sendReducer(s, { type: 'dismiss' })).toBe(s);
    s = sendReducer(s, { type: 'success', via: 'relay' });
    expect(s).toEqual({ status: 'sent', via: 'relay' });
    expect(sendReducer(s, { type: 'reset' })).toEqual({ status: 'idle' });
  });
  test('a failure is dismissable and a stale success is ignored', () => {
    let s: SendState = sendReducer({ status: 'idle' }, { type: 'submit' });
    s = sendReducer(s, { type: 'fail', message: 'nope' });
    expect(s).toMatchObject({ status: 'error', pending: false });
    expect(sendReducer(s, { type: 'dismiss' })).toEqual({ status: 'idle' });
    expect(sendReducer(s, { type: 'success', via: 'relay' })).toBe(s);
  });
  test('mailto hand-off encodes the message', () => {
    const href = mailtoHref('t@example.com', ok);
    expect(href.startsWith('mailto:t@example.com?subject=')).toBe(true);
    expect(decodeURIComponent(href)).toContain('Hello there, Tristan!');
  });
});

describe('visibility', () => {
  const s = (ax: number, ay: number, bx: number, by: number): Seg => ({ a: { x: ax, y: ay }, b: { x: bx, y: by } });
  test('an empty room is fully lit', () => {
    const vis = visibility({ x: 50, y: 50 }, boxWalls(100, 100));
    expect(polyArea(vis.polygon)).toBeCloseTo(10000, 0);
  });
  test('a wall casts a shadow and the grid walk agrees with brute force', () => {
    const walls = [...boxWalls(200, 100), s(100, 20, 100, 80)];
    const grid = buildGrid(walls, 200, 100, 20);
    const vis = visibility({ x: 50, y: 50 }, walls, grid);
    expect(polyArea(vis.polygon)).toBeLessThan(20000);
    expect(vis.gridTests).toBeLessThan(vis.bruteTests);
    for (const a of [0, 0.4, 1.2, 2.5, 3.1, 4, 5.5]) {
      const d = { x: Math.cos(a), y: Math.sin(a) };
      const brute = Math.min(...walls.map((w) => raySeg({ x: 50, y: 50 }, d, w) ?? Infinity));
      expect(gridCast({ x: 50, y: 50 }, d, walls, grid).t).toBeCloseTo(brute, 6);
    }
  });
});

describe('contribution calendar', () => {
  test('drops malformed rows and sorts', () => {
    const d = cleanDays([
      { date: '2026-01-02', count: 1 },
      { date: 'bad', count: 3 },
      { date: '2026-01-01', count: -1 },
      { date: '2026-01-01', count: 2 },
    ]);
    expect(d.map((x) => x.date)).toEqual(['2026-01-01', '2026-01-02']);
  });
  test('streaks use contiguous UTC days and tolerate a zero today', () => {
    const days = withLevels(
      [1, 2, 0, 3, 1, 0].map((count, i) => ({ date: `2026-01-0${i + 1}`, count, level: 0 as const })),
    );
    expect(currentStreak(days)).toBe(2);
    expect(longestStreak(days)).toBe(2);
    expect(days.every((d) => d.level >= 0 && d.level <= 4)).toBe(true);
  });
  test('the placeholder year is 365 seeded days ending on the given date', () => {
    const y = placeholderYear(new Date('2026-11-20T00:00:00Z'));
    expect(y).toHaveLength(365);
    expect(y[364].date).toBe('2026-11-20');
    expect(placeholderYear(new Date('2026-11-20T00:00:00Z'))).toEqual(y);
  });
});

describe('vCard', () => {
  test('folds long lines at 75 octets with CRLF + space', () => {
    const line = 'NOTE:' + 'x'.repeat(200);
    const f = fold(line);
    for (const part of f.split('\r\n')) expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    expect(f.replace(/\r\n /g, '')).toBe(line);
  });
  test('builds a CRLF vCard 4.0', () => {
    const v = buildVCard({ name: 'A B', first: 'A', last: 'B', email: 'a@b.co', url: 'https://x.y', title: 'T', note: 'n', links: [], location: 'Here' });
    expect(v.startsWith('BEGIN:VCARD\r\nVERSION:4.0\r\n')).toBe(true);
    expect(v.endsWith('END:VCARD\r\n')).toBe(true);
  });
});

describe('scene kit', () => {
  test('seg clamps and along walks a polyline by length', () => {
    expect(seg(5, 0, 10)).toBe(0.5);
    expect(seg(-1, 0, 10)).toBe(0);
    expect(along([[0, 0], [10, 0], [10, 10]], 0.5)).toEqual([10, 0]);
  });
  test('arc-length sampling reaches both ends', () => {
    expect(cubicAtLength([0, 0], [0, 10], [10, 10], [10, 0], 0)).toEqual([0, 0]);
    const end = cubicAtLength([0, 0], [0, 10], [10, 10], [10, 0], 1);
    expect(end[0]).toBeCloseTo(10, 5);
    expect(end[1]).toBeCloseTo(0, 5);
  });
});
