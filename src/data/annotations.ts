// "How it's built" notes. `target` is a data-annotate value on a real element.
export const annotations = [
  {
    target: 'mark',
    title: 'The prism mark',
    body: 'Hand-drawn SVG, named after the trism-prism handle. It blinks on a 5.6 s cycle and winks on hover; both pause offscreen and stop in Reduced motion.',
  },
  {
    target: 'headline',
    title: 'Proximity type',
    body: 'Each letter of the headline reads the pointer distance and sets its own variable-font weight. Only fine pointers, only in Full motion.',
  },
  {
    target: 'field',
    title: 'Floating tech field',
    body: 'Tiles drift on staggered loops and scroll at slightly different rates per side. They are decorative and hidden from assistive tech.',
  },
  {
    target: 'covers',
    title: 'Code-drawn covers',
    body: 'Every project cover is an SVG scene of that project’s mechanism. They mount near the viewport, share one frame clock, and freeze to a finished frame in Reduced motion.',
  },
  {
    target: 'palette',
    title: 'Command palette',
    body: 'Ctrl/⌘ K opens a plain search and jump list: type to filter, then pick a section, project or action. Each entry runs a page action.',
  },
  {
    target: 'news',
    title: 'Hash labels',
    body: 'The seven-hex labels are FNV-1a hashes of each entry, for a git-log look. They are not real commit IDs.',
  },
  {
    target: 'placeholders',
    title: 'Marked placeholders',
    body: 'Amber dashed items are invented or pending. The production build refuses to finish while any remain.',
  },
  {
    target: 'footer',
    title: 'Footer scenes',
    body: 'Four switchable scenes with SVG characters. The lightroom computes a real visibility polygon from your pointer, like the engine project.',
  },
];
