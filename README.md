# Tristan Morton: portfolio (v3)

One-page personal portfolio. Next.js 16 static export (`output: 'export'`, `trailingSlash: true`), React 19, TypeScript, plain CSS (a tokens file plus CSS modules), Vitest. Dark by default with a light toggle. v3 replicates the structure and look of haffee.dev, filled with my own facts; see `docs/DESIGN.md`.

Earlier versions are archived in `legacy/` (see `legacy/README.md`) and are not built.

## Commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Dev server |
| `npm run check` | Typecheck and lint |
| `npm test` | Vitest (content, heatmap, typewriter, contrast) |
| `npm run build` | Static export to `out/`; preview with `npx serve out` |

## Sections (all on `/`)

Hero, Experience, Skills, Data Structures & Algorithms, Projects, Education, Publications, Certifications, Contact, Footer. Every section renders from a typed file in `src/content/`.

| File | Drives |
|---|---|
| `src/site.ts` | Name, production URL, email, location, GitHub and LinkedIn. The URL lives only here. |
| `src/content/profile.ts` | Hero text, typewriter roles, intro sentence, optional `photo`, social slots |
| `src/content/experience.ts` | Experience cards |
| `src/content/skills.ts` | Skill categories and tiles |
| `src/content/leetcode.ts` | DSA dashboard |
| `src/content/projects.ts` | Project cards (public repos only) |
| `src/content/education.ts` | Education cards |
| `src/content/publications.ts`, `certifications.ts` | Those two sections |

## Filling the blank parts

- **Photo:** put an image in `public/` and set `photo: { src, alt }` in `profile.ts`. Until then the hero shows the "TM" card.
- **Social slots:** LeetCode, Google Scholar and X render only when their `url` in `profile.ts` is non-empty.
- **LeetCode:** the whole dashboard is blank ("—", an empty ring and heatmap). Fill `src/content/leetcode.ts` (the comment there explains each field). Set `url` to show "View Profile". Nothing is fetched at runtime.
- **Publications and Certifications:** the arrays are empty and show "coming soon". Each data file has a commented-out example entry; uncomment and edit it.
- **Resume:** `public/resume.pdf` is a byte copy of `C:\Work\Career\resume-archive\Morton_Tristan_Resume_2026_SWE.pdf`. Replace it by copying, and confirm the SHA-256 matches.

## Contact form

A static export has no backend, so "Send Message" validates the fields and opens a `mailto:` to `site.email` with the subject and body filled in.

## Copy rules

A number appears only with its meaning and conditions, and only if the resume or a public repo backs it. Link only public repos. Formwork uses the resume's public wording only. No user or test counts. No AI attribution.

## Deploy

Vercel deploys `main`. See `legacy/v2-lantern/docs/DEPLOY.md` for the settings and rollback steps (unchanged for v3). `vercel.json` keeps redirects for the old `/projects/...` URLs.
