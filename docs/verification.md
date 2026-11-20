# Verification

Actual checks and results. Foundation and trial results are kept apart. Automated accessibility checks catch a subset of problems and do not establish WCAG conformance. Browser checks ran in Playwright's Chromium at set viewport sizes; none of this is a real-device test.

## Foundation (`feat/portfolio-rebuild`)

Environment: Windows 11, Node 24.19.0, npm 11.17.0, Next.js 16.4.6, Playwright 1.65.1 (Chromium headless shell 159), local static server (`serve`) on the exported `out/`.

### Check tiers (measured 2026-11-19, warm `node_modules`)

| Tier | What runs | Result | Time |
|---|---|---|---|
| `./scripts/check.ps1 fast` | ESLint, content tests (11) | pass | 22.3 s (first run, cold ESLint cache) |
| `./scripts/check.ps1 quick` | tsc, ESLint, all unit tests (31) | pass | 16.3 s |
| `./scripts/check.ps1 full` | quick, two static builds, 48 browser tests | pass | 81.4 s |

The first `full` run had one ESLint warning from linting the generated `out-relay/` bundle; `out-relay/`, `test-results/` and `playwright-report/` are now ignored by ESLint.

### Scenarios

| Scenario | Evidence | Result |
|---|---|---|
| Entry → featured project → detail with case study | `e2e/navigation.spec.ts` "entry to a featured project…" | pass |
| Project without a case study has a complete page | same file | pass |
| Direct URL, reload, back/forward | same file | pass |
| Invalid slug, hidden project slug, unknown path → 404 status and page with links | same file | pass |
| /work/ lists every public project in data order, none of the hidden ones | same file | pass |
| Current section marked with `aria-current` | same file | pass |
| `/resume.pdf` and `/cv.pdf`: 200, `application/pdf`, SHA-256 equal to the committed files | `e2e/documents.spec.ts` | pass |
| Committed PDFs equal their sources | `sha256sum` on 2026-11-19: résumé `50477bac…659b` = `Morton_Tristan_Resume_2026_SWE.pdf`; CV `6344d87e…f6ef6` = `Morton_Tristan_CV_2026_SWE.pdf` | match |
| Contact, invalid input: per-field errors, `aria-invalid`, described-by, focus to first error | `e2e/contact.spec.ts` | pass |
| Contact, production config (no relay): hands off one `mailto:` with the message, no other external request, never says "sent" | same file | pass |
| Contact, relay config: pending state, disabled button, second click and `requestSubmit` send only once, success only after 200 | `e2e/contact-relay.spec.ts` (relay mocked with `page.route`) | pass |
| Contact, relay 500 and network failure: error with email fallback, message kept, button re-enabled | same file | pass |
| Keyboard: skip link first and visible, moves focus to main; Tab reaches nav; Enter follows | `e2e/accessibility.spec.ts` | pass |
| Reduced motion: OS setting applies; explicit override wins and survives reload; content unchanged | same file | pass |
| axe (WCAG 2.0/2.1/2.2 A and AA rules) on 12 routes + 404, light and dark | same file (26 runs) | 0 violations |
| No horizontal overflow at 320, 390, 1440 px on all 12 routes | `e2e/layout.spec.ts` | pass |
| Long-content stress at 320 px (120-character unbroken title, 30 extra entries) | same file | pass |
| Images: width/height set; first eager, rest lazy | same file | pass |
| Content integrity: unique ids/slugs/orders, https links, repos on own GitHub, image files exist with declared sizes, case-study files exist, no placeholders | `src/content/content.test.ts` | pass |
| Build hygiene: no local paths, retired v1–v3 code, keys or private-key blocks in `out/` | `grep` over `out/` | clean (matches were prose such as "password-authenticated") |

### Manual observations

- Viewed home and a case-study page in the in-app browser (dark scheme): plain, readable, correct reading order.
- Highlights and case study on the same page repeat some facts. Left for the design stage to decide.

### Limits

- No real-device or screen-reader testing. Focus order was checked by automated Tab sequences plus a visual look, not a full manual audit.
- Live contact delivery is untested because no relay is configured; only the integration contract is tested.
- CI (`.github/workflows/ci.yml`) has not run yet: nothing has been pushed.
