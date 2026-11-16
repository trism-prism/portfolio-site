import type { MetadataRoute } from 'next';
import { site } from '../site';

export const dynamic = 'force-static';

// v3 is one page, so the sitemap is one line.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${site.url}/` }];
}
