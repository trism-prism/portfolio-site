// Placeholder marking.
//
// This worktree is private. Anything invented, or any field Tristan has no data for yet, is wrapped in
// `ph()` (a string) or carries `placeholder: true` (a record). Both render with a visible amber
// "Placeholder" treatment and a `data-placeholder` attribute, and `npm run build` (the production build)
// fails while either marker survives in the output. Fill or delete them before anything is published.
// The full list lives in PLACEHOLDERS.md.

export const PH_MARK = '[[PH]]';

/** Marks a string as invented or pending. Render it with <Text> so the marker becomes a badge. */
export function ph(text: string): string {
  return PH_MARK + text;
}

export function isPh(text: string | undefined | null): boolean {
  return typeof text === 'string' && text.startsWith(PH_MARK);
}

/** The text without its marker, for places that cannot show a badge (aria labels, feeds). */
export function plain(text: string): string {
  return isPh(text) ? text.slice(PH_MARK.length) : text;
}

/** Feed/JSON output keeps an explicit, greppable marker instead of silently dropping it. */
export function feedText(text: string): string {
  return isPh(text) ? `[PLACEHOLDER] ${plain(text)}` : text;
}
