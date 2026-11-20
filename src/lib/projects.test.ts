import { describe, expect, it } from 'vitest';
import type { Project } from '@/content/types';
import { featuredProjects, findProject, neighbours, publicProjects } from './projects';

const make = (slug: string, visibility: Project['visibility'], order: number): Project => ({
  id: slug,
  slug,
  title: slug,
  summary: 's',
  role: 'r',
  period: 'p',
  kind: 'software',
  tech: ['t'],
  highlights: ['h'],
  links: {},
  media: [],
  visibility,
  order,
});

const fixture = [make('c', 'listed', 30), make('a', 'featured', 10), make('h', 'hidden', 5), make('b', 'featured', 20)];

describe('project selection', () => {
  it('orders the public collection and leaves hidden records out', () => {
    expect(publicProjects(fixture).map((p) => p.slug)).toEqual(['a', 'b', 'c']);
  });

  it('features only featured records', () => {
    expect(featuredProjects(fixture).map((p) => p.slug)).toEqual(['a', 'b']);
  });

  it('does not resolve hidden or unknown slugs', () => {
    expect(findProject('h', fixture)).toBeUndefined();
    expect(findProject('nope', fixture)).toBeUndefined();
    expect(findProject('c', fixture)?.slug).toBe('c');
  });

  it('finds neighbours at the ends and middle', () => {
    expect(neighbours('a', fixture)).toEqual({ prev: undefined, next: fixture[3] });
    expect(neighbours('c', fixture).next).toBeUndefined();
    expect(neighbours('b', fixture).prev?.slug).toBe('a');
  });

  it('can promote a project by changing data only', () => {
    const promoted = fixture.map((p) => (p.slug === 'c' ? { ...p, visibility: 'featured' as const } : p));
    expect(featuredProjects(promoted).map((p) => p.slug)).toEqual(['a', 'b', 'c']);
  });
});
