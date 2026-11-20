import { projects as allProjects } from '@/content/projects';
import type { Project } from '@/content/types';

const byOrder = (a: Project, b: Project) => a.order - b.order;

/** Every project a visitor can reach, in collection order. Hidden records are excluded. */
export function publicProjects(source: readonly Project[] = allProjects): Project[] {
  return source.filter((p) => p.visibility !== 'hidden').sort(byOrder);
}

export function featuredProjects(source: readonly Project[] = allProjects): Project[] {
  return publicProjects(source).filter((p) => p.visibility === 'featured');
}

export function findProject(slug: string, source: readonly Project[] = allProjects): Project | undefined {
  return publicProjects(source).find((p) => p.slug === slug);
}

/** Previous and next project in collection order, for in-page navigation. */
export function neighbours(slug: string, source: readonly Project[] = allProjects) {
  const list = publicProjects(source);
  const i = list.findIndex((p) => p.slug === slug);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}
