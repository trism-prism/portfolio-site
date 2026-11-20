import { projects } from './projects';
import { experience } from './experience';
import { ph } from './ph';

export type Stat = {
  value: string;
  label: string;
  note: string;
  motif: 'bars' | 'dots' | 'spark' | 'grid' | 'nodes' | 'rise' | 'ticks' | 'ring';
  placeholder?: boolean;
};

const live = projects.filter((p) => p.links.live).length;
const publicRepos = projects.filter((p) => p.links.repo).length;

// Derived from data where possible so these never drift from the records they summarise.
export const statGroups: { label: string; stats: Stat[] }[] = [
  {
    label: 'Highlights',
    stats: [
      { value: '127x', label: 'Grid speedup', note: 'Visibility engine, 4,000-wall mazes, vs brute force', motif: 'rise' },
      { value: '28/30', label: 'Held-out answers', note: 'Docs Q&A, frozen set, run once after code froze', motif: 'ticks' },
      { value: '0.964', label: 'Test recall', note: 'Heart disease, 61 patients, 95% CI 0.88–1.00', motif: 'ring' },
      { value: '27%', label: 'Brier skill', note: 'Closing spread vs naive baseline, 3,900 games', motif: 'spark' },
    ],
  },
  {
    label: 'Shipping',
    stats: [
      { value: String(projects.length), label: 'Projects here', note: 'Every one with its role and limits', motif: 'grid' },
      { value: String(live), label: 'Live deployments', note: 'Linked from their project cards', motif: 'dots' },
      { value: String(publicRepos), label: 'Public repos', note: 'Linked; private work is described only', motif: 'nodes' },
      { value: String(experience.filter((e) => !e.placeholder).length), label: 'Internship', note: 'Formwork, Sep 2026 – present', motif: 'bars' },
    ],
  },
  {
    label: 'Scale',
    stats: [
      { value: '1,600+', label: 'Titles imported', note: 'GengaRate, AniList GraphQL import', motif: 'grid' },
      { value: '1,074', label: 'Postings scored', note: 'Internship Scout, 3 weekly runs', motif: 'bars' },
      { value: '~800k', label: 'Events in window', note: 'Tripwire, GDELT, 60-day window', motif: 'spark' },
      { value: '500+', label: 'QA test cases', note: 'Formwork QA pass', motif: 'ticks' },
    ],
  },
];

export type CodingProfile = {
  id: string;
  platform: string;
  handle: string;
  href: string;
  figures: { label: string; value: string }[];
  breakdown?: { label: string; value: number; tone: 'green' | 'amber' | 'red' }[];
  placeholder?: boolean;
};

// No competitive-programming profiles exist yet. Both cards are invented placeholders.
export const codingProfiles: CodingProfile[] = [
  {
    id: 'leetcode',
    platform: 'LeetCode',
    handle: ph('your-handle'),
    href: ph('https://leetcode.com/u/your-handle/'),
    figures: [
      { label: 'Solved', value: ph('312') },
      { label: 'Contest rating', value: ph('1,684') },
      { label: 'Contests', value: ph('18') },
    ],
    breakdown: [
      { label: 'Easy', value: 140, tone: 'green' },
      { label: 'Medium', value: 148, tone: 'amber' },
      { label: 'Hard', value: 24, tone: 'red' },
    ],
    placeholder: true,
  },
  {
    id: 'codeforces',
    platform: 'Codeforces',
    handle: ph('your-handle'),
    href: ph('https://codeforces.com/profile/your-handle'),
    figures: [
      { label: 'Rating', value: ph('1,402') },
      { label: 'Max rank', value: ph('Specialist') },
      { label: 'Contests', value: ph('11') },
    ],
    placeholder: true,
  },
];

// The contribution calendar can fetch live data from a public API, but sending the GitHub username to a
// third party is off by default in this private build. Flip to true (or set NEXT_PUBLIC_LIVE_CONTRIBUTIONS=1)
// once the site is ready to publish; until then a seeded placeholder calendar is shown and labelled.
export const liveContributions = process.env.NEXT_PUBLIC_LIVE_CONTRIBUTIONS === '1';
