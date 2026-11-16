export type Experience = {
  id: string;
  title: string;
  company: string;
  /** Optional public link for the company; leave out when there is none to cite. */
  url?: string;
  logo: string;
  location: string;
  dates: string;
  tech: string[];
  summary: string;
  bullets: string[];
};

// Formwork is described in the resume's public wording only: no client names, screenshots or ticket content.
export const experience: Experience[] = [
  {
    id: 'formwork',
    title: 'Software Engineering & AI Systems Intern',
    company: 'Formwork',
    logo: 'F',
    location: 'Remote',
    dates: 'Sep 2026 – Present',
    tech: ['Next.js', 'React', 'Spring Boot', 'PostgreSQL', 'GitHub Actions', 'MCP', 'REST', 'JWT', 'Liquibase'],
    summary:
      'Working across the front end, the back end, QA and the release pipeline of a proprietary multi-tenant project management platform used by enterprise clients.',
    bullets: [
      'Integrated a custom AI agent over MCP into the platform, writing tool definitions and REST connections and testing accuracy pre-launch for a general contracting client.',
      'Executed a 500+ test-case QA pass and authored 100+ Linear tickets, diagnosing a JWT auth-caching bug in the Next.js gateway where persisted tokens overwrote active sessions, unblocking a ~490-case Financials release test run.',
      'Implemented search filtering across Next.js/React and Spring Boot/PostgreSQL modules, shipped to production in a multi-feature release, and helped audit Liquibase migrations against source code through CI/CD linting.',
      "Collaborated with a team of 7 engineers on the platform's GitHub Actions CI/CD, which ships about 3 releases a week.",
    ],
  },
];
