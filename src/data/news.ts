import { ph } from './ph';

export type NewsType = 'launch' | 'release' | 'work' | 'education' | 'award' | 'open-source' | 'study';

export type NewsItem = {
  id: string;
  date: string; // ISO date; day precision only where known, otherwise the 1st
  type: NewsType;
  title: string;
  detail: string;
  href?: string;
  placeholder?: boolean;
};

export const newsTypeLabels: Record<NewsType, string> = {
  launch: 'Launch',
  release: 'Release',
  work: 'Work',
  education: 'Education',
  award: 'Award',
  'open-source': 'Open source',
  study: 'Study',
};

// Dates are month-precise (the CV gives months), so items show month and year only.
export const news: NewsItem[] = [
  { id: 'visibility', date: '2026-11-01', type: 'release', title: '2D Visibility & Lighting Engine', detail: 'Grid ray walk up to 127x faster on 4,000-wall mazes, bit-identical to brute force.', href: 'https://github.com/trism-prism/2d-visibility-engine' },
  { id: 'minivmm', date: '2026-11-01', type: 'release', title: 'minivmm boots 16-bit guests', detail: 'KVM run loop in C, verified against QEMU on four guests.', href: 'https://github.com/trism-prism/minivmm' },
  { id: 'lucid', date: '2026-11-01', type: 'open-source', title: 'Lucid Blocks co-op mod revived', detail: 'Public fork restored to 5.2 build compatibility with 7 new modules.', href: 'https://github.com/trism-prism/lucid-blocks-coop-updated' },
  { id: 'cfb', date: '2026-11-01', type: 'study', title: 'College football upset study', detail: '3,900 FBS games; the closing spread is hard to beat (Brier skill 27%).' },
  { id: 'kiln', date: '2026-09-01', type: 'launch', title: 'Kiln launched', detail: 'Offline-first study planner with encrypted sync.', href: 'https://kilnstudy.com' },
  { id: 'formwork', date: '2026-09-01', type: 'work', title: 'Joined Formwork', detail: 'Software Engineering & AI Systems Intern.' },
  { id: 'gengarate', date: '2026-08-01', type: 'launch', title: 'GengaRate launched', detail: 'Anime and manga ratings with 1,600+ imported titles.', href: 'https://www.gengarate.com' },
  { id: 'docsqa', date: '2026-06-01', type: 'launch', title: 'Docs Q&A Copilot live', detail: '28 of 30 held-out questions correct, with a public evaluation page.', href: 'https://docs-qa-copilot.vercel.app' },
  { id: 'scout', date: '2026-05-01', type: 'launch', title: 'Internship Scout Agent', detail: '1,074 postings scored across 3 weekly runs.', href: 'https://internship-scout-agent.vercel.app' },
  { id: 'tripwire', date: '2026-02-01', type: 'release', title: 'Tripwire dashboard', detail: 'GDELT spike alerts, hand-audited against 50 source articles.', href: 'https://github.com/trism-prism/tripwire-awareness-dashboard' },
  { id: 'heart', date: '2026-01-01', type: 'release', title: 'Heart Disease Prediction', detail: 'Recall-first model, with its out-of-site drop reported.', href: 'https://heart-disease-prediction-alpha.vercel.app' },
  { id: 'jmu', date: '2024-08-01', type: 'education', title: ph('Started at James Madison University'), detail: 'B.B.A. in Computer Information Systems, Business Analytics minor.', placeholder: true },
  { id: 'nova', date: '2024-05-01', type: 'award', title: "Dean's List and Scholar Honoree", detail: 'Northern Virginia Community College.' },
  { id: 'hack', date: '2026-03-01', type: 'award', title: ph('HackMadison 2026: 2nd place'), detail: ph('Best Use of Data track.'), placeholder: true },
];
