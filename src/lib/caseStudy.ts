import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';

// Case studies are trusted, repo-authored Markdown rendered once at build time.
// Raw HTML in the Markdown is escaped rather than passed through.
const marked = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },
  },
});

export const caseStudyDir = path.join(process.cwd(), 'content', 'case-studies');

export function caseStudyPath(name: string): string {
  return path.join(caseStudyDir, `${name}.md`);
}

/** Read and render a case study. Headings start at h2 in the source, under the page's h1. */
export function renderCaseStudy(name: string): string {
  const source = readFileSync(caseStudyPath(name), 'utf8');
  return marked.parse(source, { async: false });
}
