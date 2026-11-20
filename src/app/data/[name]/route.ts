import { personal } from '@/data/personal';
import { projects, contributions } from '@/data/projects';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { skillCategories, secondarySkills } from '@/data/skills';
import { certifications, badges, honors, competitions } from '@/data/achievements';
import { focusAreas } from '@/data/focus';
import { news } from '@/data/news';
import { glossary } from '@/data/glossary';
import { sections } from '@/data/sections';
import { feedText } from '@/data/ph';

export const dynamic = 'force-static';
export const dynamicParams = false;

// Public data views. Placeholder strings keep an explicit [PLACEHOLDER] prefix.
const files: Record<string, unknown> = {
  personal,
  projects,
  contributions,
  experience,
  education,
  skills: { main: skillCategories, secondary: secondarySkills },
  achievements: { certifications, badges, honors, competitions },
  focus: focusAreas,
  news,
  glossary,
  sections,
};

export function generateStaticParams() {
  return Object.keys(files).map((k) => ({ name: `${k}.json` }));
}

const mark = (v: unknown): unknown =>
  typeof v === 'string' ? feedText(v) : Array.isArray(v) ? v.map(mark) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mark(x)])) : v;

export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const key = name.replace(/\.json$/, '');
  if (!(key in files)) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(mark(files[key]), null, 2) + '\n', { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
