import { isPh, plain } from '@/data/ph';

/** Renders a data string; invented/pending values get the visible placeholder treatment. */
export function Text({ v, badge = true }: { v: string; badge?: boolean }) {
  if (!isPh(v)) return <>{v}</>;
  return (
    <span data-placeholder="" title="Placeholder: invented or pending. Replace before publishing.">
      <span className="ph-text">{plain(v)}</span>
      {badge && <span className="ph-badge" aria-hidden="true">Placeholder</span>}
    </span>
  );
}

/** Corner ribbon for a whole record that is invented. */
export function PhRibbon({ label = 'Placeholder' }: { label?: string }) {
  return (
    <span className="ph-ribbon" data-placeholder="" title="This whole item is a placeholder.">
      {label}
    </span>
  );
}

/** href helper: placeholder links render inert. */
export function safeHref(v: string | undefined): string | undefined {
  if (!v || isPh(v)) return undefined;
  return v;
}
