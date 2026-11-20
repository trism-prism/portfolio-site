# Portfolio website (showcase rebuild, private)

Tristan Morton's portfolio, rebuilt as a single animated page: code-drawn project covers, interactive demos,
a command palette, glossary tooltips, footer scenes and machine-readable feeds.

> This branch contains marked placeholders and is **not for deployment**. See [PLACEHOLDERS.md](PLACEHOLDERS.md).
> `npm run build` fails until they are all filled or removed.

```
npm install
npm run dev        # http://localhost:3000
npm run check      # TypeScript + ESLint
npm test           # unit, data-integrity and placeholder tests
npm run build:dev  # static export to out/, placeholders only warn
npm run build      # production export, fails on any placeholder
```

Content lives in `src/data/`. How the rebuild maps to the reference analysis, and what was verified, is in
[docs/SHOWCASE-REBUILD.md](docs/SHOWCASE-REBUILD.md).

Optional environment variables:

- `NEXT_PUBLIC_CONTACT_ENDPOINT`: a hosted form relay; without it the form opens the visitor's email app.
- `NEXT_PUBLIC_LIVE_CONTRIBUTIONS=1`: fetch the real GitHub contribution calendar instead of the sample.
