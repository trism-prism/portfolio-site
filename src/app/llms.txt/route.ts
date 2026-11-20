import { personal } from '@/data/personal';
import { projects } from '@/data/projects';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { feedText } from '@/data/ph';

export const dynamic = 'force-static';

export function GET() {
  const lines = [
    `# ${personal.name}`,
    '',
    `> ${personal.description}`,
    '',
    `- Location: ${personal.location}`,
    `- Email: ${personal.email}`,
    `- GitHub: ${personal.links.github}`,
    `- LinkedIn: ${personal.links.linkedin}`,
    `- Résumé: ${personal.siteUrl}${personal.links.resume}`,
    `- CV: ${personal.siteUrl}${personal.links.cv}`,
    '',
    '## Experience',
    ...experience.map((e) => `- ${feedText(e.role)}, ${e.org} (${feedText(e.period)}): ${feedText(e.summary)}`),
    '',
    '## Education',
    ...education.map((e) => `- ${e.school}: ${e.credential} (${feedText(e.period)})`),
    '',
    '## Projects',
    ...projects.map((p) => `- [${p.title}](${p.links.live ?? p.links.repo ?? `${personal.siteUrl}/?project=${p.slug}#projects`}) (${p.period}): ${p.summary}`),
    '',
    '## Machine-readable',
    `- ${personal.siteUrl}/data/projects.json`,
    `- ${personal.siteUrl}/rss.xml`,
    `- ${personal.siteUrl}${personal.links.vcard}`,
    '',
    'Items marked [PLACEHOLDER] are not facts yet.',
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
