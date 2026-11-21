import { MascotSheets } from '@/components/lab/MascotSheets';

export const metadata = { title: 'Lab: mascots', robots: { index: false } };

// Six non-human mascot concepts, each in hero, logo, section-rule and footer poses.
export default function Page() {
  return (
    <div className="fixed inset-0 z-[100] overflow-auto" style={{ background: '#07080d' }} data-lenis-prevent>
      <div style={{ width: 1440 }}>
        <MascotSheets />
      </div>
    </div>
  );
}
