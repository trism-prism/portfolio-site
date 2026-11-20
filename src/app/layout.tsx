import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Instrument_Serif, Inter, JetBrains_Mono, Yellowtail } from 'next/font/google';
import { personal } from '@/data/personal';
import { hasPlaceholders } from '@/data/audit';
import { MotionProvider } from '@/lib/motion';
import { motionBootScript, themeBootScript } from '@/lib/boot';
import { ThemeController } from '@/components/shell/Theme';
import { Nav } from '@/components/shell/Nav';
import { AmbientBackground, ProgressBar, TechField } from '@/components/shell/Ambient';
import { FloatingControls, IntroSplash, Konami, SmoothScroll, Toasts } from '@/components/shell/Chrome';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { Annotations } from '@/components/shell/Annotations';
import { CvViewer } from '@/components/shell/CvViewer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap', axes: ['opsz'] });
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', style: 'italic', variable: '--font-instrument', display: 'swap' });
const yellowtail = Yellowtail({ subsets: ['latin'], weight: '400', variable: '--font-yellowtail', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(personal.siteUrl),
  title: { default: `${personal.name} · Software engineer`, template: `%s · ${personal.name}` },
  description: personal.description,
  icons: { icon: { url: '/favicon.svg', type: 'image/svg+xml' } },
  alternates: { canonical: './', types: { 'application/rss+xml': '/rss.xml' } },
  openGraph: { type: 'website', siteName: personal.name, title: personal.name, description: personal.description },
  twitter: { card: 'summary_large_image' },
  // Private worktree: never index while any placeholder remains.
  robots: hasPlaceholders ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = { themeColor: '#0a1113', colorScheme: 'dark light' };

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: personal.name,
      jobTitle: 'Software Engineering & AI Systems Intern',
      url: personal.siteUrl,
      email: `mailto:${personal.email}`,
      address: { '@type': 'PostalAddress', addressLocality: 'Leesburg', addressRegion: 'VA', addressCountry: 'US' },
      alumniOf: [{ '@type': 'CollegeOrUniversity', name: 'Northern Virginia Community College' }],
      sameAs: [personal.links.github, personal.links.linkedin],
    },
    { '@type': 'WebSite', name: personal.name, url: personal.siteUrl },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-motion="full"
      className={`${inter.variable} ${mono.variable} ${bricolage.variable} ${instrument.variable} ${yellowtail.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript + motionBootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <MotionProvider>
          <a href="#main" className="skip-link btn btn-primary">
            Skip to content
          </a>
          <AmbientBackground />
          <TechField />
          <ProgressBar />
          <IntroSplash />
          <Nav />
          <SmoothScroll />
          <ThemeController />
          {children}
          <FloatingControls />
          <CommandPalette />
          <Annotations />
          <CvViewer />
          <Toasts />
          <Konami />
        </MotionProvider>
        <noscript>
          <div style={{ position: 'fixed', bottom: 0, insetInline: 0, padding: 12, background: '#101a1d', color: '#eef5f4', textAlign: 'center', zIndex: 100 }}>
            Animations need JavaScript; all content is still here. Résumé: <a href="/resume.pdf">resume.pdf</a> · Email: {personal.email}
          </div>
        </noscript>
      </body>
    </html>
  );
}
