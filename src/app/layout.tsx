import type { Metadata, Viewport } from 'next';
import { Newsreader, Source_Sans_3 } from 'next/font/google';
import { site } from '../site';
import '../styles/globals.css';

const display = Newsreader({ subsets: ['latin'], variable: '--font-newsreader', display: 'swap' });
const text = Source_Sans_3({ subsets: ['latin'], variable: '--font-source', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: site.name, title: site.title, description: site.description, url: '/' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#1c1626', colorScheme: 'dark' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
