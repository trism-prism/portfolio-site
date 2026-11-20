import { ph } from './ph';

export type ProjectKind = 'software' | 'ai' | 'data' | 'systems';
export type CoverKey =
  | 'visibility'
  | 'docsqa'
  | 'kiln'
  | 'gengarate'
  | 'cfb'
  | 'scout'
  | 'heart'
  | 'tripwire'
  | 'minivmm'
  | 'lucid'
  | 'portfolio';
export type DemoKey = 'visibility' | 'docsqa' | 'heart';

export type Project = {
  id: number;
  slug: string;
  title: string;
  kind: ProjectKind;
  featured: boolean;
  spotlight?: boolean;
  status: 'live' | 'complete' | 'in-progress';
  badge?: string;
  date: string; // ISO month
  period: string;
  summary: string;
  role: string;
  tech: string[];
  highlights: string[];
  glance?: { problem: string; built: string; decisions: string; outcome: string };
  links: { repo?: string; live?: string; extra?: { label: string; href: string }[] };
  media?: { src: string; alt: string; width: number; height: number; caption?: string }[];
  cover: CoverKey;
  demo?: DemoKey;
  collaborators?: string[];
};

// Every fact comes from the public repo, the résumé or the CV. Numbers carry their conditions.
export const projects: Project[] = [
  {
    id: 1,
    slug: '2d-visibility-engine',
    title: '2D Visibility & Lighting Engine',
    kind: 'systems',
    featured: true,
    spotlight: true,
    status: 'complete',
    badge: 'Bit-identical to brute force',
    date: '2026-11',
    period: 'Nov 2026',
    summary:
      'A C++20 engine that computes exactly which area one point light can see among line-segment walls, the calculation behind sharp 2D shadows, with an interactive demo app and a benchmark harness.',
    role: 'Solo project: geometry, both query methods, the demo app, tests and the benchmark harness.',
    tech: ['C++20', 'CMake', 'GLFW', 'Dear ImGui', 'doctest'],
    highlights: [
      'A uniform-grid ray walk (Amanatides-Woo) replaces testing every wall for every ray: 1.5x faster on 250-wall clustered scenes and up to 127x on 4,000-wall mazes, with output bit-identical to brute force at every benchmarked position.',
      'One ray per wall end and wall crossing, with one-sided hit limits, replaced epsilon-offset rays that leaked light through shared corners.',
      'Fixed a shadow bug where an angle sort merged two collinear targets and rounded side tests dropped a wall corner (lit area 0.765 → 0.465 in a unit square) by routing every side-of-line decision through one exact orientation predicate.',
      'Analyzed 66 benchmark rows across four wall layouts, three seeds and 16 to 4,000 walls, and documented where and why the grid degrades.',
    ],
    glance: {
      problem: 'Sharp 2D shadows need the exact region a light can see. Testing every wall for every ray gets slow, and floating-point shortcuts leak light through corners.',
      built: 'A C++20 library with brute-force and grid queries, an ImGui demo app, 60 test cases and a benchmark harness.',
      decisions: 'One exact orientation predicate for every side test; rays only at wall ends and crossings with one-sided hit limits; a uniform grid walked with Amanatides-Woo.',
      outcome: '1.5x to 127x faster depending on layout, with output bit-identical to brute force at every benchmarked position.',
    },
    links: {
      repo: 'https://github.com/trism-prism/2d-visibility-engine',
      extra: [
        { label: 'Design decisions', href: 'https://github.com/trism-prism/2d-visibility-engine/blob/main/docs/DECISIONS.md' },
        { label: 'Benchmark', href: 'https://github.com/trism-prism/2d-visibility-engine/blob/main/docs/BENCHMARK.md' },
      ],
    },
    media: [
      { src: '/work/visibility-engine/baseline-1280.webp', alt: 'The demo app with one light among orange walls; the side panel reports 4,602 wall checks for the all-walls method.', width: 1280, height: 800, caption: 'All walls: every ray tests every wall.' },
      { src: '/work/visibility-engine/grid-1280.webp', alt: 'The same scene with a grid overlay; the panel reports 1,009 wall checks for the grid method.', width: 1280, height: 800, caption: 'Grid: the same picture from fewer wall tests.' },
    ],
    cover: 'visibility',
    demo: 'visibility',
  },
  {
    id: 2,
    slug: 'docs-qa-copilot',
    title: 'Docs Q&A Copilot',
    kind: 'ai',
    featured: true,
    status: 'live',
    badge: '28 of 30 held-out',
    date: '2026-06',
    period: 'Jun 2026',
    summary:
      'Ask questions about two public benefits PDFs (296 pages) and get streamed answers with page-level citations. An evaluation page scores the answers and shows every failure.',
    role: 'Solo project: retrieval pipeline, evaluation harness, web app and deployment.',
    tech: ['TypeScript', 'Next.js', 'PostgreSQL', 'pgvector', 'Anthropic API', 'Vercel'],
    highlights: [
      'On a frozen 50-question set, 46 of 50 answers were correct and 40 of 42 citations were correct; 28 of the 30 held-out questions, run once after the code froze. One question moves a split by 3 to 5 points.',
      'All 8 unanswerable questions got an explicit "not found" with no citations.',
      'Error analysis found a PDF extraction bug that split words apart; setting the spacing threshold from measured gaps raised development accuracy from 16 to 18 of 20.',
      'Bring-your-own-key flow, per-IP rate limits and 24-hour expiring uploads, so the public demo carries no model spend.',
    ],
    glance: {
      problem: 'Benefits handbooks are long, and a chat answer without a page number cannot be checked.',
      built: 'A retrieval-augmented app on Next.js and pgvector that streams answers with page-level citations, plus a public evaluation page.',
      decisions: 'Freeze the question set before tuning; hold 30 questions out; publish every failure; abstain instead of guessing.',
      outcome: '46/50 correct, 40/42 citations correct, 8/8 unanswerable questions abstained.',
    },
    links: {
      repo: 'https://github.com/trism-prism/docs-qa-copilot',
      live: 'https://docs-qa-copilot.vercel.app',
      extra: [{ label: 'Evaluation page', href: 'https://docs-qa-copilot.vercel.app/eval' }],
    },
    media: [
      { src: '/work/docs-qa/answer-960.webp', alt: 'An answer about Medicare hospital costs with numbered citation markers matching a sources column quoting page 30.', width: 960, height: 600 },
      { src: '/work/docs-qa/eval-1280.webp', alt: 'The evaluation page: 93.3% answer accuracy on 30 held-out questions and 92.0% on all 50.', width: 1280, height: 800, caption: 'The evaluation page publishes every measure and failure.' },
    ],
    cover: 'docsqa',
    demo: 'docsqa',
  },
  {
    id: 3,
    slug: 'kiln',
    title: 'Kiln',
    kind: 'software',
    featured: true,
    status: 'live',
    badge: 'Live at kilnstudy.com',
    date: '2026-09',
    period: 'Sep 2026',
    summary:
      'An installable, offline-first study planner that turns a syllabus, spreadsheet or LMS calendar into a daily to-do list with reminders, with end-to-end encrypted sync.',
    role: 'Solo project: the app, the scheduling engine, encrypted sync and the small Worker behind it.',
    tech: ['React', 'TypeScript', 'Vite', 'Dexie', 'Cloudflare Workers', 'PWA'],
    highlights: [
      'A deterministic scheduler places tasks day by day within per-weekday time budgets and dependencies, binary-searching how many lower-priority tasks to defer, optional first, so a plan meets its deadline.',
      'End-to-end encrypted, account-free sync on Cloudflare Workers with per-record AES-GCM and last-write-wins merge, so the server stores only ciphertext, behind an origin allowlist, size caps and per-IP rate limits.',
      'Six-digit device pairing over a CPace password-authenticated key exchange on ristretto255, with a relay that retires a code after 3 wrong attempts.',
    ],
    glance: {
      problem: 'Syllabi list deadlines, not what to do today, and study tools usually want an account and a connection.',
      built: 'A PWA with a local Dexie database, a deterministic scheduler, encrypted sync on a Cloudflare Worker and device pairing.',
      decisions: 'Deterministic scheduling over heuristics; the server sees only ciphertext; a low-entropy pairing code protected by a PAKE.',
      outcome: 'Live at kilnstudy.com and usable fully offline.',
    },
    links: { repo: 'https://github.com/trism-prism/kiln', live: 'https://kilnstudy.com' },
    media: [
      { src: '/work/kiln/todo-dark-1280.webp', alt: "Kiln's daily to-do list in dark mode.", width: 1280, height: 640 },
      { src: '/work/kiln/dashboard-dark-1280.webp', alt: "Kiln's dashboard in dark mode.", width: 1280, height: 640 },
    ],
    cover: 'kiln',
  },
  {
    id: 4,
    slug: 'gengarate',
    title: 'GengaRate',
    kind: 'software',
    featured: true,
    status: 'live',
    badge: '1,600+ titles imported',
    date: '2026-08',
    period: 'Aug 2026',
    summary:
      'A live site for rating anime and manga, with more than 1,600 titles imported from AniList, accounts and friends.',
    role: 'Solo project: React front end, ASP.NET Core API, PostgreSQL schema and hosting.',
    tech: ['React', 'ASP.NET Core', 'PostgreSQL', 'GraphQL', 'GitHub Actions'],
    highlights: [
      'Auth with ASP.NET Core Identity, JWT and Google OAuth, with rotating hashed refresh tokens that end the session on reuse, email verification, lockout and breached-password checks through the Have I Been Pwned range API.',
      'Token refresh serialized across browser tabs with Web Locks, so concurrent tabs do not trip the reuse check and sign the user out.',
      'AniList GraphQL import with Retry-After backoff, upserts and a Postgres advisory lock so only one import runs at a time.',
      'Backend tests run on every pull request against a real PostgreSQL service, including the partial indexes, constraints and locks an in-memory database cannot check.',
    ],
    links: { repo: 'https://github.com/trism-prism/anime-rating-platform', live: 'https://www.gengarate.com' },
    media: [{ src: '/work/gengarate/title-1280.webp', alt: 'A GengaRate title page with its rating and series information.', width: 1280, height: 640 }],
    cover: 'gengarate',
  },
  {
    id: 5,
    slug: 'cfb-upset-study',
    title: 'Predicting College Football Upsets',
    kind: 'data',
    featured: false,
    status: 'complete',
    date: '2026-11',
    period: 'Nov 2026',
    summary:
      "An independent statistical study of 3,900 NCAA FBS games asking whether outcomes are predictable beyond the betting market's closing spread.",
    role: 'Solo study: data pipeline, modelling and write-up.',
    tech: ['Python', 'pandas', 'statsmodels', 'scikit-learn'],
    highlights: [
      'The spread-based forecast beats a naive baseline (Brier score 0.177 against 0.244, a 27% Brier skill score); five added features gave no out-of-sample gain.',
      'An integrity audit of the ETL pipeline caught a filter bug that leaked FBS-vs-FCS games into 13.1% of records and inflated the skill score from 27% to 32%.',
      'Prior-season team ratings as pregame inputs prevent a look-ahead leak; a controlled rerun with the leak showed a false 38% skill score.',
    ],
    links: {},
    cover: 'cfb',
  },
  {
    id: 6,
    slug: 'internship-scout-agent',
    title: 'Internship Scout Agent',
    kind: 'ai',
    featured: false,
    status: 'live',
    date: '2026-05',
    period: 'May 2026',
    summary:
      'A weekly agent that scores new internship postings against a résumé using Claude with tool calling, explains every match, and emails a ranked digest.',
    role: 'Solo project: agent loop, data pipeline, scheduling and deployment.',
    tech: ['Python', 'FastAPI', 'PostgreSQL', 'Anthropic API', 'GitHub Actions', 'Vercel'],
    highlights: [
      'Scored 1,074 postings across 3 runs.',
      'A tool-calling loop on the Anthropic Messages API: the model fetches a full posting only when needed and records a 0-100 score with reasons, isolating failures per batch.',
      'Hardened against untrusted posting text: postings are named only by database ID, fetches accept only public https hosts with per-redirect checks and size and time limits, and output is HTML-escaped.',
    ],
    links: { repo: 'https://github.com/trism-prism/internship-scout-agent', live: 'https://internship-scout-agent.vercel.app' },
    cover: 'scout',
  },
  {
    id: 7,
    slug: 'heart-disease-prediction',
    title: 'Heart Disease Prediction',
    kind: 'data',
    featured: false,
    status: 'live',
    date: '2026-01',
    period: 'Dec 2025 – Jan 2026',
    summary:
      'A recall-first classifier on the UCI Cleveland heart disease data, served in a web form, with an external check on other hospitals. An educational demo, not a diagnostic tool.',
    role: 'Solo project: modelling, evaluation, the app and run tracking in PostgreSQL.',
    tech: ['Python', 'scikit-learn', 'XGBoost', 'Flask', 'React', 'PostgreSQL'],
    highlights: [
      'Logistic regression beat random forest and XGBoost over 5x5 repeated cross-validation on precision at recall ≥ 0.90 (0.705 ± 0.023 vs 0.653 and 0.655), so the simpler model ships.',
      'On a 61-patient test set it missed 1 of 28 sick patients (recall 0.964, 95% CI 0.88–1.00); on 617 rows from other UCI sites the frozen model’s recall fell to 0.70, reported as a limit.',
      'Found that a popular Kaggle copy of the data has an inverted target and repeated patients; a test fails if the label direction flips.',
    ],
    glance: {
      problem: 'In screening, a missed sick patient costs far more than a false alarm, and small test sets overstate certainty.',
      built: 'A reproducible pipeline from PostgreSQL ingestion to a frozen scikit-learn model served through React and Flask.',
      decisions: 'Pick the threshold out of fold; set the model-selection rule before looking; use the UCI file, not the leaky Kaggle copy.',
      outcome: 'Recall 0.964 on Cleveland; 0.70 pooled on other hospitals, published as the limit.',
    },
    links: { repo: 'https://github.com/trism-prism/heart-disease-prediction', live: 'https://heart-disease-prediction-alpha.vercel.app' },
    cover: 'heart',
    demo: 'heart',
  },
  {
    id: 8,
    slug: 'tripwire',
    title: 'Tripwire',
    kind: 'data',
    featured: false,
    status: 'complete',
    date: '2026-02',
    period: 'Feb 2026',
    summary:
      'An open-source situational-awareness dashboard that loads the GDELT news-event feed every 15 minutes, flags unusual per-country spikes and shows them on a map.',
    role: 'Solo project: ingestion worker, spike scoring, dashboard and alert audit.',
    tech: ['Python', 'PostgreSQL', 'Streamlit', 'Docker', 'GDELT'],
    highlights: [
      'About 800,000 events in a 60-day window, with duplicate-safe upserts, checksums and a per-file error log so one bad file never halts the pipeline.',
      'Spike alerts score each country’s daily count against its own 28-day baseline with median and MAD; counting distinct articles instead of repeated rows cut alerts 41%.',
      'Hand-audited 50 alerts against their source articles: 61% of the 49 that could be judged were real. Rejected 3 tuning ideas, 2 of which passed on development data but failed on an untouched final set.',
    ],
    links: { repo: 'https://github.com/trism-prism/tripwire-awareness-dashboard' },
    cover: 'tripwire',
  },
  {
    id: 9,
    slug: 'minivmm',
    title: 'minivmm',
    kind: 'systems',
    featured: false,
    status: 'complete',
    date: '2026-11',
    period: 'Nov 2026',
    summary:
      'A minimal virtual machine monitor in C on Linux KVM that boots 16-bit guest programs and services their port I/O, MMIO, halt and shutdown exits.',
    role: 'Solo project.',
    tech: ['C', 'KVM', 'x86 Assembly', 'QEMU', 'Make'],
    highlights: [
      'Output verified against QEMU/KVM on four guests with 16 tests that also pass under AddressSanitizer and UBSan.',
      'Guest RAM split into two KVM slots around the VGA hole, so stray accesses exit as MMIO and reach a device handler.',
      'Measured a VM exit at about 5.3 µs under nested KVM against 0.1 µs for a syscall; 21 alternating A/B pairs showed an ioeventfd cut port-write time a median 21%.',
    ],
    links: { repo: 'https://github.com/trism-prism/minivmm' },
    cover: 'minivmm',
  },
  {
    id: 10,
    slug: 'lucid-blocks-coop',
    title: 'Lucid Blocks Co-op Mod',
    kind: 'software',
    featured: false,
    status: 'complete',
    badge: 'Open-source fork',
    date: '2026-11',
    period: 'Nov 2026',
    summary:
      'An update to a dormant open-source co-op multiplayer mod for a Steam game, in GDScript in a public fork, restoring 5.2 build compatibility and adding 7 modules.',
    role: 'Contributor to a public fork.',
    tech: ['GDScript', 'Godot', 'UDP'],
    highlights: [
      'A five-message ownership handoff with write-behind commits and stale-epoch rejection reached a 95th-percentile switch latency under 600 ms on a simulated link with 60 ms latency and 1% loss.',
      'Traced pickup timeouts and guest reconnects at 150 ms latency to a 13,125-cell (~840 KB) resync on every block break, and replaced it with a diff-based rescan that eliminated the reconnects.',
      'A UDP relay injecting seeded delay, jitter, loss, reordering and cuts, plus bot-driven two-process tests that exposed two compatibility defects.',
    ],
    links: { repo: 'https://github.com/trism-prism/lucid-blocks-coop-updated' },
    cover: 'lucid',
  },
  {
    id: 11,
    slug: 'portfolio',
    title: 'This portfolio',
    kind: 'software',
    featured: false,
    status: 'in-progress',
    date: '2026-11',
    period: 'Nov 2026',
    summary:
      'A statically exported Next.js site with hand-written SVG scene animations, a shared frame clock, a command palette, glossary tooltips and machine-readable feeds.',
    role: 'Solo project.',
    tech: ['TypeScript', 'Next.js', 'React', 'Tailwind CSS', 'SVG', 'Lenis'],
    highlights: [
      'Every project cover is a small code-drawn animation of the project’s own mechanism, paused offscreen and frozen to an informative frame in Reduced motion.',
      'One shared clock drives all scenes, capped at 60 Hz and stopped while the tab is hidden.',
      'Placeholders are marked in data and in the page, and the production build fails while any remain.',
    ],
    links: { repo: 'https://github.com/trism-prism/portfolio-site' },
    cover: 'portfolio',
  },
];

export const kindLabels: Record<ProjectKind, string> = {
  software: 'Software',
  ai: 'AI',
  data: 'Data',
  systems: 'Systems',
};

/** Open-source contributions shown under the grid. Only the fork is real so far. */
export const contributions = [
  {
    repo: 'lucid-blocks-coop-updated',
    title: 'Restore 5.2 build compatibility and add 7 modules',
    state: 'fork' as const,
    href: 'https://github.com/trism-prism/lucid-blocks-coop-updated',
    placeholder: false,
  },
  {
    repo: ph('owner/repo'),
    title: ph('Fix a docs typo in a library you used'),
    state: 'merged' as const,
    href: ph('https://github.com/owner/repo/pull/1'),
    placeholder: true,
  },
  {
    repo: ph('owner/another-repo'),
    title: ph('Add a missing test for an edge case'),
    state: 'open' as const,
    href: ph('https://github.com/owner/another-repo/pull/2'),
    placeholder: true,
  },
];
