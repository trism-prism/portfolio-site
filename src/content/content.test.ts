import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';
import { describe, expect, it } from 'vitest';
import { caseStudyPath } from '@/lib/caseStudy';
import { site } from '@/site';
import { education, experience, intro, skills } from './profile';
import { projects } from './projects';

const publicDir = path.join(process.cwd(), 'public');
// Case-sensitive on purpose: 'todo' appears legitimately in image names and prose ("to-do").
const PLACEHOLDER = /\bTODO\b|\bTBD\b|FIXME|[Ll]orem ipsum|\{\{/;
const SLUG =/^[a-z0-9]+(-[a-z0-9]+)*$/;

describe('project records', () => {
  it('have unique ids and slugs in URL-safe form', () => {
    const ids = projects.map((p) => p.id);
    const slugs = projects.map((p) => p.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug, slug).toMatch(SLUG);
  });

  it('have no empty required text', () => {
    for (const p of projects) {
      for (const field of ['title', 'summary', 'role', 'period'] as const) {
        expect(p[field].trim(), `${p.id}.${field}`).not.toBe('');
      }
      expect(p.tech.length, `${p.id}.tech`).toBeGreaterThan(0);
      expect(p.highlights.length, `${p.id}.highlights`).toBeGreaterThan(0);
    }
  });

  it('have unique sort orders so the collection order is deterministic', () => {
    const orders = projects.map((p) => p.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('link only over https, and repos only on the owner’s GitHub', () => {
    for (const p of projects) {
      const hrefs = [p.links.repo, p.links.live, ...(p.links.extra ?? []).map((e) => e.href)].filter(Boolean);
      for (const href of hrefs) expect(href, p.id).toMatch(/^https:\/\//);
      if (p.links.repo) expect(p.links.repo).toMatch(/^https:\/\/github\.com\/trism-prism\/[\w.-]+$/);
    }
  });

  it('point at media files that exist, with the declared dimensions and alt text', () => {
    for (const p of projects) {
      for (const m of [...p.media, ...(p.preview ? [p.preview] : [])]) {
        const file = path.join(publicDir, m.src);
        expect(existsSync(file), `${p.id}: ${m.src}`).toBe(true);
        const size = imageSize(readFileSync(file));
        expect({ w: size.width, h: size.height }, m.src).toEqual({ w: m.width, h: m.height });
        expect(m.alt.trim().length, `${m.src} alt`).toBeGreaterThan(10);
      }
    }
  });

  it('reference case-study files that exist and start below the page title', () => {
    for (const p of projects.filter((x) => x.caseStudy)) {
      const file = caseStudyPath(p.caseStudy!);
      expect(existsSync(file), file).toBe(true);
      const text = readFileSync(file, 'utf8');
      expect(text, `${file} must not contain an h1`).not.toMatch(/^# /m);
      expect(PLACEHOLDER.exec(text)?.[0], `${file} has a placeholder marker`).toBeUndefined();
    }
  });

  it('contain no placeholder markers', () => {
    for (const p of projects) {
      expect(PLACEHOLDER.exec(JSON.stringify(p))?.[0], `${p.id} has a placeholder marker`).toBeUndefined();
    }
  });

  it('contain no AI authorship attribution', () => {
    const text = JSON.stringify(projects).toLowerCase();
    expect(text).not.toMatch(/generated (with|by)|co-authored-by/);
  });
});

describe('profile and site', () => {
  it('has the core profile content', () => {
    expect(intro.headline.trim()).not.toBe('');
    expect(experience.length).toBeGreaterThan(0);
    expect(education.length).toBeGreaterThan(0);
    expect(skills.every((g) => g.items.length > 0)).toBe(true);
  });

  it('serves the résumé and CV from public/, as PDFs', () => {
    for (const href of [site.links.resume, site.links.cv]) {
      const file = path.join(publicDir, href);
      expect(existsSync(file), href).toBe(true);
      expect(readFileSync(file).subarray(0, 5).toString('latin1'), href).toBe('%PDF-');
    }
  });

  it('uses an https production URL that is not a preview deployment', () => {
    expect(site.url).toMatch(/^https:\/\//);
    expect(site.url).not.toMatch(/-git-|localhost/);
  });
});
