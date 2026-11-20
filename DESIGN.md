# Design trial: editorial engineering studio

> **EXPERIMENTAL. Awaiting Tristan's review. Not an approved identity.** This file governs only the `feat/portfolio-direction-trial` branch. It must not be applied to the rest of the site, merged or deployed without his explicit approval.

## Hypothesis

A calm, editorial treatment (mineral reading surfaces, deep blue-black type, one cool accent, fine rules, dark panels for project media) can make Tristan read as a capable engineer at first glance while carrying personality through scale, typography and a small moment of discovery, without a fictional setting or gimmick.

## Tokens

| Role | Value | Use |
|---|---|---|
| Surface | `#ECEBE5` limestone | Page background |
| Surface raised | `#F6F5F1` | Form fields, quiet panels |
| Ink | `#14202E` blue-black | Text, display type |
| Ink muted | `#4A5563` | Secondary text |
| Rule | `#C3C1B6` | Fine structural rules (1px) |
| Accent | `#1F5C8F` steel blue | Links, selection, focus companion |
| Media panel | `#121B26` night | Behind screenshots and the entry viewer |
| On panel | `#E7EAEE` / `#9AA7B6` | Text on the dark panel |

One light treatment. The page does not switch with the OS colour scheme (see "Decisions").

**Type**
- Display and interface: Bricolage Grotesque (variable; optical size gives it character at large sizes). Name, headings, navigation, buttons.
- Reading: Source Serif 4. Summaries, case-study prose, highlights.
- Technical: IBM Plex Mono, only for stacks, dates and figures in tables.
- Scale (1.25 ratio from 17px reading size): 17 / 21 / 26 / 33 / 41 / 52, plus a fluid display size for the name (56–120px).

**Layout:** 12-column grid, max 90rem, 16px mobile gutter. Text is left-aligned throughout; reading measure is about 66ch.

## Composition

```
Entry (desktop)
┌──────────────────────────────┬──────────────────────┐
│ Tristan Morton (display, huge)│  ▓▓ dark viewer ▓▓▓▓ │
│ positioning line (serif)      │  ▓ lead image ▓▓▓▓▓▓ │
│ intro                         │  summary + link      │
│ Work · About · Résumé · Contact│  ─ project 1 (sel.) │
│                               │  ─ project 2..4      │
├──────────────────────────────┴──────────────────────┤
│ Index of work: editorial rows                        │
│ period │ title / what it does / why it matters │ stack│thumb │
└──────────────────────────────────────────────────────┘
Mobile: name → line → intro → links → viewer (image, list) → rows (thumb on top).
```

```
Project page
title (display) + summary (serif) + [Source code] [Live site]
▓▓▓▓ dark media band: images side by side (comparison) ▓▓▓▓
aside (sticky on desktop): contribution, built with, links, on this page
main: at a glance (highlights) → case study sections
previous / next project
```

## Principles

1. **The work is the hero.** Real screenshots appear in the first viewport on desktop; every preview says what a project does and why it is worth a look.
2. **One memorable thing:** the scale of the name against the dark viewer of selected work. Everything else stays quiet.
3. **Structure carries meaning.** Rules separate records; mono marks technical data; no decorative numbering, all-caps eyebrows or arrow-suffixed links.
4. **Motion answers actions.** The viewer cross-fades when a project is selected; links and buttons respond to hover and focus. No load animations or continuous effects. Reduced motion removes the fades.
5. **Atmosphere stays implicit.** Scale and discovery come from type size, space and the dark viewer, not from imagery, lettering or a theme.

## Decisions and adjustments to the brief

- **Résumé prominence:** discovery said the site should not push the résumé; this brief asks that it be easy to find. It is a plain link in the header and the entry links, not a primary button.
- **No OS dark mode in the trial:** "one coherent treatment" is read as a single light treatment with dark media panels. Visitors whose OS prefers dark still get the light page. A dark variant would be a follow-up if the direction is kept.
- **No year-grouped timeline:** the index follows the data `order`, which is not chronological, so a timeline would misstate history. Dates are shown per row instead.
