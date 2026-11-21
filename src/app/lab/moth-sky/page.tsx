import { Sacramento } from 'next/font/google';
import { ConstellationSheet, IntroSheet } from '@/components/lab/MothSky';

export const metadata = { title: 'Lab: moth constellation and intro', robots: { index: false } };

const sacramento = Sacramento({ subsets: ['latin'], weight: '400', variable: '--f-sacramento' });

// The Moth constellation variants and the intro storyboard. Lab reference only.
export default function Page() {
  return (
    <div className={`fixed inset-0 z-[100] overflow-auto ${sacramento.variable}`} style={{ background: '#07080d' }} data-lenis-prevent>
      <div style={{ width: 1440 }}>
        <ConstellationSheet />
        <IntroSheet sigFamily="var(--f-sacramento), cursive" />
      </div>
    </div>
  );
}
