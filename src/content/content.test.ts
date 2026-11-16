import { describe, expect, it } from 'vitest';
import { brandIcons } from '../components/brandIcons';
import { certifications } from './certifications';
import { education } from './education';
import { experience } from './experience';
import { leetcode } from './leetcode';
import { profile, socials } from './profile';
import { projects } from './projects';
import { publications } from './publications';
import { skillCategories } from './skills';

const okUrl = (u: string) => u.startsWith('https://') || (u.startsWith('/') && !u.startsWith('//'));
const unique = (ids: string[]) => new Set(ids).size === ids.length;
const blank = (v: string) => v.trim() === '';

describe('content', () => {
  it('has unique ids in every list', () => {
    expect(unique(experience.map((x) => x.id))).toBe(true);
    expect(unique(projects.map((x) => x.id))).toBe(true);
    expect(unique(education.map((x) => x.id))).toBe(true);
    expect(unique(publications.map((x) => x.id))).toBe(true);
    expect(unique(certifications.map((x) => x.id))).toBe(true);
    expect(unique(skillCategories.map((x) => x.id))).toBe(true);
    expect(unique(skillCategories.flatMap((c) => c.skills.map((s) => s.name)))).toBe(true);
  });

  it('has no empty required strings', () => {
    for (const e of experience) {
      for (const v of [e.title, e.company, e.logo, e.location, e.dates, e.summary, ...e.tech, ...e.bullets]) expect(blank(v)).toBe(false);
      expect(e.bullets.length).toBeGreaterThan(0);
    }
    for (const p of projects) {
      for (const v of [p.title, p.dates, p.description, ...p.tech, ...p.features]) expect(blank(v)).toBe(false);
      expect(p.features.length).toBeGreaterThan(0);
      if (p.cover) expect(blank(p.cover.alt)).toBe(false);
    }
    for (const e of education) for (const v of [e.degree, e.school, e.dates]) expect(blank(v)).toBe(false);
    for (const c of skillCategories) {
      expect(c.skills.length).toBeGreaterThan(0);
      for (const s of c.skills) expect(blank(s.name)).toBe(false);
    }
    for (const r of profile.roles) expect(blank(r)).toBe(false);
  });

  it('uses only https or root-relative links, and every skill icon exists', () => {
    const urls = [
      profile.resume,
      leetcode.url,
      ...socials.map((s) => s.url),
      ...experience.map((e) => e.url ?? ''),
      ...education.map((e) => e.url ?? ''),
      ...projects.flatMap((p) => [p.links.repo ?? '', p.links.live ?? '', p.cover?.src ?? '']),
      ...publications.map((p) => p.link),
      ...certifications.map((c) => c.url ?? ''),
    ].filter(Boolean);
    for (const u of urls) expect(okUrl(u), u).toBe(true);
    for (const c of skillCategories) for (const s of c.skills) if (s.icon) expect(brandIcons[s.icon], s.name).toBeDefined();
  });

  it('links GitHub repos only under the owner account', () => {
    for (const p of projects) if (p.links.repo) expect(p.links.repo.startsWith('https://github.com/trism-prism/')).toBe(true);
  });

  it('keeps the Formwork entry free of links and client or private references', () => {
    const f = experience.find((e) => e.id === 'formwork');
    expect(f).toBeDefined();
    const text = JSON.stringify(f);
    expect(text).not.toMatch(/https?:\/\//i);
    expect(text).not.toMatch(/\.(com|io|net|app)\b/i);
    expect(f?.url).toBeUndefined();
  });

  it('leaves LeetCode, publications and certifications blank on purpose', () => {
    expect(leetcode.url).toBe('');
    expect(leetcode.maxRating).toBeNull();
    expect(Object.keys(leetcode.submissions)).toHaveLength(0);
    expect(publications).toHaveLength(0);
    expect(certifications).toHaveLength(0);
  });
});
