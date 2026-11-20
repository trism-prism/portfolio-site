import type { Project } from './types';

// Every fact here comes from the public repo's README/docs, the SWE résumé or the CV
// (public/resume.pdf, public/cv.pdf). Numbers carry their conditions. Link only public repos.
// To feature, unlist or hide a project, change `visibility`. To reorder, change `order`.
export const projects: Project[] = [
  {
    id: 'visibility-engine',
    slug: 'visibility-engine',
    title: '2D Visibility & Lighting Engine',
    summary:
      'A C++20 engine that computes exactly which area one point light can see among line-segment walls, the calculation behind sharp 2D shadows, with an interactive demo app.',
    significance:
      'Exact geometry instead of epsilon tricks, two methods shown to give bit-identical output, and a benchmark that also documents where the faster method stops helping.',
    role: 'Solo project: geometry, both query methods, the demo app, tests and the benchmark harness.',
    period: 'Nov 2026',
    kind: 'systems',
    tech: ['C++20', 'CMake', 'GLFW', 'Dear ImGui', 'doctest'],
    highlights: [
      'A uniform-grid ray walk (Amanatides-Woo) replaces testing every wall for every ray. On the committed benchmark it is 1.5x faster on 250-wall clustered scenes and up to 127x on 4,000-wall mazes, with output bit-identical to brute force at every benchmarked position.',
      'One ray per wall end and wall crossing, with one-sided hit limits, replaced epsilon-offset rays that leaked light through shared corners.',
      'Fixed a shadow bug where an angle sort merged two collinear targets, by routing every side-of-line decision through one exact orientation predicate.',
    ],
    links: {
      repo: 'https://github.com/trism-prism/2d-visibility-engine',
      extra: [
        { label: 'Design decisions', href: 'https://github.com/trism-prism/2d-visibility-engine/blob/main/docs/DECISIONS.md' },
        { label: 'Benchmark', href: 'https://github.com/trism-prism/2d-visibility-engine/blob/main/docs/BENCHMARK.md' },
      ],
    },
    media: [
      {
        src: '/work/visibility-engine/baseline-1280.webp',
        alt: 'The demo app with one light among orange walls. The lit area fans out in warm tones with hard shadows behind each wall, and the side panel reports 4,602 wall checks for the all-walls method.',
        width: 1280,
        height: 800,
        caption: 'All walls: every ray tests every wall. Earlier build of the demo app.',
      },
      {
        src: '/work/visibility-engine/grid-1280.webp',
        alt: 'The same scene with a grid overlay. Only the walls in the squares the followed ray crosses are highlighted, and the panel reports 1,009 wall checks for the grid method.',
        width: 1280,
        height: 800,
        caption: 'Grid: the same picture from fewer wall tests.',
      },
    ],
    preview: {
      src: '/work/visibility-engine/room-888.webp',
      alt: 'One light among line-segment walls in the demo app: the lit area fans out in warm tones, with a hard-edged shadow behind every wall.',
      width: 888,
      height: 552,
    },
    visibility: 'featured',
    order: 10,
    caseStudy: 'visibility-engine',
  },
  {
    id: 'docs-qa',
    slug: 'docs-qa-copilot',
    title: 'Docs Q&A Copilot',
    summary:
      'Ask questions about two public benefits PDFs (296 pages) and get answers with page-level citations. An evaluation page scores the answers and shows every failure.',
    significance:
      'It publishes its own error rate: a frozen 50-question evaluation, held-out questions run once, and the limits of its own scorer.',
    role: 'Solo project: retrieval pipeline, evaluation harness, web app and deployment.',
    period: 'Jun 2026',
    kind: 'ai',
    tech: ['TypeScript', 'Next.js', 'PostgreSQL', 'pgvector', 'Anthropic API', 'Vercel'],
    highlights: [
      'On a frozen 50-question set, 46 of 50 answers were correct, and 28 of the 30 held-out questions that were never used for tuning. The set is small: one question moves a split by 3 to 5 points.',
      'All 8 unanswerable questions got an explicit "not found" with no citations.',
      'Error analysis found a PDF extraction bug that split words apart. Fixing it was the largest single gain on the development set.',
      'Visitors use their own API key, so the public demo has no model bill.',
    ],
    links: {
      repo: 'https://github.com/trism-prism/docs-qa-copilot',
      live: 'https://docs-qa-copilot.vercel.app',
      extra: [{ label: 'Evaluation page', href: 'https://docs-qa-copilot.vercel.app/eval' }],
    },
    media: [
      {
        src: '/work/docs-qa/answer-960.webp',
        alt: 'Docs Q&A Copilot answering a question about Medicare hospital costs. Numbered citation markers in the answer match a sources column quoting Medicare & You 2027, page 30.',
        width: 960,
        height: 600,
      },
      {
        src: '/work/docs-qa/eval-1280.webp',
        alt: 'The evaluation page: 93.3% answer accuracy on 30 held-out questions and 92.0% on all 50, above a table of every measure by split.',
        width: 1280,
        height: 800,
        caption: 'The evaluation page publishes every measure and failure.',
      },
    ],
    visibility: 'featured',
    order: 20,
    caseStudy: 'docs-qa-copilot',
  },
  {
    id: 'kiln',
    slug: 'kiln',
    title: 'Kiln',
    summary:
      'An installable study planner that turns a syllabus, spreadsheet or LMS calendar into a daily to-do list with reminders, and keeps working offline.',
    significance:
      'The sync server only ever stores ciphertext, and device pairing is built so a six-digit code cannot be brute-forced offline.',
    role: 'Solo project: the app, the scheduling engine, encrypted sync and the small Worker behind it.',
    period: 'Sep 2026',
    kind: 'software',
    tech: ['React', 'TypeScript', 'Vite', 'Dexie', 'Cloudflare Workers', 'PWA'],
    highlights: [
      'A deterministic scheduler places tasks day by day within per-weekday time budgets and dependencies, binary-searching how many lower-priority tasks to defer so a plan meets its deadline.',
      'End-to-end encrypted, account-free sync on Cloudflare Workers with per-record AES-GCM and last-write-wins merge, so the server stores only ciphertext.',
      'Six-digit device pairing over a CPace password-authenticated key exchange, with a relay that retires a code after 3 wrong attempts.',
    ],
    links: { repo: 'https://github.com/trism-prism/kiln', live: 'https://kilnstudy.com' },
    media: [
      {
        src: '/work/kiln/todo-dark-1280.webp',
        alt: "Kiln's daily to-do list in dark mode.",
        width: 1280,
        height: 640,
      },
      {
        src: '/work/kiln/todo-phone-390.webp',
        alt: 'Kiln on a phone-sized screen, showing the same to-do list.',
        width: 390,
        height: 844,
      },
    ],
    visibility: 'featured',
    order: 30,
  },
  {
    id: 'gengarate',
    slug: 'gengarate',
    title: 'GengaRate',
    summary:
      'A live site for rating anime and manga, with more than 1,600 titles imported from AniList, accounts and friends.',
    significance:
      'Careful authentication on a live site: refresh-token reuse detection, cross-tab locking, and database tests an in-memory fake cannot run.',
    role: 'Solo project: React front end, ASP.NET Core API, PostgreSQL schema and hosting.',
    period: 'Aug 2026',
    kind: 'software',
    tech: ['React', 'ASP.NET Core', 'PostgreSQL', 'GraphQL', 'GitHub Actions'],
    highlights: [
      'Auth with ASP.NET Core Identity, JWT and Google OAuth, with rotating hashed refresh tokens that end the session on reuse, email verification, lockout and breached-password checks.',
      'Token refresh serialized across browser tabs with Web Locks, so concurrent tabs do not trip the reuse check and sign the user out.',
      'AniList GraphQL import with Retry-After backoff, upserts and a Postgres advisory lock so only one import runs at a time.',
      'Backend tests run on every pull request against a real PostgreSQL service, including the partial indexes, constraints and locks an in-memory database cannot check.',
    ],
    links: { repo: 'https://github.com/trism-prism/anime-rating-platform', live: 'https://www.gengarate.com' },
    media: [
      {
        src: '/work/gengarate/title-1280.webp',
        alt: 'A GengaRate title page for an anime, with its rating and series information.',
        width: 1280,
        height: 640,
      },
    ],
    visibility: 'featured',
    order: 40,
  },
  {
    id: 'cfb-upsets',
    slug: 'cfb-upset-study',
    title: 'Predicting College Football Upsets',
    summary:
      'An independent statistical study of 3,900 NCAA FBS games asking whether outcomes are predictable beyond the betting market’s closing spread.',
    significance:
      'Its main finding is a negative result, defended by catching two data leaks that would have made the model look better than it is.',
    role: 'Solo study: data pipeline, modelling and write-up.',
    period: 'Nov 2026',
    kind: 'data',
    tech: ['Python', 'pandas', 'statsmodels', 'scikit-learn'],
    highlights: [
      'The spread-based forecast beats a naive baseline (Brier score 0.177 against 0.244, a 27% Brier skill score); five added features gave no out-of-sample gain.',
      'An integrity audit of the ETL pipeline caught a filter bug that leaked FBS-vs-FCS games into 13.1% of records and inflated the skill score from 27% to 32%.',
      'Prior-season team ratings as pregame inputs prevent a look-ahead leak; a controlled rerun with the leak showed a false 38% skill score.',
    ],
    // The repository is private, so no link.
    links: {},
    media: [],
    visibility: 'listed',
    order: 50,
  },
  {
    id: 'internship-scout',
    slug: 'internship-scout-agent',
    title: 'Internship Scout Agent',
    summary:
      'A weekly agent that scores new internship postings against a résumé using Claude with tool calling, explains every match, and emails a digest.',
    significance: 'An LLM agent designed to treat everything it reads as untrusted input.',
    role: 'Solo project: agent loop, data pipeline, scheduling and deployment.',
    period: 'May 2026',
    kind: 'ai',
    tech: ['Python', 'FastAPI', 'PostgreSQL', 'Anthropic API', 'GitHub Actions', 'Vercel'],
    highlights: [
      'A tool-calling loop on the Anthropic Messages API: the model fetches a full posting only when needed and records a 0-100 score with reasons, isolating failures per batch.',
      'Hardened against untrusted posting text: postings are named only by database ID, fetches accept only public https hosts with per-redirect checks and size and time limits, and output is HTML-escaped.',
    ],
    links: {
      repo: 'https://github.com/trism-prism/internship-scout-agent',
      live: 'https://internship-scout-agent.vercel.app',
    },
    media: [],
    visibility: 'listed',
    order: 60,
  },
  {
    id: 'heart-disease',
    slug: 'heart-disease-prediction',
    title: 'Heart Disease Prediction',
    summary:
      'A recall-first classifier on the UCI Cleveland heart disease data, served in a web form, with a model card and an external check on other sites. An educational demo, not a diagnostic tool.',
    significance:
      'Chooses the simpler model on evidence, and reports where its headline recall fails to carry over to other hospitals.',
    role: 'Solo project: modelling, evaluation, the app and run tracking in PostgreSQL.',
    period: 'Dec 2025 – Jan 2026',
    kind: 'data',
    tech: ['Python', 'scikit-learn', 'XGBoost', 'Streamlit', 'PostgreSQL'],
    highlights: [
      'Logistic regression beat random forest and XGBoost over 5x5 repeated cross-validation on precision at recall of at least 0.90, so the simpler model ships.',
      'On a 61-patient test set it missed 1 of 28 sick patients (recall 0.96, 95% CI 0.88–1.00); on 617 rows from other UCI sites the frozen model’s recall fell to 0.70, which the README reports as a limit.',
      'Found that a popular Kaggle copy of the data has an inverted target and repeated patients; a test fails if the label direction flips.',
    ],
    links: {
      repo: 'https://github.com/trism-prism/heart-disease-prediction',
      live: 'https://heart-disease-prediction-alpha.vercel.app',
    },
    media: [],
    visibility: 'listed',
    order: 80,
  },
  {
    id: 'tripwire',
    slug: 'tripwire',
    title: 'Tripwire',
    summary:
      'An open-source situational-awareness dashboard that loads the GDELT news-event feed every 15 minutes, flags unusual per-country spikes and shows them on a map.',
    significance:
      'Alerts checked by hand against their source articles, and tuning ideas dropped when they failed on untouched data.',
    role: 'Solo project: ingestion worker, spike scoring, dashboard and alert audit.',
    period: 'Feb 2026',
    kind: 'data',
    tech: ['Python', 'PostgreSQL', 'Streamlit', 'Docker', 'GDELT'],
    highlights: [
      'Duplicate-safe upserts, checksums and a per-file error log, so one bad file never halts the pipeline.',
      'Spike alerts score each country’s daily count against its own 28-day baseline with median and MAD; counting distinct articles instead of repeated rows cut alerts 41%.',
      'Hand-audited 50 alerts against their source articles: 61% of the 49 that could be judged were real.',
    ],
    links: { repo: 'https://github.com/trism-prism/tripwire-awareness-dashboard' },
    media: [],
    visibility: 'listed',
    order: 70,
  },
  // Kept as data for later: public repos, on the CV, not selected for the site yet.
  {
    id: 'minivmm',
    slug: 'minivmm',
    title: 'minivmm',
    summary:
      'A minimal virtual machine monitor in C on Linux KVM that boots 16-bit guest programs and services their port I/O, MMIO, halt and shutdown exits.',
    role: 'Solo project.',
    period: 'Nov 2026',
    kind: 'systems',
    tech: ['C', 'KVM', 'x86 Assembly', 'QEMU', 'Make'],
    highlights: [
      'Output verified against QEMU/KVM on four guests; the tests also pass under AddressSanitizer and UBSan.',
      'Measured a VM exit at about 5.3 µs under nested KVM against 0.1 µs for a syscall.',
    ],
    links: { repo: 'https://github.com/trism-prism/minivmm' },
    media: [],
    visibility: 'hidden',
    order: 90,
  },
  {
    id: 'lucid-blocks',
    slug: 'lucid-blocks-coop',
    title: 'Lucid Blocks Co-op Mod',
    summary:
      'An update to a dormant open-source co-op multiplayer mod for a Steam game, in GDScript in a public fork, restoring build compatibility and adding modules.',
    role: 'Contributor to a public fork.',
    period: 'Nov 2026',
    kind: 'software',
    tech: ['GDScript', 'Godot', 'UDP'],
    highlights: [
      'A five-message ownership handoff reached a 95th-percentile switch latency under 600 ms on a simulated link with 60 ms latency and 1% loss.',
      'Replaced a full resync on every block break with a diff-based rescan, which eliminated guest reconnects at 150 ms latency.',
    ],
    links: { repo: 'https://github.com/trism-prism/lucid-blocks-coop-updated' },
    media: [],
    visibility: 'hidden',
    order: 100,
  },
];
