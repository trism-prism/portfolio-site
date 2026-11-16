import { site } from '../site';

export type SocialKey = 'linkedin' | 'google' | 'github' | 'leetcode' | 'x';
export type Social = { key: SocialKey; label: string; url: string };

/** A piece of the intro sentence; `hl` pieces render as accent chips. */
export type IntroPart = { text: string; hl?: boolean };

export const profile = {
  name: 'Tristan Morton',
  firstLine: 'Tristan',
  lastLine: 'Morton',
  roles: ['Software Engineer', 'Full-Stack Developer', 'Systems Programmer', 'Software Engineering Intern'],
  intro: [
    { text: 'Driven by curiosity about how software really works, I build ' },
    { text: 'systems', hl: true },
    { text: ' from the kernel boundary up to the browser, from a virtual machine monitor in C to full-stack web apps, and I ' },
    { text: 'measure', hl: true },
    { text: ' what I ship.' },
  ] satisfies IntroPart[],
  /** Set to a { src, alt } to replace the initials card with a photo (put the file in public/). */
  photo: undefined as { src: string; alt: string } | undefined,
  initials: 'TM',
  location: `${site.location} (willing to relocate)`,
  email: site.email,
  resume: site.links.resume,
};

/**
 * Social slots. An empty url hides the icon everywhere (hero, contact, footer).
 * GitHub and LinkedIn come from src/site.ts. Fill the others here when you have the URL.
 */
export const socials: Social[] = [
  { key: 'linkedin', label: 'LinkedIn', url: site.links.linkedin },
  { key: 'google', label: 'Google Scholar', url: '' },
  { key: 'github', label: 'GitHub', url: site.links.github },
  { key: 'leetcode', label: 'LeetCode', url: '' },
  { key: 'x', label: 'X', url: '' },
];
