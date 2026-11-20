// Site-wide identity and links. The production URL is defined here and nowhere else:
// metadata, sitemap and robots read it. Do not replace it with a preview URL.
export const site = {
  name: 'Tristan Morton',
  description:
    'Tristan Morton is a software engineer working across full stack and AI engineering. Projects, background and contact.',
  url: 'https://portfolio-site-trism2.vercel.app',
  email: 'tristanjmorton@gmail.com',
  location: 'Leesburg, VA',
  links: {
    github: 'https://github.com/trism-prism',
    linkedin: 'https://www.linkedin.com/in/tristan-morton',
    resume: '/resume.pdf',
    cv: '/cv.pdf',
  },
} as const;

export const nav = [
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
] as const;
