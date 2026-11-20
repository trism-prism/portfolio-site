import type { Education, Experience, SkillGroup } from './types';

// Background facts come from public/resume.pdf and public/cv.pdf. Formwork is described in the
// résumé's public wording only: no screenshots, client names or ticket content.

// DRAFT WORDING: `intro` and `interests` were drafted for the foundation from confirmed facts and
// need Tristan's own words before release (tracked in docs/rebuild.md, "Open").
export const intro = {
  headline: 'Software engineer working across full stack and AI engineering.',
  paragraphs: [
    'I build web applications, AI systems that can be measured, and the occasional piece of low-level systems code. I care about work that can be inspected: decisions written down, numbers that state their conditions, and limits said out loud.',
    'I study Computer Information Systems at James Madison University and work as a Software Engineering & AI Systems Intern at Formwork.',
  ],
};

/** Things I am drawn to, in my own words. Shown on the About page. */
export const interests: string[] = [
  'Geometry and graphics problems where exactness matters',
  'Evaluating AI systems honestly, failures included',
  'Interfaces that explain what they are doing',
  'Games and worlds with atmosphere, scale and a sense of history',
];

export const experience: Experience[] = [
  {
    role: 'Software Engineering & AI Systems Intern',
    org: 'Formwork',
    place: 'Remote',
    period: 'Sep 2026 – Present',
    points: [
      'Integrated a custom AI agent over MCP into a proprietary multi-tenant project management platform used by enterprise clients, writing tool definitions and REST connections and testing accuracy before launch.',
      'Executed a 500+ test-case QA pass and diagnosed a JWT auth-caching bug in the Next.js gateway where persisted tokens overwrote active sessions.',
      'Implemented search filtering across Next.js/React and Spring Boot/PostgreSQL modules, shipped to production in a multi-feature release.',
      'Work with a team of 7 engineers on the platform’s GitHub Actions CI/CD, which ships about 3 releases a week.',
    ],
  },
];

export const education: Education[] = [
  {
    school: 'James Madison University',
    credential: 'B.B.A. in Computer Information Systems',
    period: 'Expected Dec 2027',
  },
  {
    school: 'Northern Virginia Community College',
    credential: "Dean's List, Scholar Honoree",
    period: 'Aug 2023 – May 2024',
  },
];

export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['TypeScript/JavaScript', 'Python', 'C/C++', 'C#', 'Java', 'SQL', 'HTML/CSS'] },
  { label: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'ASP.NET Core', 'Spring Boot', 'FastAPI'] },
  { label: 'Data', items: ['PostgreSQL', 'pgvector', 'SQLite', 'IndexedDB', 'pandas', 'scikit-learn', 'statsmodels'] },
  {
    label: 'Tools',
    items: ['Git', 'GitHub Actions', 'Docker', 'REST', 'GraphQL', 'OAuth 2.0', 'JWT', 'MCP', 'Cloudflare Workers'],
  },
];
