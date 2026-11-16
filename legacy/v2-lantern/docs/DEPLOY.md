# Releasing and rolling back

The site is a Next.js static export. Production is the existing Vercel project connected to this GitHub repository; it deploys `main` to production and builds a preview for every other pushed branch. Do not create a second Vercel project.

## Before the first release of the rebuild

Open the project on vercel.com, then Settings, and confirm these (they could not be read from the repository, so check them once):

| Setting | Expected value |
|---|---|
| Framework Preset | Next.js |
| Root Directory | empty (repository root) |
| Build Command | default (`next build`, or `npm run build`) |
| Output Directory | default (leave the override off; Next.js with `output: 'export'` is handled by the preset) |
| Install Command | default (`npm install`) |
| Node.js Version | 22.x or newer |
| Production Branch (Settings, Git) | `main` |

The rebuild keeps the same framework and the same static export, so no setting should need changing. If any override is switched on with a value from the old site (for example a build command that runs a removed script), switch the override off.

`vercel.json` in the repository only adds redirects for old URLs. It contains no build settings.

## Release

1. Review locally:
   ```
   npm install
   npm run check
   npm test
   npm run build
   npx serve out
   ```
2. Push the branch to get a preview deployment without touching production:
   ```
   git push -u origin feat/rebuild
   ```
   Vercel comments the preview URL on the commit and lists it under Deployments.
3. On the preview URL check: the home page and the four project pages, `/resume.pdf`, a made-up URL (404 page), and the old URLs `/projects/heart-disease/`, `/projects/heart-disease`, `/projects/` and `/projects` (each should redirect to the home page).
4. Release by merging into `main`:
   ```
   git switch main
   git merge --no-ff feat/rebuild
   git push origin main
   ```
   Vercel builds `main` and promotes it to production at the current production URL.
5. Open the production URL, hard-refresh, and repeat the checks from step 3. Paste the URL into a link-preview checker or a private message to confirm the share image.

## Roll back

Fastest, no rebuild: Vercel dashboard, Deployments, find the last production deployment of the old site (commit `cbfc0a9`), open its menu and choose Instant Rollback (or Promote to Production). Production serves the old site again within seconds. While a rollback is active Vercel stops auto-promoting new pushes until you promote a deployment again.

To make the repository match afterwards, revert the merge on `main` rather than rewriting history:
```
git switch main
git revert -m 1 <merge commit>
git push origin main
```

The old site also remains in Git history at `cbfc0a9`.

## Changing the domain

The production URL is defined once, in `src/site.ts`. After a custom domain is connected in the Vercel project's Domains settings, change that one value, rebuild and release. Metadata, the sitemap, robots.txt and the share image all read it.
