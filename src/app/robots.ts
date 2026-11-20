import type { MetadataRoute } from 'next';
import { personal } from '@/data/personal';
import { hasPlaceholders } from '@/data/audit';

export const dynamic = 'force-static';

// While placeholders remain this build is private: disallow everything.
export default function robots(): MetadataRoute.Robots {
  return hasPlaceholders
    ? { rules: { userAgent: '*', disallow: '/' } }
    : { rules: { userAgent: '*', allow: '/' }, sitemap: `${personal.siteUrl}/sitemap.xml` };
}
