export type FocusKey = 'fullstack' | 'ai-eval' | 'data' | 'systems' | 'quality' | 'security' | 'networked';

export type FocusArea = {
  key: FocusKey;
  title: string;
  points: string[];
  evidence: string[]; // project slugs or '#experience'
  lead?: boolean;
};

// Each area points at the work that backs it. Art components are mapped by `key` in FocusArt.tsx;
// the data test checks every key has art.
export const focusAreas: FocusArea[] = [
  {
    key: 'fullstack',
    title: 'Full-stack product engineering',
    lead: true,
    points: [
      'React and Next.js front ends over typed APIs',
      'ASP.NET Core, Spring Boot and FastAPI services',
      'PostgreSQL schemas with real constraints and locks',
      'Offline-first PWAs with local databases',
      'Auth: OAuth, rotating refresh tokens, Web Locks',
      'Shipped and live: Kiln and GengaRate',
    ],
    evidence: ['kiln', 'gengarate', '#experience'],
  },
  {
    key: 'ai-eval',
    title: 'AI systems you can measure',
    points: [
      'Retrieval with page-level citations',
      'Frozen question sets and held-out splits',
      'Tool-calling agents over the Messages API',
      'MCP tool definitions over REST',
      'Abstain instead of guessing',
    ],
    evidence: ['docs-qa-copilot', 'internship-scout-agent', '#experience'],
  },
  {
    key: 'data',
    title: 'Data & statistics',
    points: [
      'ETL with integrity audits',
      'Leak checks and look-ahead guards',
      'Brier scores, bootstrap intervals, MAD baselines',
      'Every number with its conditions',
    ],
    evidence: ['cfb-upset-study', 'heart-disease-prediction', 'tripwire'],
  },
  {
    key: 'systems',
    title: 'Systems & graphics',
    points: [
      'Exact computational geometry in C++20',
      'KVM run loops and exit handling in C',
      'Benchmarks with A/B pairs and stated limits',
      'Sanitizers on every test run',
    ],
    evidence: ['2d-visibility-engine', 'minivmm'],
  },
  {
    key: 'quality',
    title: 'Quality engineering',
    points: [
      '500+ test-case QA passes',
      'Bug reports that name the cause',
      'Tests against real Postgres in CI',
      'Release gates in GitHub Actions',
    ],
    evidence: ['#experience', 'gengarate'],
  },
  {
    key: 'security',
    title: 'Security-minded by default',
    points: [
      'End-to-end encrypted sync (AES-GCM)',
      'PAKE device pairing with attempt limits',
      'Prompt-injection hardening for agents',
      'Breached-password checks and lockout',
    ],
    evidence: ['kiln', 'internship-scout-agent', 'gengarate'],
  },
  {
    key: 'networked',
    title: 'Networked & real-time',
    points: [
      'Ownership handoff protocols over UDP',
      'Fault-injecting relays: delay, jitter, loss',
      'Diff-based sync instead of full resyncs',
      'Bot-driven two-process tests',
    ],
    evidence: ['lucid-blocks-coop'],
  },
];
