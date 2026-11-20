import { news } from '@/data/news';
import { personal } from '@/data/personal';
import { feedText } from '@/data/ph';
import { fnv1a } from '@/lib/fnv';

export const dynamic = 'force-static';

const x = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const items = [...news]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 40)
    .map(
      (n) => `    <item>
      <title>${x(feedText(n.title))}</title>
      <link>${x(n.href ?? `${personal.siteUrl}/#news`)}</link>
      <guid isPermaLink="false">tm-${fnv1a(n.id + n.date, 8)}</guid>
      <pubDate>${new Date(n.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <description>${x(feedText(n.detail))}</description>
    </item>`,
    )
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${x(personal.name)} · Activity</title>
    <link>${personal.siteUrl}/</link>
    <description>Launches, releases and updates from ${x(personal.name)}.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
