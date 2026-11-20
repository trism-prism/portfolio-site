import { Sacramento } from 'next/font/google';
import { ThemeFooter, ThemeHero, ThemeProjects, ThemeRoute } from '@/components/lab/ThemeLab';
import { dark, twilight } from '@/components/lab/themeTokens';

export const metadata = { title: 'Lab: dark and twilight', robots: { index: false } };

const sacramento = Sacramento({ subsets: ['latin'], weight: '400', variable: '--f-sacramento' });
const sig = 'var(--f-sacramento), cursive';

// Dark and twilight, section by section, from one token set each. Lab reference for the palette handoff.
export default function Page() {
  return (
    <div className={`fixed inset-0 z-[100] overflow-auto ${sacramento.variable}`} style={{ background: '#07080d' }} data-lenis-prevent>
      <div style={{ width: 1440 }}>
        {[dark, twilight].map((t) => (
          <div key={t.name}>
            <ThemeHero t={t} sigFamily={sig} />
            <ThemeProjects t={t} />
            <ThemeRoute t={t} />
            <ThemeFooter t={t} sigFamily={sig} />
          </div>
        ))}
      </div>
    </div>
  );
}
