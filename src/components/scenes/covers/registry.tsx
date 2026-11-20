'use client';

import type { CoverKey } from '@/data/projects';
import type { SceneProps } from '../Stage';
import { DocsQaCover, GengaRateCover, KilnCover, VisibilityCover } from './CoversA';
import { CfbCover, HeartCover, LucidCover, MinivmmCover, PortfolioCover, ScoutCover, TripwireCover } from './CoversB';

// Each project maps to its own scene. `frozenAt` is the informative frame shown in Reduced motion.
export const covers: Record<CoverKey, { Scene: React.ComponentType<SceneProps>; frozenAt: number; label: string }> = {
  visibility: { Scene: VisibilityCover, frozenAt: 2.2, label: 'A light among walls with its computed visibility polygon, a ray walking grid cells, and wall-test counts for brute force versus the grid.' },
  docsqa: { Scene: DocsQaCover, frozenAt: 5.2, label: 'PDF pages become a vector field; a question retrieves nearby chunks and an answer appears with page citations.' },
  kiln: { Scene: KilnCover, frozenAt: 8.4, label: 'Syllabus tasks fill weekday time budgets, one is deferred by binary search, then the plan is encrypted, synced and paired with a six-digit code.' },
  gengarate: { Scene: GengaRateCover, frozenAt: 6.2, label: 'AniList titles import with a rate-limit pause, land as rated cards, and two tabs take turns on a lock to refresh the session.' },
  cfb: { Scene: CfbCover, frozenAt: 7.2, label: 'Brier scores for a naive baseline and the betting spread, and an audit that flags leaked rows and corrects the skill score from 32% to 27%.' },
  scout: { Scene: ScoutCover, frozenAt: 5.9, label: 'Postings are scored by an agent that fetches details through a guarded tool, shown on a 0 to 100 gauge, and sent as a digest.' },
  heart: { Scene: HeartCover, frozenAt: 6.8, label: 'A threshold slides to recall of at least 0.90, logistic regression wins on precision, and 27 of 28 sick test patients are caught.' },
  tripwire: { Scene: TripwireCover, frozenAt: 5.6, label: 'News events land every 15 minutes; a country’s count breaks above its median plus MAD band and the map raises an alert.' },
  minivmm: { Scene: MinivmmCover, frozenAt: 6.2, label: 'Guest code exits to the VMM on I/O, MMIO and halt; the VMM handles each exit, resumes, and the console prints Hello.' },
  lucid: { Scene: LucidCover, frozenAt: 7.6, label: 'A five-message ownership handoff crosses a lossy link with one resend, then a broken block triggers a small diff rescan instead of a full resync.' },
  portfolio: { Scene: PortfolioCover, frozenAt: 5.2, label: 'This site in miniature: hero, a grid of animated cards, and the command palette typing cd projects.' },
};
