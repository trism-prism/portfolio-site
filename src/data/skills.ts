import { ph } from './ph';

export type SkillCategory = {
  id: string;
  label: string;
  blurb: string;
  items: string[];
  wide?: boolean;
};

// Main categories mirror the CV's Technical Skills block.
export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    label: 'Languages',
    blurb: 'Day-to-day TypeScript and Python; C and C++ for systems work.',
    items: ['TypeScript', 'JavaScript', 'Python', 'C', 'C++', 'x86 Assembly', 'Bash', 'C#', 'Java', 'GDScript', 'HTML/CSS', 'SQL'],
    wide: true,
  },
  {
    id: 'frameworks',
    label: 'Frameworks',
    blurb: 'Web front ends and the APIs behind them.',
    items: ['React', 'Next.js', 'Node.js', 'ASP.NET Core', 'Spring Boot', 'FastAPI', 'Tailwind CSS', 'Vite'],
  },
  {
    id: 'data',
    label: 'Databases',
    blurb: 'Relational first, vectors when retrieval needs them.',
    items: ['PostgreSQL', 'pgvector', 'SQLite', 'IndexedDB', 'Dexie', 'Liquibase'],
  },
  {
    id: 'ml',
    label: 'Data & ML',
    blurb: 'Evaluation before modelling, uncertainty with every number.',
    items: ['pandas', 'NumPy', 'scikit-learn', 'XGBoost', 'statsmodels', 'Matplotlib', 'Streamlit', 'Jupyter'],
  },
  {
    id: 'ai',
    label: 'AI engineering',
    blurb: 'Agents and retrieval that can be measured.',
    items: ['Anthropic API', 'Tool calling', 'MCP', 'RAG', 'Eval harnesses', 'Prompt-injection hardening'],
  },
  {
    id: 'systems',
    label: 'Systems',
    blurb: 'Low-level work where exactness matters.',
    items: ['Linux', 'KVM', 'QEMU', 'GCC', 'Make', 'CMake', 'AddressSanitizer', 'Computational geometry'],
  },
  {
    id: 'platform',
    label: 'Platform & security',
    blurb: 'Shipping, auth and the boring parts that keep it up.',
    items: ['Git', 'GitHub Actions', 'Docker', 'Vercel', 'Cloudflare Workers', 'OAuth 2.0', 'JWT', 'AES-GCM', 'REST', 'GraphQL'],
    wide: true,
  },
  {
    id: 'tools',
    label: 'Tools',
    blurb: 'Where the work gets tracked and reported.',
    items: ['Linear', 'Jira', 'Power BI', 'pytest', 'xUnit', 'doctest', 'Vitest'],
  },
];

export const secondarySkills: { id: string; label: string; items: string[] }[] = [
  {
    id: 'fundamentals',
    label: 'CS fundamentals',
    items: ['Discrete structures', 'Computational geometry', 'Data structures', 'Concurrency & locking', 'Statistics', 'Enterprise architecture'],
  },
  {
    id: 'soft',
    label: 'Working style',
    items: [ph('Writes decisions down'), ph('QA mindset'), ph('Clear bug reports'), ph('Pairs well with designers')],
  },
  {
    id: 'interests',
    label: 'Areas of interest',
    items: ['Graphics & geometry', 'AI evaluation', 'Explanatory interfaces', 'Games & worlds'],
  },
];
