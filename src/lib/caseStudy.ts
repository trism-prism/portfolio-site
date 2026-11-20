import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Marked, type Tokens } from 'marked';

// Case studies are trusted, repo-authored Markdown rendered once at build time.
// Raw HTML in the Markdown is escaped rather than passed through.

export type CaseStudyHeading = { id: string; text: string };
export type RenderedCaseStudy = { html: string; headings: CaseStudyHeading[] };

export const caseStudyDir = path.join(process.cwd(), 'content', 'case-studies');

export function caseStudyPath(name: string): string {
  return path.join(caseStudyDir, `${name}.md`);
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Render a case study and list its h2 sections for an in-page contents list.
 * Headings start at h2 in the source, under the page's h1. Ids are prefixed to avoid clashes.
 */
export function renderCaseStudy(name: string): RenderedCaseStudy {
  const source = readFileSync(caseStudyPath(name), 'utf8');
  const headings: CaseStudyHeading[] = [];
  const marked = new Marked({
    gfm: true,
    renderer: {
      html({ text }) {
        return escape(text);
      },
      heading(token: Tokens.Heading) {
        const inner = this.parser.parseInline(token.tokens);
        const id = `cs-${slugify(token.text)}`;
        if (token.depth === 2) headings.push({ id, text: token.text });
        return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
      },
    },
  });
  const html = marked.parse(source, { async: false });
  return { html, headings };
}
