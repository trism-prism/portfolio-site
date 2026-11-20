import type { MetadataRoute } from 'next';
import { personal } from '@/data/personal';

export const dynamic = 'force-static';

// Installable metadata only; there is no service worker or offline support.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: personal.name,
    short_name: 'Tristan',
    description: personal.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0a1113',
    theme_color: '#0a1113',
    icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
