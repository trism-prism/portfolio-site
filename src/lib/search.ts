import type { Project, ProjectKind } from '@/data/projects';

export type Filter = 'all' | 'featured' | ProjectKind;

export const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured' },
  { id: 'software', label: 'Software' },
  { id: 'ai', label: 'AI' },
  { id: 'data', label: 'Data' },
  { id: 'systems', label: 'Systems' },
];

export function inFilter(p: Project, f: Filter): boolean {
  if (f === 'all') return true;
  if (f === 'featured') return p.featured;
  return p.kind === f;
}

/** Every whitespace-separated term must appear in the title, summary or tech list. */
export function matches(p: Project, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = `${p.title} ${p.summary} ${p.tech.join(' ')}`.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

/** Spotlight first when not searching, then newest first, then by id for stability. */
export function sortProjects(list: Project[], query: string): Project[] {
  const searching = query.trim().length > 0;
  return [...list].sort((a, b) => {
    if (!searching && a.spotlight !== b.spotlight) return a.spotlight ? -1 : 1;
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.id - b.id;
  });
}

export function filterProjects(all: Project[], f: Filter, query: string): Project[] {
  return sortProjects(
    all.filter((p) => inFilter(p, f) && matches(p, query)),
    query,
  );
}

export function counts(all: Project[], query: string): Record<Filter, number> {
  const out = {} as Record<Filter, number>;
  for (const { id } of filters) out[id] = all.filter((p) => inFilter(p, id) && matches(p, query)).length;
  return out;
}
