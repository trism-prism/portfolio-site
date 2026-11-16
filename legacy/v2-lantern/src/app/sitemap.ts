import type { MetadataRoute } from 'next';
import { projects } from '../content/projects';
import { site } from '../site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/` },
    ...projects.map((p) => ({ url: `${site.url}/work/${p.slug}/` })),
  ];
}
