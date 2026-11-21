import { AboutSheet, AchievementsSheet, FocusSheet, StatsSheet } from '@/components/lab/SectionsLab';
import { dark, twilight } from '@/components/lab/themeTokens';

export const metadata = { title: 'Lab: remaining sections', robots: { index: false } };

// About, Achievements, Focus areas and Stats in dark and twilight. Lab reference only.
export default function Page() {
  return (
    <div className="fixed inset-0 z-[100] overflow-auto" style={{ background: '#07080d' }} data-lenis-prevent>
      <div style={{ width: 1440 }}>
        {[dark, twilight].map((t) => (
          <div key={t.name}>
            <AboutSheet t={t} />
            <AchievementsSheet t={t} />
            <FocusSheet t={t} />
            <StatsSheet t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}
