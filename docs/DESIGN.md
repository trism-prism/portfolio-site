# Design: constellations & cartography

The single source of truth for how this site looks, moves and speaks. Implementation handoffs cite
sections of this file; anything not covered here is a design question, not an implementation choice.

- **Branch:** `feat/showcase-rebuild` (private, see [PLACEHOLDERS.md](../PLACEHOLDERS.md)).
- **Owner approval:** only items under **Decided** are approved by Tristan. Everything under **Proposed**
  came from the lab mockups and needs his call before it is built.
- **Evidence:** hero labs at `/lab/cartography` (chosen) and `/lab/refraction` (not chosen); section mockups
  in `docs/design/mockups/` (unprefixed = constellations, `refraction-*` = rejected alternative).

## 1. Decided (Tristan, 2026-11-20)

| Decision | Detail |
|---|---|
| Base | The showcase build stays the foundation: feature-rich, animated, personal. The Nov 19 answer sheet's restraint no longer governs. |
| Theme | Dark is the default; a properly designed light option is required. |
| Palette | Prismatic spectrum: mostly neutral, with a restrained spectrum used as signal colour. |
| Motif | **Constellations & cartography** carries the personal references (wonder, scale, discovery, traces of history). Chosen over light & refraction after comparing six sections in both. |
| Prism character | Keeps its full role: logo, roaming heading mascot, footer cast. Art can be refined. |
| Terminal styling | Removed: no shell prompt, `cd` commands, git-push confirmation or git-hash labels. |
| Tech tiles | Kept, with the same content, restyled to the motif. |
| Impression | **Craft and care**: obsessive attention to detail; everything made by hand and made well. |
| Themed vocabulary | **Structure, plain words.** Map, route, legend and constellation names are real features; labels and most titles use plain words. No catalogue numbers (TM-001), log numbers, compass bearings or "Set a course"-style copy. A recruiter never decodes a term. |
| Name in the hero | **Sacramento** (handwritten monoline script, SIL OFL), chosen over Pinyon Script, Herr Von Muellerhoff, Caveat and Yellowtail (`docs/design/mockups/name-01-scripts.png`). Used for the name and signature only; small chart labels such as constellation names stay in Instrument Serif italic. Yellowtail is retired. |
| Skills | **Keep the moving marquee rails**, restyled to the motif. Not constellation cells. |
| Footer scenes | **Recast all four into the night-sky world** as a switchable set. |
| Light mode | **Twilight sky**: a pale dusk-blue sky with soft stars still visible, not a paper atlas. **Values approved** as shown in `docs/design/mockups/theme-*` (token table in section 3). |
| Cards | **Keep rounded cards**, restyled to the new palette. No square plates or corner registration ticks. |
| Experience + education | **Merged into one "route" section**: route map across both, detail cards below. |
| Project cover animations | **Keep the current cover scenes and their drawing style**; at most recolour them to the new palette. Do not redraw them as star charts. |

## 2. Principles (proposed)

1. **The work is the brightest object.** Projects and evidence get the strongest contrast and the most space;
   decoration never competes with a heading, a number or a link.
2. **The motif is structure, not lore.** A themed element must also do a job: the sky map *is* the filter,
   the route *is* the timeline. Purely decorative themed wording is kept rare, and a recruiter never has
   to decode a term to find a fact.
3. **Facts stay plain.** Titles, dates, roles, numbers and their conditions use ordinary words.
4. **Motion like a night sky.** Slow, sparse and interruptible: stars twinkle, lines draw once, the route
   travels once. Nothing loops fast. Reduced motion shows the finished frame.
5. **Precision is the craft.** Hairline rules, exact alignment, consistent tick marks and spacing. Every
   chart element sits on the same grid as the text.

## 3. Tokens (proposed, from the mockups)

**Colour (dark)**

| Token | Value | Use |
|---|---|---|
| `sky` | `#07080d` | Page background |
| `sky-raised` | `rgba(12,13,24,.72)` | Plates/panels over the sky |
| `ink` | `#eceaf3` | Primary text, constellation lines (at low opacity) |
| `ink-2` | `#a9a6b8` | Secondary text |
| `ink-3` | `#77748a` | Labels, captions, chart annotations |
| `rule` | `rgba(255,255,255,.09)` | Hairlines, plate borders |
| `software` | `#5eead4` | Project/skill kind colour |
| `systems` | `#60a5fa` | Project/skill kind colour |
| `ai` | `#a78bfa` | Project/skill kind colour |
| `data` | `#fbbf24` | Project/skill kind colour |
| `rose` | `#f472b6` | Education, honours |
| `route` | `#fbbf24` | "You are here", routes, the current position |
| `accent-serif` | `#cfc9f5` | Serif accent words in headings |

Kind colours follow the idea that astronomers class stars by their spectrum: each project type has a
spectral colour, used for its star, its legend mark and its plate corners, never for body text.

**Colour (light): twilight sky** (approved by Tristan, 2026-11-20)

Source of truth for both themes: `src/components/lab/themeTokens.ts`. Every text and signal colour is
tested at WCAG AA (4.5:1) against each sky stop and against cards composited on them
(`src/components/lab/tokens.test.ts`, 22 checks, all passing). Comparison: `docs/design/mockups/theme-*`.

| Token | Dark | Twilight |
|---|---|---|
| Sky top / mid / horizon | `#141428` / `#0a0b16` / `#05060b` | `#b8c6e0` / `#cdd7e9` / `#ecdfd8` (dusk blue warming to the horizon) |
| `ink` / `ink-2` / `ink-3` | `#eceaf3` / `#a9a6b8` / `#8a879c` | `#131a2e` / `#35405e` / `#47506e` |
| Card fill / border | `rgba(17,18,32,.74)` / `rgba(255,255,255,.09)` | `rgba(250,251,255,.62)` / `rgba(19,26,46,.12)`, with a soft shadow |
| Stars | white | white with a faint navy halo so they stay visible on a pale sky |
| Constellation lines | `rgba(236,234,243,.35)` | `rgba(19,26,46,.42)` |
| Serif accent | `#cfc9f5` | `#563ca7` |
| Buttons | `#eceaf3` on `#07080d` | `#f4f6fb` on `#131a2e` |
| Software / Systems / AI / Data | `#5eead4` / `#60a5fa` / `#a78bfa` / `#fbbf24` | `#095951` / `#1944bd` / `#6026c5` / `#7b4304` |
| Rose / Route | `#f472b6` / `#fbbf24` | `#99144e` / `#8b3708` |

In twilight, project covers stay on dark panels (`#0d1220`) so the cover animations are unchanged, per the
decision in section 1. The footer ground stays dark (`#1b2240`) in both themes.

**Type**
- Display: Bricolage Grotesque, bold, tight tracking (headings, names, numbers).
- Accent: Instrument Serif italic (one accent word per heading; constellation names).
- Signature: Sacramento, for the owner's name (hero, footer signature) only.
- Body: Inter.
- Chart labels: JetBrains Mono, uppercase, wide tracking, small (11–12px); only for annotations, never prose.

**Layout:** content width 1152px, 24px gutters; sections 96px vertical padding on desktop, 64px on mobile.

## 4. Component vocabulary (proposed)

| Component | Description | Mockup |
|---|---|---|
| Sky backdrop | Sparse seeded star field and faint graticule arcs behind every section; no blur washes. | all |
| Chart header | Four-point star + section number + label; right-aligned annotation; display title with serif accent; ruler-style rule with major/minor ticks; the prism seated on the rule. | all |
| Card | **Decided:** the existing rounded card, restyled (sky-raised fill, hairline border, kind colour as a small accent). Square plates with corner ticks were rejected. | — |
| Star glyph | Four-point star in a kind colour; used as bullet, legend mark and timeline node. | all |
| Legend chip | Filter control with star glyph and count (shape follows the rounded card language). | projects |
| Chart marker | Ringed plate with tick marks; replaces the floating tech tiles' style. | hero |
| Route | Dashed gold path with waypoints; hollow waypoint = ahead. | hero, journey |

## 5. Section map (proposed)

| Section | Treatment | Status |
|---|---|---|
| Hero | Charted sky; the featured projects form "the Prism" constellation; route from "you are here"; coordinates of Leesburg; chart-marker tech tiles. | Lab |
| About | Not mocked yet. | Open |
| Experience + education | One merged section: route map plus detail cards. Plain title (e.g. "Experience & education"). | Decided |
| Skills | Existing marquee rails, restyled. | Decided |
| Projects | Sky map whose legend is the filter; spotlight card and cards for the rest using the **existing cover animations**; full list below. | Mocked |
| Project detail | Case-study layout with measurements, at-a-glance and a margin chart of where it sits. | Mocked |
| Achievements, Focus areas, Stats | Not mocked yet. | Open |
| Activity | Plain dates and type labels on the timeline; no entry numbers or hashes. | Decided |
| Contact + footer | Contact plates and form; footer horizon with the Prism constellation and the seated character. | Mocked |
| Footer scenes | Four scenes recast into the night sky; scene concepts still to design. | Decided, design open |

## 6. Open decisions

Recorded answers move to section 1. Recommendations are the advisor's, not decisions.

1. **Footer scene concepts** (proposed, frames in `docs/design/mockups/footer-*`, specs in `src/components/lab/FooterLab.tsx`):
   - **Lantern** (replaces Lightroom): pointer moves the prism's lantern among standing stones; real visibility polygon; lit people wave, shadowed people doze.
   - **Star trails** (replaces Game day): scroll speed is a long exposure turning the sky around the pole star; scrolling back rewinds.
   - **Name the constellation** (replaces Trivia): stars form a figure from one project; the right guess sends a shooting star to the email button.
   - **Orbit** (recast): the cast circle the prism on a hilltop; holding the email button speeds them up and the stars streak.
   All four keep the interaction of the scene they replace, stay on a night sky in both themes, and have a defined Reduced-motion frame.
2. **Sections not mocked yet**: About, Achievements, Focus areas, Stats.
3. **Cover recolouring**: whether the existing covers need any colour change at all once the palette lands.

## 7. Handoff rules

Each implementation handoff states: goal; files it may touch and must not touch; the sections of this file
it follows; acceptance checks (`npm run check`, `npm test`, `npm run build:dev`, screenshots at 1440px and
375px, Reduced motion). One implementer at a time in this worktree: `globals.css`, tokens and `Stage.tsx`
are shared by almost everything. The advisor reviews each result in the browser before the next one starts.
