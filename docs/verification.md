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

## Design trial (`feat/portfolio-direction-trial`)

Same environment as above. These results show the trial works. They do not mean the design is approved; it awaits Tristan's review.

### Checks (2026-11-19, after the critic-driven revisions)

| Check | Result |
|---|---|
| `./scripts/check.ps1 full` (tsc, ESLint, 31 unit tests, both static builds, 49 browser tests) | pass, 99.7 s |
| Browser tests carried over from the foundation | all pass. Locators changed where the trial renamed things: "Highlights" became "At a glance", the viewer replaced the "Selected work" link list, and the message box is now found by role. The behaviour each test checks is unchanged. |
| New: selected-work viewer keyboard pattern (arrow keys, End, wrap-around, one visible panel) | pass |
| axe on 12 routes + 404, with the OS set to light and to dark (the trial page is light-only in both) | 0 violations |
| No horizontal overflow at 320 / 390 / 1440 px; long-title stress at 320 px | pass after a fix (below) |

### Defects found and fixed during the trial

- All viewer panels showed at once: the panel's `display: grid` overrode the `hidden` attribute. Fixed with `.panel[hidden] { display: none }`.
- Horizontal overflow at 320 px on the Docs Q&A page (67 px) and in the long-title stress test (1,892 px). Grid items took the width of their longest content. Fixed with `minmax(0, 1fr)` columns, `min-width: 0` on grid children and `overflow-wrap: anywhere` on titles.
- The contact section's label "Send a message" made `getByLabel('Message')` ambiguous. The tests now find the field by role.

### Independent critique (one read-only reviewer pass)

Verdict: **revise, keep the direction**. Material findings and what was done:

| Finding | Action |
|---|---|
| Mobile entry showed no work in the first screen | Source order is now name → selected work → introduction; at 390×844 the lead image and summary are in the first screen. |
| The entry's "Start here" links repeated the header and read as a funnel | Removed. |
| The viewer image was a small, unreadable full-app screenshot; only the text link opened the project; inactive tabs looked faint | A new optional `preview` image field gives the engine a cropped demo image. The image and caption are now one pointer target, while the link stays the only tab stop. Inactive tab text is brighter (`#b8c3cf` on `#121b26`). |
| Index rows looked out of date order, and thumbnails were uneven | The index is split into "Featured" (curated, all with images) and "More work, newest first" (Heart Disease and Tripwire `order` swapped). |
| Case studies read as a flat wall of text; secondary links were only in the side column | Decision sub-headings get an accent rule. Each project's other links (Design decisions, Benchmark, Evaluation page) sit beside the main buttons. |
| The footer motion control is odd visible chrome | Restyled to be quiet. **Kept**: the product brief asks for an optional explicit override. |
| Disagreed: the Formwork intern title "positions for internships" | **Kept as is.** It states the current role factually and doesn't target a role type. The intro wording is a draft Tristan will rewrite anyway. |
| Not addressed: "scale and discovery" rests mostly on the name's size; serif everywhere feels uniform; the media band could carry a diagram or benchmark chart | Left for Tristan's review. These are identity questions, not defects. |

### Screenshots (Playwright Chromium, not real devices)

In `docs/screenshots/trial/`: entry at 1440×1000 (fold and full page), 390×844 (fold and full page) and 320 (full page); the engine and Docs Q&A case studies at desktop size, and Docs Q&A on mobile; Kiln (no case study) and Tripwire (no images, mobile); contact at desktop, with validation errors, and on mobile; the entry with reduced motion. Regenerate with `node scripts/capture.mjs` against a served build.

### Trial limits

- The design was judged from screenshots and the in-app browser at set viewport sizes. No real phones, no screen reader.
- Motion was checked only for presence and absence (reduced motion removes the viewer fade). How it feels was not evaluated by anyone but me.
- Pages outside the slice (About, Work and the 404 page) inherit the tokens and type but were not designed. They are readable, and passed the overflow and axe tests.
- `next build` now downloads three Google Fonts at build time, so an offline build fails until they are cached.
