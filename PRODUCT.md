# Product brief

Confirmed with Tristan on 2026-11-19. This is the authority for what the site is for; [docs/rebuild.md](docs/rebuild.md) records how it is built and what is still open.

## What the site is

A portfolio that **displays** Tristan Morton and his work: who he is, what he builds, his skills, interests and capabilities. It does not market him. His message to a recruiter is the advertisement; this site is the product description a reader checks it against.

- **Identity:** Tristan Morton, software engineer working across full stack and AI engineering. Data and analysis work is part of the record but not the headline.
- **Not tied to one job search.** Nothing positions the site for internships versus full-time roles, so it can grow with him without a rewrite.
- **Audience:** recruiters and engineering hiring teams first, arriving from a résumé, LinkedIn or an introduction. Prospective clients second. A freelance or services offer can be added later without restructuring.

## Visitor journeys

1. **Recruiter or engineer checking a claim.** Arrives on the home page or a shared project link, understands who Tristan is and what he works on, opens whichever projects interest them, follows links to code or live versions, and may take the résumé or CV or get in touch.
2. **Someone who wants to reach him.** Finds Contact, LinkedIn, GitHub or email from any page, and can send a message.
3. **Direct or stale link.** A shared project URL works on its own and survives reloads. A wrong or retired URL gets a clear not-found page with a way on; old v1 project URLs redirect.

The site must not funnel visitors down one path, push the résumé, or make access to evidence depend on animation or scrolling.

## Content scope

- **Projects** are the core. Each public project has its own page. A case study is optional per project: some, all or none may have one, and nothing is designed around a fixed number.
- **Current split (changeable by editing data only):**
  - Featured: 2D Visibility & Lighting Engine, Docs Q&A Copilot, Kiln, GengaRate.
  - In the collection: Predicting College Football Upsets, Internship Scout Agent, Heart Disease Prediction, Tripwire.
  - Kept as hidden records, not shown: minivmm, Lucid Blocks Co-op Mod.
  - Not included: third-party forks without own contribution, game prototypes, this site.
- **Background:** current experience, education, skills and interests.
- **Required links everywhere reachable:** LinkedIn, GitHub, résumé (one-page SWE résumé), CV (longer), and a contact form, plus plain email.

## Requirements

- Direct navigation between sections; stable, shareable URLs; meaningful browser history.
- A contact form with validation, clear pending/success/failure states and no duplicate sends. Delivery goes through a hosted form relay configured later; until then the form hands the message to the visitor's own email app and never claims it was sent.
- Accessible: semantic structure, keyboard use, visible focus, readable in light and dark, reduced motion respected by default with a visible override.
- Works as plain static pages; external services and animation never gate content.
- Hosted on the existing Vercel project as a static export.

## Public-content rules

- Facts come from public repositories, the résumé (`public/resume.pdf`) or the CV (`public/cv.pdf`). Every number carries its conditions. No user counts or test counts (carried over from the previous working agreement).
- Link only public repositories. Private work is described without a repo link.
- Formwork appears only in the résumé's public wording: no screenshots, client names, ticket content or internal details.
- No AI authorship attribution anywhere in the repo or site.

## Anti-goals

- A generic template look, or a copy of any other developer's site.
- Ornament that slows down evaluating the work. The lighting engine is a project, not the site's visual gimmick.
- Features nobody asked for: search, command palette, blog, services pages, theme switchers, CMS. These sit in the backlog in docs/rebuild.md with the conditions for adding them.
