import { AllFooterConcepts } from '@/components/lab/FooterLab';

export const metadata = { title: 'Lab: footer scenes', robots: { index: false } };

// Static frames of the four night-sky footer scenes, with their interaction spec. Lab reference only.
export default function Page() {
  return (
    <div className="fixed inset-0 z-[100] overflow-auto" style={{ background: '#07080d' }} data-lenis-prevent>
      <div style={{ width: 1440 }}>
        <AllFooterConcepts />
      </div>
    </div>
  );
}
