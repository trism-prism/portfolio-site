// Content records describe the work, not how it is displayed. No CSS classes, layout
// positions or component names belong here: the same record feeds a card, a row or a page.

export type Media = {
  /** Path under public/, starting with '/'. */
  src: string;
  alt: string;
  /** Intrinsic pixel size. The content test checks these against the file. */
  width: number;
  height: number;
  caption?: string;
};

export type ProjectLinks = {
  /** Public repositories only. */
  repo?: string;
  live?: string;
  /** Any further public reading: a report, a video, a docs page. */
  extra?: { label: string; href: string }[];
};

/**
 * - `featured`: listed everywhere and offered on the home page.
 * - `listed`: in the work collection, not on the home page.
 * - `hidden`: kept as data, never rendered or put in the sitemap. Change this one field to publish it.
 */
export type ProjectVisibility = 'featured' | 'listed' | 'hidden';

export type Project = {
  /** Stable internal id. Never shown, never reused. */
  id: string;
  /** Public URL segment: /work/<slug>/. Changing it breaks shared links, so add a redirect if you do. */
  slug: string;
  title: string;
  /** One or two sentences: what it is and what it does. */
  summary: string;
  /** What Tristan personally did on it. */
  role: string;
  /** Free text, e.g. 'Nov 2026'. */
  period: string;
  /** Broad area, used for grouping and wording only. */
  kind: 'software' | 'ai' | 'data' | 'systems';
  tech: string[];
  /** Short, verifiable points. Each number carries its conditions. */
  highlights: string[];
  links: ProjectLinks;
  media: Media[];
  visibility: ProjectVisibility;
  /** Sort order within the collection; lower comes first. */
  order: number;
  /**
   * File name in content/case-studies/ (without .md). Optional: a project with no case study
   * still gets its own page from the fields above.
   */
  caseStudy?: string;
};

export type Experience = {
  role: string;
  org: string;
  place: string;
  period: string;
  points: string[];
};

export type Education = {
  school: string;
  credential: string;
  period: string;
  notes?: string;
};

export type SkillGroup = { label: string; items: string[] };
