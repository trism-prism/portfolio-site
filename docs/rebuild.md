# Rebuild: current state

The one current-state record for the rebuild. Update it in place; do not add dated diaries.

## Refs and paths

| What | Value |
|---|---|
| Original checkout (untouched, still dirty) | `C:\Studio\code\web\portfolio-site` on `feat/rebuild` @ `1e5b867` |
| Preservation tag (committed state only) | `preserve/feat-rebuild-2026-11-19` → `1e5b867` (local, not pushed) |
| Base | `main` @ `cbfc0a9`, equal to `origin/main` after `git fetch` on 2026-11-19 |
| Foundation branch / worktree | `feat/portfolio-rebuild` at `C:\Studio\_trials\portfolio-site-rebuild` |
| Foundation checkpoint SHA | `781c3b5b6b34e028fcc575217270aa6589277301` (passing `check:full`) |
| Trial branch / worktree | `feat/portfolio-direction-trial` at `C:\Studio\_trials\portfolio-site-direction-trial`, from `781c3b5`; trial commit `73b20cbe2254b0a606c700d4ca2c18d0456e6c55` |

Why `main` as the base: it is what production serves and what the Vercel project builds, it equals `origin/main`, and `feat/rebuild` carries a design direction that is retired, not a foundation to build on.

## Status

- **Foundation:** complete at `781c3b5`, passing `check:full` locally (see [verification.md](verification.md)).
- **Trial (this branch):** "editorial engineering studio" direction implemented for the entry view, project previews, project pages and the contact path. **Experimental, awaiting Tristan's design review**; see [DESIGN.md](../DESIGN.md) and [advisor-handoff.md](advisor-handoff.md). Not to be merged or extended without his approval.

## Changes the trial made to foundation contracts

Each is on this branch only; the foundation branch is unchanged.

| Change | Files | Why | Consequence if kept |
|---|---|---|---|
| New optional content field `significance` ("why it is worth a look"), written for the 8 public projects from repo/résumé facts | `src/content/types.ts`, `src/content/projects.ts` | The brief asks every preview to say why a project deserves attention; `summary` only says what it is. | One more field to maintain per project; content test still checks for placeholders. Wording is draft for Tristan to approve. |
| New optional content field `preview` (the image that stands for a project in lists), set for the engine | `src/content/types.ts`, `src/content/projects.ts`, content test | The full-app screenshot was unreadable at preview size; a cropped demo image reads. | Defaults to the first media item, so other projects need nothing. |
| Listed projects reordered newest first (Tripwire and Heart Disease `order` swapped) | `src/content/projects.ts` | The entry index shows dates; out-of-order dates read as mistakes. | Data-only; membership unchanged. |
| `renderCaseStudy` returns `{ html, headings }` and gives h2/h3 stable `cs-*` ids | `src/lib/caseStudy.ts` | "On this page" contents list on long case studies; deep links to sections. | Section anchors become shareable URLs; renaming a heading changes its anchor. |
| Entry view: selected work became a tabbed viewer (client component) and the full index moved onto the entry view | `src/app/page.tsx`, `src/components/FeaturedViewer.tsx` | Real work visible in the first desktop viewport, plus one meaningful media interaction. | Adds the site's second client component. Without JavaScript only the first featured project shows in the viewer; the index below still links every project. |
| Project page: highlights renamed "At a glance", facts moved to a sticky aside, source/live links promoted to buttons, screenshots grouped in a dark band, pager labelled "Previous/Next project" | `src/app/work/[slug]/*` | Case-study structure from the brief: overview, contribution, decisions, evidence, limits, obvious links. | Tests updated to the new names. |
| One light treatment; the page no longer follows the OS dark setting | `src/app/globals.css`, `src/app/layout.tsx` | "One coherent treatment, not a theme switcher." | Dark-mode visitors get the light page. A dark variant is follow-up work if kept. |
| Web fonts (Bricolage Grotesque, Source Serif 4, IBM Plex Mono) through `next/font/google` | `src/app/layout.tsx` | Editorial typography with character. | Fonts are self-hosted in the build (no runtime request to Google), but `next build` needs network access to download them. All three are SIL Open Font License. |
| Test locators: contact tests find the message box by role; navigation tests follow the viewer and new labels; new keyboard test for the viewer | `e2e/*.spec.ts` | "Send a message" section label made `getByLabel('Message')` ambiguous; entry structure changed. | None outside tests. |
| `scripts/capture.mjs` | new | Repeatable review screenshots. Not a test; asserts nothing about the design. | None. |
- **Blocked on configuration (not code):** live contact delivery needs a relay account (see Open).

## Decisions

### Settled

- **Static Next.js (App Router) export, React, TypeScript, CSS modules, Vitest, Playwright + axe.** Matches the existing Vercel project with no hosting change, keeps pages readable without JavaScript, and is a stack Tristan already maintains. Nothing visual was carried over from v1–v3.
- **Hosting stays on Vercel.** Free for a static site, already configured with redirects and previews. The Hobby plan is for non-commercial use: revisit if paid freelance work is offered through the site. The export moves to Cloudflare Pages unchanged; only `vercel.json` redirects would need translating.
- **Content is typed data, separate from display.** Records hold no classes or layout. Visibility (`featured` / `listed` / `hidden`) and `order` are the only levers for membership and order.
- **Case studies are optional Markdown, rendered at build time** with `marked`; raw HTML in the Markdown is escaped. Headings are authored per project.
- **Contact delivery is a transport interface.** `relayTransport` posts JSON to a hosted relay; without configuration the form hands the message to the visitor's mail app. Success is shown only after a 2xx response. Tests mock the relay with `page.route`; production code has no test mode.
- **Motion policy** in `src/lib/motion.ts`: OS preference by default, a footer override stored per browser, applied before first paint as `html[data-motion]`.

### Provisional (cheap to change now, costlier later)

- **Routes:** `/`, `/work/`, `/work/<slug>/`, `/about/`, `/contact/`, `/resume.pdf`, `/cv.pdf`, 404. Changing a project slug or `/work/` breaks shared links: add a redirect in `vercel.json` if you do. Merging About or Contact into the home page is a layout change only.
- **Navigation:** header links Work · About · Contact · Résumé; footer carries GitHub, LinkedIn, Résumé, CV, email and the motion control.
- **Home content:** intro, featured projects, current role, links. A design may reorder or condense it.
- **Project page order:** summary, facts, lead image, highlights, case study, remaining images, previous/next.

## Dependency map

What a change touches:

| Change | Files | Affects |
|---|---|---|
| Add, hide, feature or reorder a project | `src/content/projects.ts` | Home, /work/, project pages, sitemap. Content test guards it. |
| Write or remove a case study | `content/case-studies/*.md`, project `caseStudy` field | That project page only. |
| Name, links, production URL | `src/site.ts` | Every page's metadata, sitemap, robots, header/footer. |
| URLs (slugs, `/work/`) | `src/app/work/**`, `vercel.json` | Shared links, sitemap, tests in `e2e/`. |
| Visual design | `src/app/globals.css` tokens, `*.module.css`, components | Presentation only, unless a design changes page structure. |
| Contact delivery | `.env` at build time, `src/lib/contact/*` | Contact page behaviour. |
| Motion | `src/lib/motion.ts`, `globals.css` `[data-motion]` rules | Any animated presentation. |

## Open (needs Tristan)

1. **Intro and interests wording** in `src/content/profile.ts` are drafted from confirmed facts and marked DRAFT; they need his own words.
2. **Contact relay:** pick a provider (Formspree or Web3Forms are both free at this volume and work with a static site) and create the account; then set the two `NEXT_PUBLIC_CONTACT_*` values in Vercel. Until then the form uses the mail-app hand-off.
3. **minivmm and Lucid Blocks Co-op Mod** are public repos on the CV, kept as `hidden` records. Discovery assumed minivmm had no public repo; that was wrong. Publishing either is a one-field change.
4. **CFB Upset Study** repo is private, so its page has no source link. Make it public or keep it as is.
5. **GengaRate live URL:** the README says `www.gengarate.com`; GitHub's homepage field says `anime-rating-platform-pi.vercel.app`. The site uses the README's.
6. **Visibility engine screenshots** show an earlier build of the demo (scene list changed on 2026-11-18). Captioned as such; replace when convenient.

## Backlog (not built; add only when the condition holds)

| Idea | Add when |
|---|---|
| Filter/search on /work/ | The collection grows past roughly 15 projects or visitors need to filter by area. Keep filter logic separate from controls; cover empty results. |
| Social share image per project | Links are being shared where previews matter. |
| Freelance/services page | Tristan decides to offer client work; also revisit Vercel Hobby terms. |
| Theme override (light/dark toggle) | A chosen design needs it; currently follows the OS. |
| Command palette, CV reader, blog | A confirmed visitor need. Not planned. |
| Project diagrams or short videos | A case study needs a picture to explain a mechanism the text cannot. |
