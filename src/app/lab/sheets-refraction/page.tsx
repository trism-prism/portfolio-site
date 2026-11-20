import { AllRefractSheets } from '@/components/lab/RefractSheets';

export const metadata = { title: 'Lab: refraction sheets', robots: { index: false } };

// Static mockups for review screenshots. Fixed 1440px wide; scroll horizontally on smaller screens.
export default function Page() {
  return (
    <div className="fixed inset-0 z-[100] overflow-auto" style={{ background: '#08080c' }} data-lenis-prevent>
      <div style={{ width: 1440 }}>
        <AllRefractSheets />
      </div>
    </div>
  );
}
