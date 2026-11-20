# History

Earlier versions of this site are kept in Git for reference only. **They are deprecated and have no authority over the current site**: their designs, layouts, copy, design documents and agent prompts are not requirements. The current product brief is [PRODUCT.md](../PRODUCT.md).

| Ref | Commit | What it is |
|---|---|---|
| `main` / tag `v1-original` | `cbfc0a9` | v1, the original site. Still what production serves until a release replaces it. |
| tag `v2-lantern` | `d7790e6` | v2 "lantern" experiment. |
| branch `feat/rebuild`, tag `preserve/feat-rebuild-2026-11-19` | `1e5b867` | v3, a single-page replica of another developer's portfolio structure. |

This rebuild (`feat/portfolio-rebuild`) started from `main` at `cbfc0a9` on 2026-11-19 and removed the v1 application. Project screenshots under `public/work/` were carried over from v3 and checked against the project repositories.

The tags hold committed state only. Uncommitted work that existed in the original checkout when the rebuild started was left in that checkout, untouched.

## Retrieving an old version

```powershell
git show v1-original:src/app/page.tsx          # read one file
git worktree add ..\portfolio-v1 v1-original   # check out a whole version beside this one
```

Do not copy old code or documents back into this tree without a current reason recorded in [docs/rebuild.md](rebuild.md).
