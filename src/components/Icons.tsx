import type { ReactNode } from 'react';

type P = { size?: number; className?: string };

function Stroke({ size = 20, className, children }: P & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const CalendarIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Stroke>
);
export const ChevronIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m6 9 6 6 6-6" />
  </Stroke>
);
export const ExternalIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </Stroke>
);
export const DownloadIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Stroke>
);
export const SendIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m22 2-7 20-4-9-9-4zM22 2 11 13" />
  </Stroke>
);
export const MailIcon = (p: P) => (
  <Stroke {...p}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </Stroke>
);
export const PinIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Stroke>
);
export const SunIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Stroke>
);
export const MoonIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </Stroke>
);
export const MenuIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Stroke>
);
export const CloseIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Stroke>
);
export const CapIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m22 10-10-5L2 10l10 5 10-5ZM6 12v5c3 2 9 2 12 0v-5" />
  </Stroke>
);
export const CodeIcon = (p: P) => (
  <Stroke {...p}>
    <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
  </Stroke>
);
export const BookIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14ZM20 17v4H6.5A2.5 2.5 0 0 1 4 18.5" />
  </Stroke>
);
export const AwardIcon = (p: P) => (
  <Stroke {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="m8.2 13.9-1.2 8L12 19l5 2.9-1.2-8" />
  </Stroke>
);
export const FolderIcon = (p: P) => (
  <Stroke {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
  </Stroke>
);
