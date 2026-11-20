# Showcase rebuild (private)

Branch `feat/showcase-rebuild` rebuilds Tristan's portfolio with the full feature set of the site analysed in
the saved REA investigation of `sagargupta.online/portfolio-react` (captured 19 November 2026), but with
Tristan's content, original code and original art.

**Status: private.** It contains marked placeholders ([PLACEHOLDERS.md](../PLACEHOLDERS.md)). The production
build fails while any remain, the pages are `noindex`, and `robots.txt` disallows everything. Do not merge to
`main` or deploy until the placeholders are filled or removed.

## Evidence baseline and how it was used

- Source of truth for the reference site's behaviour: `C:\Studio\_inbox\sagar-site-analysis` (REA 6.9.0 export:
  `report.md`, `evidence-guide.md`, `technical-catalog.md`, the evidence index and the extracted screenshots).
- REA was **not** rerun and the live site was **not** fetched for this work. The reference site's repository
  was not re-downloaded.
- The report's three labels are preserved below: **observed** (in a captured browser scenario or response),
  **source-derived** (read from the recovered implementation, not necessarily exercised), and **unverified**.
- **No code, art or copy was copied.** The reference source is GPL-3.0 (per its `package.json`, as recorded in
  the report). This branch reimplements behaviours from their descriptions only. The character art in the
  reference site is the owner's likeness and AI-generated companions; this branch uses its own SVG prism
  character and SVG people instead.

## Feature map

| Reference feature (evidence label) | Here | Deviation and why |
|---|---|---|
| One-document site, hero + 10 numbered sections, hash navigation with header offset and history (observed + source-derived) | `src/app/page.tsx`, `src/lib/nav.ts`, `Chrome.tsx#SmoothScroll` | Sections render in the static HTML instead of deferred placeholders, so the mount-before-scroll workaround is unnecessary and content never depends on JS. |
| Fixed nav, More menu, active-section observer (`-35% 0 -60% 0`), mobile menu ≤1023px (observed) | `shell/Nav.tsx` | Same thresholds. |
| Command palette, Ctrl/⌘K, shell-styled prompt that only dispatches actions (observed) | `shell/CommandPalette.tsx` | Hand-written instead of `cmdk`; same rule: nothing executes. |
| "How it's built" annotation pins from real element rects (observed) | `shell/Annotations.tsx`, `data/annotations.ts` | 8 notes about this build. |
| Intro splash with signature draw, skippable (source-derived) | `Chrome.tsx#IntroSplash` | A beam splits through a prism, then the name draws. Shown once per session (the reference shows it every load). |
| Proximity variable-weight headline, `600 + 200·max(0,1−d/150)²` (source-derived) | `ui/ProximityText.tsx` | Same formula, fine pointers and Full motion only. |
| Ambient dot grid, drifting glows (26/32/40 s), two 24° beams (14/21 s) (source-derived) | `shell/Ambient.tsx`, `globals.css` | Teal/violet palette instead of blue. |
| Floating technology field with different scroll rates per side and fade near the end (source-derived) | `Ambient.tsx#TechField` | Monogram tiles, not brand logos. |
| Blinking/winking maker mark (source-derived) | `ui/Prism.tsx#PrismMark` | Original prism character (from the trism-prism handle). |
| Roaming heading mascot with drop/land/wink/sit, sleep after 20 s (source-derived) | `ui/Mascot.tsx` | SVG poses instead of a raster sprite strip. |
| Motion policy Full/Reduced with persistent override (observed: defaults to Full regardless of OS) | `lib/motion.tsx`, `lib/boot.ts` | **Deliberately different:** starts from the OS `prefers-reduced-motion` setting, per the product brief, then lets the visitor override. |
| Shared scene clock capped near 60 Hz, stopped when hidden (source-derived) | `lib/clock.ts` | One rAF loop with a minimum frame gap instead of rate sampling. |
| Scenes mount within 300 px of the viewport and freeze to an informative frame in Reduced (source-derived) | `scenes/Stage.tsx#SceneHost` | Same boundary. |
| 49 project covers in 30 scene families (source-derived) | `scenes/covers/*` | 11 custom covers, one per project, each animating that project's real mechanism (see below). |
| Project filters, AND-term search, spotlight first, `?project=slug#projects` deep links with replaceState, copy link (observed) | `sections/Projects.tsx`, `lib/search.ts` | Categories are Featured/Software/AI/Data/Systems. |
| Modal: portal, scroll lock, focus trap, Escape, bottom sheet with drag-to-dismiss >120 px or >500 px/s (source-derived) | `ui/Modal.tsx` | Same thresholds. |
| Three richer demos (observed: terminal tabs, comparison slider ±5) | `scenes/demos/Demos.tsx` | Visibility polygon you can drag (real computation), Docs Q&A scripted terminal (35 ms/char, 320 ms pause, 170 ms rows, 2.6 s hold), heart-disease threshold slider (±5 keys, labelled synthetic data). |
| Glossary tooltips on first occurrence, Escape handled in capture so a parent modal stays open (source-derived) | `ui/Gloss.tsx`, `data/glossary.ts` | Same. |
| Experience/education timelines, experience detail modal with scene (observed) | `sections/Experience.tsx`, `scenes/FormworkScene.tsx` | Formwork scene uses résumé terms only. |
| Skill marquee rails at 40 px/s, ≥12 chips per copy, duplicates hidden from AT (source-derived) | `sections/Skills.tsx` | Same. |
| Achievements: certifications by level, badge rails, competitions (observed) | `sections/Achievements.tsx` | Mostly placeholders: no certifications or competitions are on record. Real honors from NOVA. |
| Focus areas: lead card + six, each with a small animation and "Ask me about this" (observed) | `sections/Focus.tsx`, `scenes/FocusArt.tsx` | Each card also links the projects that back it. |
| Stats derived from data, coding profiles, contribution calendar from a public API with 10 s abort (source-derived) | `sections/Stats.tsx`, `lib/calendar.ts` | Coding profiles are placeholders. The live calendar fetch is **off by default** so this private build never sends the GitHub username to a third party; a labelled seeded sample shows instead (`NEXT_PUBLIC_LIVE_CONTRIBUTIONS=1` enables it). |
| Activity log with type filters, six visible, scroll-anchored collapse, FNV-1a "commit" labels (source-derived) | `sections/News.tsx`, `lib/fnv.ts` | Same; labels are explicitly marked as not commit IDs. |
| Contact: validation (name ≤100, email ≤254, message 10–5000), honeypot, 15 s UI timeout that does not abort, retry reuses the pending send, git-push confirmation (source-derived; no message was sent in the investigation) | `sections/Contact.tsx`, `lib/contact.ts` | No EmailJS. With `NEXT_PUBLIC_CONTACT_ENDPOINT` set it POSTs to a relay; otherwise it opens the visitor's email app and says nothing was sent yet (per the product brief). |
| Footer: four switchable scenes, persisted choice, swipe 48 px / slope 1.5, hold-to-copy email (220/650 ms), mobile slide-to-email (85%), Konami badge (source-derived; three scenes observed) | `footer/*` | Original scenes: **Lightroom** (your pointer is a light; real visibility polygon), **Game day** (scroll velocity runs or rewinds the play), **Trivia** (a question from the projects; correct answer sends an envelope to the email button), **Orbit** (depth-scaled ring; holding the email button speeds it up). |
| CV viewer with web and PDF views (observed) | `shell/CvViewer.tsx` | Web view generated from the same data; PDF view embeds `public/cv.pdf` / `resume.pdf` (no page-image pipeline). |
| Public files: `llms.txt`, `rss.xml`, vCard (75-octet folding, CRLF), webmanifest, data JSON, 404 that redirects known section paths (observed) | `src/app/*/route.ts`, `manifest.ts`, `not-found.tsx` | Same set. Placeholders keep a `[PLACEHOLDER]` prefix in feeds and JSON. |
| Analytics (observed requests) | — | Not included: no account, and no consent design yet. |
| Meta CSP (source-derived) | — | Not included yet; Vercel headers are the better place for it. |

## Project covers

Each cover animates what the project actually does, using facts from the résumé, CV and public repos:

| Project | What the cover shows |
|---|---|
| 2D Visibility & Lighting Engine | A moving light; its visibility polygon computed every frame; one ray's grid walk; live brute-force vs grid wall-test counts |
| Docs Q&A Copilot | Pages → vector field → nearest chunks → answer with page citations; then an unanswerable question gets "not found" |
| Kiln | Syllabus tasks fill weekday budgets; one is deferred by binary search; AES-GCM sync to a Worker; six-digit CPace pairing |
| GengaRate | AniList import with a 429/Retry-After pause; rated title cards; two tabs sharing a Web Lock for token refresh |
| College football upsets | Brier 0.244 vs 0.177; an audit sweep flags leaked FCS rows; skill score corrects 32% → 27% |
| Internship Scout Agent | Postings scored by an agent fetching through a guarded tool; 0–100 gauge; weekly digest |
| Heart Disease Prediction | Threshold slides to recall ≥ 0.90; LR 0.705 beats RF/XGB; 27 of 28 sick test patients caught |
| Tripwire | GDELT every 15 min; a country breaks its median+MAD band; the map pings |
| minivmm | KVM_RUN loop with IO/MMIO/HLT exits; the console prints "Hello" one port write at a time |
| Lucid Blocks co-op | Five-message handoff over a lossy link with a resend; diff rescan instead of an 840 KB resync |
| This portfolio | The site in miniature, with the palette typing `cd projects` |

## Verification done for this branch

- `npm run check` (TypeScript + ESLint) passes.
- `npm test`: 31 tests (search, contact validation and send state machine, visibility vs grid agreement,
  calendar streaks, vCard folding, scene kit, data integrity, placeholder audit vs this list, build guard).
- `npm run build:dev` produces the static export (21 routes) and warns about placeholders;
  `node scripts/placeholder-guard.mjs` exits 1 on the same output, as intended.
- Browser checks in the dev server (Chromium, in-app browser): every section renders; a deep link opens the
  right modal; Escape closes it and clears the query; the palette opens a project; the visibility demo responds
  to clicks; all four footer scenes switch; Reduced motion freezes scenes and persists; a 375 px viewport has
  no horizontal overflow after two fixes.

## Limitations carried forward and new gaps

From the REA investigation (unchanged by this work): one long scenario stalled and was cancelled; the static
analyses hit resource limits, so their graphs are incomplete; the five-second execution window is not a
benchmark; mobile captures were viewport-sized, not real devices; no contact message was sent, so the
reference site's mail delivery is unverified; source/deployment correspondence is strong evidence, not a
byte-identical rebuild.

For this branch: no real-device, Safari or Firefox testing; no screen-reader pass; the contact relay path is
untested because no relay exists; the live contribution fetch is untested by design (off by default); frame
rates were not measured.
