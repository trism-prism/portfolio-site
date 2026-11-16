import { COLORS } from '../scene/geometry';

/** The facet mark: one crystal prism in four flat facets. Same shapes as the favicon. */
export function FacetMark({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M32 6 12 26h20z" fill={COLORS.facetPearl} />
      <path d="M32 6v20h20z" fill={COLORS.cyan} />
      <path d="M12 26h20v32H12z" fill={COLORS.lavender} />
      <path d="M32 26h20v32H32z" fill={COLORS.violet} />
    </svg>
  );
}
