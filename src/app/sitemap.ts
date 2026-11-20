import type { MetadataRoute } from 'next';
import { publicProjects } from '@/lib/projects';
import { site } from '@/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['/', '/work/', '/about/', '/contact/'];
  const projectPages = publicProjects().map((p) => `/work/${p.slug}/`);
  return [...pages, ...projectPages].map((path) => ({ url: new URL(path, site.url).toString() }));
}
