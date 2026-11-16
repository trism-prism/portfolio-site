# Legacy versions

Both earlier versions of this site are kept here for reference. They are deprecated, are not built, linted or tested (see `tsconfig.json`, `eslint.config.mjs` and `vitest.config.ts`), and are not deployed.

| Version | Folder | Git tag | Commit | What it is |
|---|---|---|---|---|
| v1 "original" | `legacy/v1-original/` | `v1-original` | `cbfc0a9` (the old `main`) | The first site: Next.js with MDX content and Tailwind. A full tree, minus `package-lock.json`. |
| v2 "lantern" | `legacy/v2-lantern/` | `v2-lantern` | `d7790e6` | The lantern-scene site: Next.js static export, plain CSS modules, case-study pages. Holds its `src/`, docs, screenshots, `README.md`, `vercel.json`, `next.config.ts` and `package.json`. Its images still live in `public/work/` at the repo root. |

## Running one

The simplest way is to check out the tag in a separate worktree, which gives a complete, buildable tree:

```
git worktree add ../portfolio-v2 v2-lantern
cd ../portfolio-v2 && npm install && npm run dev
```

Use `v1-original` the same way. The tags are local; push them only if you want them on the remote.
