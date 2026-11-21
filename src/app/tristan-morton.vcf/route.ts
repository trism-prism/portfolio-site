import { personal } from '@/data/personal';
import { buildVCard } from '@/lib/vcard';

export const dynamic = 'force-static';

export function GET() {
  const card = buildVCard({
    name: personal.name,
    first: 'Tristan',
    last: 'Morton',
    email: personal.email,
    url: personal.siteUrl,
    title: 'Software engineer',
    note: 'Software engineer working across full stack and AI engineering.',
    links: [personal.links.github, personal.links.linkedin],
  });
  return new Response(card, { headers: { 'Content-Type': 'text/vcard; charset=utf-8' } });
}
