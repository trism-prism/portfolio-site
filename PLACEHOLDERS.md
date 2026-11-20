# Placeholders

This branch is **private**. It must not be merged to `main`, deployed, or made public until every item
below is either filled with accurate information or deleted.

Three safeguards enforce that:

1. Every invented value is wrapped in `ph()` or carries `placeholder: true` in `src/data/`. On the page it
   renders with an amber dashed outline and a "Placeholder" badge, and carries `data-placeholder`.
2. `npm run build` (production) **fails** while any placeholder marker reaches `out/`
   (`scripts/placeholder-guard.mjs`). `npm run build:dev` only warns.
3. While any placeholder exists the site emits `noindex, nofollow` and `robots.txt` disallows everything.

`npm test` checks that every data placeholder is listed here (`src/data/data.test.ts`), so this file cannot
silently fall behind the data.

## How to fill one

- Replace `ph('…')` with the real string, or delete the record.
- Remove `placeholder: true` from a record once all its fields are real.
- If a whole category has no real data (certifications, badges, competitions, coding profiles), delete the
  records; the sections render fine with fewer items, and you can drop a section from `src/app/page.tsx`.

## Data placeholders (generated from `findDataPlaceholders()`)

| Path | Current placeholder value | File | Note |
|---|---|---|---|
| `data.personal.links.schedule` | https://cal.com/your-link | `src/data/personal.ts` | No scheduling link exists. The contact card and palette command stay hidden/inert until this is real. |
| `data.personal.about.cards[3].text` | Outside of code: gaming, time with friends and family, and building small tools whenever something annoys me twice. | `src/data/personal.ts` | Drafted from the old site's About copy; needs your own words. |
| `data.personal.about.facts[3].value` | Summer 2027 SWE internships | `src/data/personal.ts` |  |
| `data.personal.easterEgg` | You found the prism. Every light here is computed, not painted. Say hi and mention the code. | `src/data/personal.ts` |  |
| `data.experience[1]` | (whole record) | `src/data/experience.ts` | JMU Recreation is real (from the v3 data), but the role, dates and summary are invented. |
| `data.experience[1].role` | Student Staff | `src/data/experience.ts` |  |
| `data.experience[1].period` | 2025 â€“ Present | `src/data/experience.ts` |  |
| `data.experience[1].summary` | Front-desk and facility operations for the university recreation center. | `src/data/experience.ts` |  |
| `data.education[0].period` | Aug 2024 â€“ Expected Dec 2027 | `src/data/education.ts` | Only the start month "Aug 2024" is invented; "Expected Dec 2027" is real. Split it back out when the start date is known. |
| `data.education[0].extras[1].items[0]` | ACM student chapter | `src/data/education.ts` |  |
| `data.education[0].extras[1].items[1]` | Hackathon team (JMU HackMadison) | `src/data/education.ts` |  |
| `data.secondarySkills[1].items[0]` | Writes decisions down | `src/data/skills.ts` |  |
| `data.secondarySkills[1].items[1]` | QA mindset | `src/data/skills.ts` |  |
| `data.secondarySkills[1].items[2]` | Clear bug reports | `src/data/skills.ts` |  |
| `data.secondarySkills[1].items[3]` | Pairs well with designers | `src/data/skills.ts` |  |
| `data.contributions[1]` | (whole record) | `src/data/projects.ts` |  |
| `data.contributions[1].repo` | owner/repo | `src/data/projects.ts` |  |
| `data.contributions[1].title` | Fix a docs typo in a library you used | `src/data/projects.ts` |  |
| `data.contributions[1].href` | https://github.com/owner/repo/pull/1 | `src/data/projects.ts` |  |
| `data.contributions[2]` | (whole record) | `src/data/projects.ts` |  |
| `data.contributions[2].repo` | owner/another-repo | `src/data/projects.ts` |  |
| `data.contributions[2].title` | Add a missing test for an edge case | `src/data/projects.ts` |  |
| `data.contributions[2].href` | https://github.com/owner/another-repo/pull/2 | `src/data/projects.ts` |  |
| `data.certifications[0]` | (whole record) | `src/data/achievements.ts` |  |
| `data.certifications[0].name` | AWS Certified Cloud Practitioner | `src/data/achievements.ts` |  |
| `data.certifications[0].issued` | 2027-02 | `src/data/achievements.ts` |  |
| `data.certifications[0].expires` | 2030-02 | `src/data/achievements.ts` |  |
| `data.certifications[1]` | (whole record) | `src/data/achievements.ts` |  |
| `data.certifications[1].name` | GitHub Actions | `src/data/achievements.ts` |  |
| `data.certifications[1].issued` | 2027-03 | `src/data/achievements.ts` |  |
| `data.certifications[2]` | (whole record) | `src/data/achievements.ts` |  |
| `data.certifications[2].name` | Microsoft Power BI Data Analyst (PL-300) | `src/data/achievements.ts` |  |
| `data.certifications[2].issued` | 2027-04 | `src/data/achievements.ts` |  |
| `data.badges[0]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[0].label` | Cloud Essentials | `src/data/achievements.ts` |  |
| `data.badges[1]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[1].label` | Intro to Generative AI | `src/data/achievements.ts` |  |
| `data.badges[2]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[2].label` | Git Fundamentals | `src/data/achievements.ts` |  |
| `data.badges[3]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[3].label` | SQL Practitioner | `src/data/achievements.ts` |  |
| `data.badges[4]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[4].label` | Docker Basics | `src/data/achievements.ts` |  |
| `data.badges[5]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[5].label` | Linux Essentials | `src/data/achievements.ts` |  |
| `data.badges[6]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[6].label` | Data Visualization | `src/data/achievements.ts` |  |
| `data.badges[7]` | (whole record) | `src/data/achievements.ts` |  |
| `data.badges[7].label` | Secure Coding | `src/data/achievements.ts` |  |
| `data.honors[2]` | (whole record) | `src/data/achievements.ts` |  |
| `data.honors[2].title` | President's List | `src/data/achievements.ts` |  |
| `data.honors[2].when` | Fall 2025 | `src/data/achievements.ts` |  |
| `data.honors[2].detail` | Semester GPA recognition. | `src/data/achievements.ts` |  |
| `data.competitions[0]` | (whole record) | `src/data/achievements.ts` |  |
| `data.competitions[0].event` | HackMadison 2026 | `src/data/achievements.ts` |  |
| `data.competitions[0].result` | 2nd place, Best Use of Data | `src/data/achievements.ts` |  |
| `data.competitions[0].when` | 2026-03 | `src/data/achievements.ts` |  |
| `data.competitions[1]` | (whole record) | `src/data/achievements.ts` |  |
| `data.competitions[1].event` | JMU CIS Case Competition | `src/data/achievements.ts` |  |
| `data.competitions[1].result` | Finalist | `src/data/achievements.ts` |  |
| `data.competitions[1].when` | 2025-11 | `src/data/achievements.ts` |  |
| `data.competitions[2]` | (whole record) | `src/data/achievements.ts` |  |
| `data.competitions[2].event` | LeetCode Weekly Contest | `src/data/achievements.ts` |  |
| `data.competitions[2].result` | Top 10% | `src/data/achievements.ts` |  |
| `data.competitions[2].when` | 2026-07 | `src/data/achievements.ts` |  |
| `data.news[11]` | (whole record) | `src/data/news.ts` | JMU start date is invented (same as the education start month). |
| `data.news[11].title` | Started at James Madison University | `src/data/news.ts` |  |
| `data.news[13]` | (whole record) | `src/data/news.ts` |  |
| `data.news[13].title` | HackMadison 2026: 2nd place | `src/data/news.ts` |  |
| `data.news[13].detail` | Best Use of Data track. | `src/data/news.ts` |  |
| `data.codingProfiles[0]` | (whole record) | `src/data/stats.ts` |  |
| `data.codingProfiles[0].handle` | your-handle | `src/data/stats.ts` |  |
| `data.codingProfiles[0].href` | https://leetcode.com/u/your-handle/ | `src/data/stats.ts` |  |
| `data.codingProfiles[0].figures[0].value` | 312 | `src/data/stats.ts` |  |
| `data.codingProfiles[0].figures[1].value` | 1,684 | `src/data/stats.ts` |  |
| `data.codingProfiles[0].figures[2].value` | 18 | `src/data/stats.ts` |  |
| `data.codingProfiles[1]` | (whole record) | `src/data/stats.ts` |  |
| `data.codingProfiles[1].handle` | your-handle | `src/data/stats.ts` |  |
| `data.codingProfiles[1].href` | https://codeforces.com/profile/your-handle | `src/data/stats.ts` |  |
| `data.codingProfiles[1].figures[0].value` | 1,402 | `src/data/stats.ts` |  |
| `data.codingProfiles[1].figures[1].value` | Specialist | `src/data/stats.ts` |  |
| `data.codingProfiles[1].figures[2].value` | 11 | `src/data/stats.ts` |  |

## Placeholders outside `src/data/`

| Where | What | Why |
|---|---|---|
| `src/components/sections/About.tsx` (Avatar) | Silhouette with a "Photo" ribbon | No portrait was provided. Add an image and remove the ribbon. |
| `src/components/sections/Projects.tsx` ("Community & writing") | Invented description of future write-ups | No posts, talks or community answers exist yet. |
| `src/components/sections/Stats.tsx` (Heatmap) | Seeded synthetic contribution calendar | Live data is off by default so this private build never sends your GitHub username to a third-party API. Set `NEXT_PUBLIC_LIVE_CONTRIBUTIONS=1` to fetch real data. |
| `src/components/shell/Chrome.tsx` (Konami badge) | Shows `personal.easterEgg` | Invented message. |
| `src/components/footer/Footer.tsx` | "Private preview" notice | Disappears automatically when no data placeholders remain. |

## Things that are real but need a decision before publishing

- **Contact delivery.** No form relay is configured, so the form hands the message to the visitor's email
  app and says so. Set `NEXT_PUBLIC_CONTACT_ENDPOINT` to a hosted relay to send directly.
- **Draft wording.** `personal.interests` and `personal.intro` come from the foundation draft
  (`docs/rebuild.md` in the foundation worktree marks them as needing your words).
- **Formwork.** Described with the résumé's public bullets only. Confirm you are happy with that wording
  appearing on a public page (the old site used a shorter approved paragraph).
- **This portfolio as a project.** PRODUCT.md in the foundation worktree excluded "this site" from the
  project list; it is included here as an "In progress" card. Delete project id 11 to follow the brief.
- **minivmm and Lucid Blocks.** PRODUCT.md kept these hidden; here they are listed. Remove them from
  `src/data/projects.ts` to follow the brief.
- **Docs Q&A terminal demo** uses an illustrative unanswerable question ("capital of Peru"); it is labelled
  as a scripted demo, not real output.
- **Heart-disease threshold demo** uses seeded synthetic scores and says so on screen.

