import { describe, expect, test } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { projects } from './projects';
import { focusAreas } from './focus';
import { news } from './news';
import { sections } from './sections';
import { glossary } from './glossary';
import { annotations } from './annotations';
import { findDataPlaceholders } from './audit';
import { isPh, ph, plain } from './ph';

const srcFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? srcFiles(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
const source = srcFiles('src')
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');

describe('data integrity', () => {
  test('project ids and slugs are unique and URL-safe', () => {
    expect(new Set(projects.map((p) => p.id)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    for (const p of projects) expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });
  test('exactly one spotlight, and it is featured', () => {
    const s = projects.filter((p) => p.spotlight);
    expect(s).toHaveLength(1);
    expect(s[0].featured).toBe(true);
  });
  test('every project cover and demo is registered', () => {
    const reg = readFileSync('src/components/scenes/covers/registry.tsx', 'utf8');
    for (const p of projects) expect(reg).toContain(`${p.cover}: {`);
    const ui = readFileSync('src/components/sections/Projects.tsx', 'utf8');
    for (const p of projects.filter((x) => x.demo)) expect(ui).toContain(`${p.demo}:`);
  });
  test('every focus area has art and its evidence resolves', () => {
    const art = readFileSync('src/components/scenes/FocusArt.tsx', 'utf8');
    for (const f of focusAreas) {
      expect(art).toMatch(new RegExp(`['"]?${f.key}['"]?: \\{ Scene`));
      for (const e of f.evidence)
        expect(e.startsWith('#') ? sections.some((s) => `#${s.id}` === e) : projects.some((p) => p.slug === e)).toBe(true);
    }
  });
  test('media files exist', () => {
    for (const p of projects) for (const m of p.media ?? []) expect(existsSync(join('public', m.src))).toBe(true);
  });
  test('news ids are unique and dates are ISO days', () => {
    expect(new Set(news.map((n) => n.id)).size).toBe(news.length);
    for (const n of news) expect(n.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  test('every annotation target exists in the source', () => {
    for (const a of annotations) expect(source).toContain(`data-annotate="${a.target}"`);
  });
  test('glossary definitions are substantive', () => {
    for (const v of Object.values(glossary)) expect(v.length).toBeGreaterThan(20);
  });
});

describe('placeholders', () => {
  test('marker helpers round-trip', () => {
    expect(isPh(ph('x'))).toBe(true);
    expect(plain(ph('x'))).toBe('x');
    expect(isPh('x')).toBe(false);
  });
  test('every data placeholder is listed in PLACEHOLDERS.md', () => {
    const found = findDataPlaceholders();
    expect(found.length).toBeGreaterThan(0);
    const doc = readFileSync('PLACEHOLDERS.md', 'utf8');
    expect(found.filter((f) => !doc.includes(f.path)).map((f) => f.path)).toEqual([]);
  });
  test('the Formwork record carries no marker', () => {
    expect(findDataPlaceholders().filter((f) => f.path.startsWith('data.experience[0]'))).toEqual([]);
  });
});
