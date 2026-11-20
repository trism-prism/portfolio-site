# portfolio-site

Tristan Morton's portfolio: projects, background and contact, built as a static Next.js site.

**Stage:** design trial branch (`feat/portfolio-direction-trial`). The "editorial engineering studio" direction in [DESIGN.md](DESIGN.md) is experimental and awaiting review; see [docs/advisor-handoff.md](docs/advisor-handoff.md). Nothing here is deployed until it is merged to `main`.

## Where to start

| Read | For |
|---|---|
| [PRODUCT.md](PRODUCT.md) | What the site is for, who it serves, content rules. The authority. |
| [docs/rebuild.md](docs/rebuild.md) | Current state: decisions, dependency map, open items, backlog, refs and SHAs. |
| [docs/verification.md](docs/verification.md) | What was checked, how, and the results. |
| [docs/HISTORY.md](docs/HISTORY.md) | Earlier versions (deprecated) and how to retrieve them. |

## Commands

Needs Node 22 or later.

```powershell
npm ci
npm run dev                    # http://localhost:3000
./scripts/check.ps1 fast       # lint + content tests
./scripts/check.ps1 quick      # typecheck + lint + unit tests
./scripts/check.ps1 full       # quick + both static builds + browser tests (first run: npx playwright install chromium)
npm run build                  # production static export to out/
npm run serve                  # serve out/ at http://localhost:4173
```

## Editing content

- **Projects:** `src/content/projects.ts`. Change `visibility` (`featured`, `listed`, `hidden`) or `order` to rearrange; nothing else needs touching. Case studies are optional Markdown files in `content/case-studies/<name>.md`, linked by a project's `caseStudy` field. Screenshots live in `public/work/<project>/`.
- **Background:** `src/content/profile.ts`. **Name, links, production URL:** `src/site.ts` (the URL is defined only there).
- **Résumé and CV:** `public/resume.pdf` and `public/cv.pdf` are byte copies of the source PDFs. Replace them by copying, then check the SHA-256 matches.
- Run `./scripts/check.ps1 fast` after content edits: it checks slugs, links, image sizes and placeholders.

## Contact form

Delivery goes through a hosted form relay set by `NEXT_PUBLIC_CONTACT_ENDPOINT` (and `NEXT_PUBLIC_CONTACT_ACCESS_KEY` if the relay needs one) at build time; see `.env.example`. Without them the form opens the visitor's email app with the message filled in. No secret belongs in these variables: they are public in the page bundle.

## Deployment

The existing Vercel project builds `main` as a static export. `vercel.json` holds redirects for old v1 URLs. Do not create another project or change hosting settings.
