## The problem

Benefits and policy documents are long, dense and full of exact terms. A question like "how much do I owe per day after day 60 in hospital" has one right answer on one page, and a confident wrong answer is worse than none. The goal was a question-answering app that cites the exact page for every claim, says "not found" when the documents do not answer, and publishes how often it is right.

## What I built

- A retrieval-augmented app over 296 pages (1,182 chunks) of two public documents: the 2026 FEHB Blue Cross Blue Shield brochure and Medicare & You 2027.
- Answers stream with page-level citations. Each retrieved chunk is sent as its own document and never crosses a page, so every citation maps to exactly one page.
- An evaluation harness that calls the same answer function as the API, scored by a deterministic rule-based scorer, and a public evaluation page that shows every measure and every failure.
- A public demo where each visitor brings their own Anthropic API key, kept in their browser tab, so the deployment has no model bill. Uploads are private to an anonymous cookie and expire.

## Decisions that mattered

### Let the evidence pick the retrieval method

Hybrid search with full-text matching looked like an obvious fit for documents full of exact terms. On the development set it did worse than plain vector search (MRR 0.920 at best, against 0.951), so I removed it. Larger result counts, other chunk sizes and chunk prefixes did not help either.

### Fix the input before tuning the model

Error analysis showed PDF extraction splitting words apart ("Pr eferr ed Pr ovider"). Fixing the spacing threshold from measured gaps was the biggest single improvement: development-set accuracy went from 80% to between 90% and 100% across runs.

### Keep everything in Postgres

pgvector handles search, and rate limits and upload expiry live in ordinary tables, with raw SQL and no ORM. Embeddings (`bge-small-en-v1.5`) run locally in the Node process, so there is no embedding bill; the cost is a larger function bundle and a model download on cold start.

## Evidence

| Split | Questions | Answers correct | Citation accuracy |
|---|---|---|---|
| All | 50 | 46 (92.0%) | 95.2% |
| Held out, never used for tuning | 30 | 28 (93.3%) | 92.0% |
| Development, used for tuning | 20 | 18 (90.0%) | 100% |

An answer counts as correct only if it contains every required fact and at least one citation lands on a page that states it. All 8 unanswerable questions got an explicit "not found" with no citations. The held-out questions were run once, after the code froze.

## Limits

- Fifty questions is a small set: one question moves a split by 3 to 5 points, and the same code scored 100%, 95% and 90% on the development set across three runs.
- Held-out MRR (0.658) is well below development (0.951), so the right passage often ranks lower on unseen questions.
- The questions were written from the documents and audited by sampling, not by a benefits expert.
- The scorer uses regular expressions, so an unusual correct wording can fail and a wrong answer with a matching term could pass.
- Multi-column tables lose their columns on extraction, which caused two of the four failures. Scanned PDFs are rejected.
