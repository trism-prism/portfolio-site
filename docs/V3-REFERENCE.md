# v3 reference: haffee.dev, reverse-engineered

v3 copies the structure, look, tone and component grouping of https://www.haffee.dev/ (Hafeez Mohamad's portfolio), filled with Tristan's facts. It is a base. Personalizing comes later. Sections Tristan has no content for (LeetCode, Publications, Certifications) are built and left as empty states.

## Stack observed
- Next.js App Router, Tailwind with shadcn-style HSL tokens, `next/font` (Outfit and JetBrains Mono), Vercel analytics.
- No runtime API calls: LeetCode stats, projects and everything else are static at build time.
- `<html class="dark">` by default, with a sun/moon toggle in the nav that switches to light.

## Tokens (exact)
| Token | Dark | Light |
|---|---|---|
| page background | `#0f172a` (slate-900) | `#ffffff` |
| alt section background (`bg-secondary/30`) | slate-800 `hsl(217.2 32.6% 17.5%)` at 30% | `hsl(210 40% 96.1%)` at 30% |
| card | slightly lighter than the page (`#1e293b` at ~50%) with 1px border `hsl(217.2 32.6% 17.5%)` | white, border `hsl(214.3 31.8% 91.4%)` |
| text | `#f8fafc` | `#1e293b` |
| muted text | `#94a3b8` | `#64748b` |
| accent | `#10b981` (emerald-500); hover `#34d399` | `#10b981`; text-on-light `#065f46` |
| highlight chip bg | `rgba(16,185,129,.2)` | `rgba(16,185,129,.1)` |
| footer bg | `#0d121f` | `#f8fafc` |
| nav bg | `rgba(15,23,42,.8)` + backdrop blur ("glass") + shadow | white at 80% |
| radius | 0.5rem base; cards ~0.75–1rem; buttons and pills fully rounded | |
| fonts | Outfit (headings 700, body 400, nav 500); JetBrains Mono for eyebrows, tech chips, dates, stat labels | |

Type: hero name 56px/700 in accent; section h2 48px/700; eyebrow 14px mono, uppercase, letter-spaced, accent; a short accent underline bar (~64px × 3px) under each h2. Section padding `py-24`; sections alternate page / alt background.

## Page order and components (single page, anchors)
1. **Header** (fixed, glass): wordmark `Tristan.` (dot in accent) · nav `Home /Experience /Skills /Projects /Education /Publications` (active link in accent with an underline, scroll-spy) · divider · theme toggle · outlined accent pill button "Let's Talk" → #contact.
2. **Hero** `#hero` (min-h 90vh, two columns, photo right): "Hello, I'm" (muted) · name (two lines, accent, 56px) · typewriter line in mono: "A " + roles typed and deleted in a loop · intro paragraph with highlighted words (accent mono chips around key words, like his `0's` and `1's`) · row of square social icon buttons (brand-coloured tiles: LinkedIn, Google, GitHub, LeetCode, X) · solid accent pill button with a download icon "RESUME". Photo: rounded card, slightly rotated, soft shadow. Content fades/slides in on load.
3. **Experience** `#experience`, eyebrow "MY CAREER PATH", h2 "Professional Experience". A vertical timeline line in accent on the left, one card per role: logo tile, title, company (accent, with external-link icon), date pill in mono on the right with a calendar icon, chevron to expand/collapse. Tech chips (mono, small, muted bg) under the header. Expanded: summary paragraph, then "KEY PROJECTS & CLIENTS" sub-label with nested sub-cards (logo, name, chips, `▹` bullets). First card open by default, others collapsed.
4. **Skills** `#skills` (alt bg), eyebrow "MY ARSENAL", h2 "Technical Skills". Row of category pill tabs with a count badge (active = solid accent). Below, a grid of square icon tiles (icon + name). Footer line in mono: "N Categories · N Technologies".
5. **DSA** `#dsa`, eyebrow with an icon "PROBLEM SOLVING", h2 "Data Structures & Algorithms". Top stat card in four columns: Max Rating · Level (badge) · Global Ranking · Attended. Below, two cards: "Overview" (donut ring of solved / total, Easy/Medium/Hard rows coloured teal/amber/red, "View Profile ↗") and the submission heatmap (52-week grid, month labels, "Total active days" and "Max streak", Less→More legend).
6. **Projects** `#projects`, eyebrow "PROJECT SHOWCASE", h2 "Innovative Projects". 2-column grid of cards: cover image on top, title, description, "KEY FEATURES" label, `▹` bullets, tech chips, links.
7. **Education** `#education` (alt bg), eyebrow "ACADEMIC JOURNEY", h2 "My Education". One wide card for the degree (cap icon, degree title, school in accent with external-link icon, accent date pill, paragraph, "RELEVANT COURSEWORK" mono chips), then smaller cards in two columns for earlier schooling.
8. **Publications** `#publications`, eyebrow "RESEARCH & PAPERS", h2 "My Publications". Card: paper image left with "AUTHORS" chips and a full-width "Read Paper →" button; right: title, Publisher / Date / Conference / DOI rows, "ABSTRACT" with "Read Full Abstract" toggle.
   Then **Certifications** (same section), eyebrow "CREDENTIALS", h2 "My Certifications": 2-column cards with certificate image, title, issuer logo + name + date, description, skill chips, external-link icon.
9. **Contact** `#contact` (alt bg), eyebrow "REACH OUT", h2 "Let's Connect". Left: "Get in Touch", paragraph, info cards (EMAIL, LOCATION) with icon tiles, "Social Profiles" icon row, full-width "Download Resume" button. Right: form card (Your Name, Your Email, Your Message, "Send Message" with a send icon).
10. **Footer**: wordmark, the intro sentence, socials in two columns with icons, divider, "© 2026 Tristan Morton. All rights reserved."

## Tone and word choice
Confident, first-person, slightly grand ("Driven by a passion to…", "I thrive on…", "Innovative Projects", "My Arsenal"). Eyebrow + title pairs. Experience bullets are dense, metric-led, past-tense action verbs. Contact copy: "I'm always open to discussing new opportunities, creative ideas, or opportunities to be part of your visions."

For Tristan, keep the same voice and labels but follow the repo copy rule: a number appears only if a public repo or the résumé backs it.

## Reference screenshots
Taken at 1440×900, dark mode, and kept out of the repo: `01-hero` … `10-footer` in the session scratchpad `haffee/` folder.
