# Advisor handoff

Copy the block below into the advisor chat. It reflects the state on 2026-11-20.

```text
Act as my independent portfolio advisor. Evaluate this implemented trial against
my confirmed goals and evidence. Challenge poor structure, weak proof, design
drift and unnecessary complexity before recommending any whole-site rollout.

Confirmed goals and visitor journeys:
- The site displays me (Tristan Morton, software engineer, full stack and AI
  engineering; data work secondary). It does not market me. My recruiter message
  is the ad; the site is the product description. It is not positioned for
  internships versus full-time, so it can grow with me.
- Audience: recruiters and engineering hiring teams first, prospective clients
  second (freelance may come later without a rebuild).
- Journeys: (1) arrive on home or a shared project link, understand who I am,
  open any project, follow code/live links, optionally take the résumé/CV or
  contact me; (2) reach me from any page (form, email, LinkedIn, GitHub);
  (3) stale or wrong URLs get a clear 404; old v1 URLs redirect.
- Not funnelling, not pushing the résumé. Case studies optional per project.
- Featured: 2D Visibility & Lighting Engine, Docs Q&A Copilot, Kiln, GengaRate.
  More: College Football Upsets study, Internship Scout Agent, Tripwire, Heart
  Disease Prediction. Hidden records: minivmm, Lucid Blocks Co-op Mod.
  Membership/order are data-only edits.

Repository/worktree paths, branch names, base/foundation/trial commit SHAs:
- Repo: github.com/trism-prism/portfolio-site (nothing pushed from this work).
- Base: main @ cbfc0a9 (= origin/main on 2026-11-19).
- Foundation: feat/portfolio-rebuild @ 781c3b5 (+ e3aaa58 records the SHA),
  worktree C:\Studio\_trials\portfolio-site-rebuild.
- Trial: feat/portfolio-direction-trial, branched from 781c3b5, worktree
  C:\Studio\_trials\portfolio-site-direction-trial. Trial commit 73b20cb
  (92b88f5 and later commits only update docs).

Preservation status of the original dirty checkout:
- C:\Studio\code\web\portfolio-site on feat/rebuild @ 1e5b867, untouched:
  91 unstaged deletions under legacy/ and 2 untracked docs remain as they were.
- Local annotated tag preserve/feat-rebuild-2026-11-19 -> 1e5b867 keeps the
  committed state only. Older versions: tags v1-original (cbfc0a9),
  v2-lantern (d7790e6). Deprecated, no authority (docs/HISTORY.md).

Implemented foundation capabilities and incomplete integrations:
- Static Next.js 16 export on the existing Vercel project: /, /work/,
  /work/<slug>/ for every public project, /about/, /contact/, /resume.pdf,
  /cv.pdf (byte copies, SHA-256 checked), 404, sitemap, robots, redirects.
- Typed project records (visibility featured/listed/hidden, order), optional
  Markdown case studies (engine and Docs Q&A written from public repo facts).
- Contact form behind a transport interface: validation, pending, double-submit
  guard, success only after a real 2xx, failure with email fallback.
  INCOMPLETE: no relay account configured. Until then the form opens the
  visitor's mail app with the message filled in and never claims "sent".
- Motion policy: OS reduced-motion by default plus an explicit override.
- Checks: scripts/check.ps1 fast|quick|full; Playwright + axe; CI file written
  but never run (nothing pushed).

Trial hypothesis and implemented scope:
- "Editorial engineering studio with a quiet sense of scale and discovery":
  limestone surface #ECEBE5, blue-black ink #14202E, steel-blue accent #1F5C8F,
  dark media panels #121B26, fine rules; Bricolage Grotesque display, Source
  Serif 4 reading, IBM Plex Mono for stacks/dates only. One light treatment.
- Slice: entry (huge name, positioning line, dark tabbed viewer of the four
  featured projects with one cross-fade, then an index split Featured / More
  work), project pages (title, summary, why-it-matters line, source/live
  buttons, dark screenshot band with side-by-side comparisons, sticky facts
  aside with "On this page", At a glance, case study, previous/next), contact
  (channels and documents beside the form). About/Work/404 inherit tokens only.
- Design record: DESIGN.md (marked experimental).

Preview command/URL and representative screenshots:
- cd C:\Studio\_trials\portfolio-site-direction-trial; npm run build;
  npx serve out -l 4181  -> http://localhost:4181/
- Foundation for comparison: C:\Studio\_trials\portfolio-site-rebuild,
  npm run build; npx serve out -l 4180 -> http://localhost:4180/
- Screenshots: docs/screenshots/trial/ (entry-desktop-1440x1000.png,
  entry-mobile-390x844.png, case-study-engine-desktop-full.png,
  case-study-docs-qa-desktop-full.png, case-study-docs-qa-mobile-full.png,
  project-kiln-no-case-study-desktop-full.png,
  project-tripwire-no-media-mobile-full.png, contact-desktop-1440x1000.png,
  contact-desktop-errors.png, entry-narrow-320-full.png and others).

Checks performed and actual pass/fail/blocker results:
- Trial: check:full passed (tsc, ESLint, 31 unit, 49 browser tests incl. axe
  on 13 routes in light and dark OS settings with 0 violations, no overflow at
  320/390/1440, long-content stress, viewer keyboard pattern), 99.7 s.
- Foundation: check:full passed (31 unit, 48 browser), 81.4 s.
- Not done: real devices, screen readers, live contact delivery, CI run.

Structural changes the trial required and their consequences:
- New optional content fields `significance` (why a project is worth a look)
  and `preview` (list image). More content to maintain; wording is draft.
- Case-study renderer returns headings and stable section anchors.
- Selected work became a client-side tab viewer; without JS only the first
  project shows there, but the index below links everything.
- Light-only: OS dark mode no longer followed.
- next/font/google: fonts self-hosted in the build, but the build needs network.
- Listed projects reordered newest first (data only).
Full table: docs/rebuild.md, "Changes the trial made to foundation contracts".

Known limitations, unresolved design concerns and reviewer findings:
- Reviewer verdict: revise, keep direction. Fixed: mobile showed no work above
  the fold; entry "start here" links duplicated header and funnelled;
  unreadable viewer image; out-of-order dates; flat case-study text.
- Unresolved: "scale and discovery" rests mostly on the size of the name;
  serif everywhere makes pages uniform; media bands are screenshots only (no
  diagram or benchmark chart yet); highlights and case study repeat some facts;
  the tab viewer is a familiar pattern; footer motion control kept because
  an explicit override was required.
- Drafts needing my words: intro paragraphs, interests, every `significance`
  line. Engine screenshots show an earlier build of its demo.
- Facts: minivmm is public (discovery assumed not) and hidden for now; the CFB
  study repo is private so it has no link; GengaRate has two live URLs.

Owner approval status and specific decisions needed:
- NOT approved. My first reaction is "revise", but I have not chosen what to
  revise and no revisions have been made; I want your assessment first.
  Candidate revisions: make scale come from the work rather than the size of
  my name; sans for interface and summaries, serif only for long reading; one
  real diagram or chart in a case study; replace the tabbed viewer.
- Decide: keep / revise / reject this direction; whether the
  tabbed viewer earns its place; light-only vs adding a dark variant; whether
  to add diagrams/charts to case-study media; contact relay provider
  (Formspree or Web3Forms); whether to publish minivmm.

Please assess whether to keep, revise or reject this direction and identify
the next bounded work. Do not treat passing tests as my aesthetic approval.
```
