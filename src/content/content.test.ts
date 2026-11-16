import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { site } from '../site';
import { imageSrc, moreWork, projects } from './projects';

const root = join(__dirname, '..', '..');

describe('projects', () => {
  it('have unique slugs and every image file exists', () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    for (const p of projects) {
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.lead).toBeLessThan(p.images.length);
      for (const img of p.images) {
        expect(img.alt.length).toBeGreaterThan(20);
        expect(img.caption.length).toBeGreaterThan(0);
        for (const w of img.widths) expect(existsSync(join(root, 'public', imageSrc(img, w)))).toBe(true);
      }
    }
  });

  it('use https for every outside link and link only to the owner GitHub account', () => {
    const urls = [
      ...projects.flatMap((p) => Object.values(p.links)),
      ...moreWork.flatMap((m) => m.links.map((l) => l.href)),
    ].filter((u): u is string => Boolean(u));
    expect(urls.length).toBeGreaterThan(8);
    for (const u of urls) {
      expect(u.startsWith('https://')).toBe(true);
      if (u.includes('github.com')) expect(u.startsWith('https://github.com/trism-prism/')).toBe(true);
    }
  });

  it('keep the private repository unlinked', () => {
    const cfb = moreWork.find((m) => m.name.includes('College Football'));
    expect(cfb?.links).toEqual([]);
    const all = JSON.stringify([projects, moreWork]);
    expect(all).not.toContain('cfb-upset-study');
  });
});

describe('site', () => {
  it('keeps the production URL in exactly one source file', () => {
    const host = new URL(site.url).host;
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx|css|json)$/.test(name) && readFileSync(p, 'utf8').includes(host)) hits.push(p);
      }
    };
    walk(join(root, 'src'));
    expect(hits.map((h) => h.replace(root, '').split(String.fromCharCode(92)).join('/'))).toEqual(['/src/site.ts']);
  });
});

describe('resume', () => {
  it('is a PDF of a sensible size at public/resume.pdf', () => {
    const file = join(root, 'public', 'resume.pdf');
    expect(existsSync(file)).toBe(true);
    const bytes = readFileSync(file);
    expect(bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(20 * 1024);
  });
});
