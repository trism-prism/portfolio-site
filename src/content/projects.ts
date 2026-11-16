export type Project = {
  id: string;
  title: string;
  dates: string;
  description: string;
  /** Cover image in public/work/<slug>/. Projects without one show a monogram card. */
  cover?: { src: string; alt: string };
  features: string[];
  tech: string[];
  /** Public repositories only. */
  links: { repo?: string; live?: string };
};

// Every repo linked here is public. Numbers come from the resume or the public repos, with their conditions.
export const projects: Project[] = [
  {
    id: 'visibility-engine',
    title: '2D Visibility & Lighting Engine',
    dates: 'Nov 2026',
    description:
      'A C++ engine that works out exactly what one point light can see among line-segment walls, which is what gives a 2D game sharp shadows. I wrote the geometry, both search methods, the demo app and the benchmark harness myself.',
    cover: {
      src: '/work/visibility-engine/room-888.webp',
      alt: 'The demo app: line-segment walls and one light, with its lit area in warm tones and a hard shadow behind each wall.',
    },
    features: [
      'Grid ray walk (Amanatides-Woo) replaces testing every wall per ray: 1.5x faster on 250-wall clustered scenes and up to 127x on 4,000-wall mazes, with output bit-identical to brute force at every benchmarked position.',
      'One ray per wall end and wall crossing with one-sided hit limits, replacing epsilon-offset rays that leaked light through shared corners.',
      'Fixed a shadow bug where an angle sort merged two collinear targets, using one orientation predicate with an exact fallback.',
      'Benchmarked across four wall layouts, three seeds and 16 to 4,000 walls, and documented where and why the grid degrades.',
    ],
    tech: ['C++20', 'CMake', 'GLFW', 'Dear ImGui', 'doctest'],
    links: { repo: 'https://github.com/trism-prism/2d-visibility-engine' },
  },
  {
    id: 'kiln',
    title: 'Kiln',
    dates: 'Sep 2026',
    description:
      'An installable study planner that turns a syllabus, spreadsheet or LMS calendar into a daily to-do list with reminders, and keeps working offline. I built the app, the scheduler, the sync and the small server behind it.',
    cover: {
      src: '/work/kiln/todo-dark-1280.webp',
      alt: 'Kiln, the study planner, showing a daily to-do list in dark mode.',
    },
    features: [
      'Deterministic scheduler that places tasks day by day within per-weekday time budgets and dependencies, binary-searching how many lower-priority tasks to defer so a plan meets its deadline.',
      'End-to-end encrypted, account-free sync on Cloudflare Workers with per-record AES-GCM and last-write-wins merge, so the server stores only ciphertext.',
      'Six-digit device pairing using a CPace password-authenticated key exchange, with a relay that retires a code after 3 wrong attempts.',
    ],
    tech: ['React', 'TypeScript', 'Vite', 'Dexie', 'Cloudflare Workers', 'PWA'],
    links: { repo: 'https://github.com/trism-prism/kiln', live: 'https://kilnstudy.com' },
  },
  {
    id: 'docs-qa',
    title: 'Docs Q&A Copilot',
    dates: 'Jun 2026',
    description:
      'Answers questions about two public benefits PDFs, 296 pages in all, with page-level citations, and shows its own failures on an evaluation page. Visitors bring their own API key, so the public demo carries no model spend.',
    cover: {
      src: '/work/docs-qa/answer-960.webp',
      alt: 'Docs Q&A Copilot answering a question with page citations.',
    },
    features: [
      'Retrieval-augmented answers streamed with page-level citations, and correct abstention on all 8 unanswerable questions.',
      'Evaluated on a frozen 50-question set (20 for tuning, 30 held out and run once): 46 of 50 correct overall and 28 of 30 on the held-out questions. The set is small, so one question moves the score by 2 points.',
      'Found a PDF extraction bug that split words apart through error analysis, and raised development-set accuracy from 16 to 18 of 20.',
    ],
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'pgvector', 'Anthropic API', 'Vercel'],
    links: { repo: 'https://github.com/trism-prism/docs-qa-copilot', live: 'https://docs-qa-copilot.vercel.app' },
  },
  {
    id: 'gengarate',
    title: 'GengaRate',
    dates: 'Aug 2026',
    description:
      'A live site for rating anime and manga, with more than 1,600 titles imported from AniList. I built the React front end, the ASP.NET Core API and the PostgreSQL schema, and set up hosting on Vercel and Railway.',
    cover: {
      src: '/work/gengarate/title-1280.webp',
      alt: 'The GengaRate title page for an anime, with ratings and series information.',
    },
    features: [
      'Auth with ASP.NET Core Identity, JWT and Google OAuth, with rotating hashed refresh tokens that end the session on reuse, email verification, lockout and breached-password checks.',
      'Token refresh serialized across browser tabs with Web Locks, so concurrent tabs do not trigger the reuse check.',
      'AniList GraphQL import with Retry-After backoff, upserts and a Postgres advisory lock so only one import runs at a time.',
      '322 xUnit tests run on every pull request against a real PostgreSQL service.',
    ],
    tech: ['React', 'ASP.NET Core', 'PostgreSQL', 'GraphQL', 'GitHub Actions', 'Vercel'],
    links: { repo: 'https://github.com/trism-prism/anime-rating-platform', live: 'https://www.gengarate.com' },
  },
  {
    id: 'minivmm',
    title: 'minivmm',
    dates: 'Nov 2026',
    description:
      'A small virtual machine monitor in C on top of Linux KVM. It loads a flat 16-bit binary, handles port I/O, memory-mapped I/O and halts, and its output is compared against QEMU.',
    features: [
      'Boots 16-bit guest programs and services their port I/O, MMIO, halt and shutdown exits from a KVM_RUN loop, dumping registers on a triple fault.',
      'Output verified against QEMU/KVM on four guests, with 16 tests that also pass under AddressSanitizer and UBSan.',
      'Measured a VM exit at about 5.3 µs under nested KVM against 0.1 µs for a syscall; that was on a laptop under WSL2, so it says little about bare metal.',
    ],
    tech: ['C', 'KVM', 'x86 Assembly', 'QEMU', 'Make'],
    links: { repo: 'https://github.com/trism-prism/minivmm' },
  },
  {
    id: 'lucid-blocks',
    title: 'Lucid Blocks Co-op Mod',
    dates: 'Nov 2026',
    description:
      'An update to a dormant open-source co-op multiplayer mod for a Steam game, written in GDScript in a public fork. It restores 5.2 build compatibility and adds 7 modules.',
    features: [
      'Five-message ownership handoff with write-behind commits and stale-epoch rejection, reaching a 95th-percentile switch latency under 600 ms on a simulated link with 60 ms latency and 1% loss.',
      'Replaced a full resync on every block break with a diff-based rescan, which eliminated guest reconnects at 150 ms latency.',
      'A UDP relay that injects seeded delay, jitter, loss, reordering and cuts, plus bot-driven two-process tests.',
    ],
    tech: ['GDScript', 'Godot', 'UDP', 'Networking'],
    links: { repo: 'https://github.com/trism-prism/lucid-blocks-coop-updated' },
  },
  {
    id: 'internship-scout',
    title: 'Internship Scout Agent',
    dates: 'May 2026',
    description:
      'A weekly agent that scores internship postings against my resume and emails a ranked digest. It has a small public page, and no accuracy figure for the scoring.',
    features: [
      'Tool-calling loop on the Anthropic Messages API: the model fetches a full posting only when needed and records a 0-100 score with reasons.',
      'Hardened against untrusted posting text: postings are named only by database ID, fetches accept only public https hosts with per-redirect checks, and output is HTML-escaped.',
      'Scored 1,074 postings across 3 runs.',
    ],
    tech: ['FastAPI', 'PostgreSQL', 'Anthropic API', 'GitHub Actions', 'Vercel'],
    links: {
      repo: 'https://github.com/trism-prism/internship-scout-agent',
      live: 'https://internship-scout-agent.vercel.app',
    },
  },
  {
    id: 'tripwire',
    title: 'Tripwire',
    dates: 'Feb 2026',
    description:
      'A situational-awareness dashboard that loads the GDELT news-event feed into PostgreSQL every 15 minutes and flags per-country spikes against a 28-day baseline.',
    features: [
      'Duplicate-safe upserts, checksums and a per-file error log so one bad file never halts the pipeline.',
      "Spike alerts scored against each country's own baseline with median and MAD, cutting alerts 41% by counting distinct articles instead of repeated rows.",
      'Hand-audited 50 alerts against their source articles: 61% of the 49 that could be judged were real.',
    ],
    tech: ['Python', 'PostgreSQL', 'Streamlit', 'GDELT'],
    links: { repo: 'https://github.com/trism-prism/tripwire-awareness-dashboard' },
  },
];
