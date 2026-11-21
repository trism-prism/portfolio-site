// A four-point star with a faint round halo: section headings, bullets and legend marks.
export function StarGlyph({ color = 'currentColor', size = 12 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="shrink-0">
      <circle cx="6" cy="6" r="5.5" fill={color} opacity=".18" />
      <path d="M6 1 L7 5 L11 6 L7 7 L6 11 L5 7 L1 6 L5 5Z" fill={color} />
    </svg>
  );
}
