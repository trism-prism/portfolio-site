import { ph } from './ph';

export type Experience = {
  id: string;
  role: string;
  org: string;
  place: string;
  period: string;
  start: string; // ISO month, used for sorting and the news feed
  kind: 'primary' | 'secondary';
  summary: string;
  points: string[];
  stack: string[];
  scene?: 'formwork';
  placeholder?: boolean;
};

// Formwork wording follows the résumé's public bullets only: no client names, screenshots or ticket content.
export const experience: Experience[] = [
  {
    id: 'formwork',
    role: 'Software Engineering & AI Systems Intern',
    org: 'Formwork',
    place: 'Remote',
    period: 'Sep 2026 – Present',
    start: '2026-09',
    kind: 'primary',
    summary:
      'AI integration, QA and full-stack features on a pre-release multi-tenant construction project-management platform that ships about three releases a week.',
    points: [
      'Integrated a custom AI agent over MCP into a proprietary multi-tenant project management platform used actively by enterprise clients, writing its tool definitions and REST API connections and running accuracy checks before launching it live to a general contracting client.',
      'Executed a 500+ test-case QA pass and authored 100+ Linear tickets, diagnosing a JWT auth-caching bug in the Next.js gateway where persisted tokens overwrote active sessions, unblocking a ~490-case Financials release test run within it.',
      'Implemented a search filtering feature across Next.js/React and Spring Boot/PostgreSQL modules, shipped to production in a multi-feature release, and helped audit Liquibase migration flows against source code through CI/CD linting.',
      "Collaborated with a team of 7 engineers on the platform's GitHub Actions CI/CD, which ships about 3 releases a week.",
    ],
    stack: ['TypeScript', 'Next.js', 'React', 'Spring Boot', 'PostgreSQL', 'MCP', 'GitHub Actions', 'Linear'],
    scene: 'formwork',
  },
  {
    id: 'jmu-rec',
    role: ph('Student Staff'),
    org: 'JMU Recreation',
    place: 'Harrisonburg, VA',
    period: ph('2025 – Present'),
    start: '2025-01',
    kind: 'secondary',
    summary: ph('Front-desk and facility operations for the university recreation center.'),
    points: [],
    stack: [],
    placeholder: true,
  },
];
