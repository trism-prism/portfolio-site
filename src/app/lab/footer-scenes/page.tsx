import { Sacramento } from 'next/font/google';
import { AllFooterConcepts } from '@/components/lab/FooterMoth';

export const metadata = { title: 'Lab: footer scenes', robots: { index: false } };

const sacramento = Sacramento({ subsets: ['latin'], weight: '400', variable: '--f-sacramento' });

// Static frames of the four night-sky footer scenes, recast around the moth, with their interaction spec.
export default function Page() {
  return (
    <div className={`fixed inset-0 z-[100] overflow-auto ${sacramento.variable}`} style={{ background: '#07080d' }} data-lenis-prevent>
      <div style={{ width: 1440 }}>
        <AllFooterConcepts sigFamily="var(--f-sacramento), cursive" />
      </div>
    </div>
  );
}
