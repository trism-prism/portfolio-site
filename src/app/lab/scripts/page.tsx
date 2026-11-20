import { Caveat, Herr_Von_Muellerhoff, Pinyon_Script, Sacramento } from 'next/font/google';
import { ChartBackdrop } from '@/components/lab/ChartKit';
import { PrismMark } from '@/components/ui/Prism';

export const metadata = { title: 'Lab: script faces', robots: { index: false } };

// Script comparison for the hero name. All candidates are SIL Open Font License faces from Google Fonts.
// Exploration only: delete with the rest of src/app/lab once one is chosen.
const pinyon = Pinyon_Script({ subsets: ['latin'], weight: '400', variable: '--f-pinyon' });
const herr = Herr_Von_Muellerhoff({ subsets: ['latin'], weight: '400', variable: '--f-herr' });
const caveat = Caveat({ subsets: ['latin'], variable: '--f-caveat' });
const sacramento = Sacramento({ subsets: ['latin'], weight: '400', variable: '--f-sacramento' });

const SPEC = 'linear-gradient(90deg, #5eead4, #60a5fa, #a78bfa, #f472b6, #fbbf24)';
const INK = '#eceaf3';

const faces = [
  {
    key: 'A',
    name: 'Pinyon Script',
    family: 'var(--f-pinyon)',
    scale: 1.0,
    note: 'Copperplate engraving, like the hand-lettered names on old star atlases. Most on-motif; formal.',
  },
  {
    key: 'B',
    name: 'Sacramento',
    family: 'var(--f-sacramento)',
    scale: 1.12,
    note: 'Thin monoline, like a single drawn line joining stars. Light and elegant; weakest at small sizes.',
  },
  {
    key: 'C',
    name: 'Herr Von Muellerhoff',
    family: 'var(--f-herr)',
    scale: 1.18,
    note: 'Reads like a real signature: quick, slanted, personal. Least legible of the four.',
  },
  {
    key: 'D',
    name: 'Caveat',
    family: 'var(--f-caveat)',
    scale: 0.92,
    note: 'Casual hand-lettering, like margin notes in a lab notebook. Most legible; least formal.',
  },
  {
    key: 'Ref',
    name: 'Yellowtail (current)',
    family: 'var(--font-yellowtail)',
    scale: 0.96,
    note: 'The current face, shown for reference. The reference site uses it for its owner’s name.',
  },
];

export default function Page() {
  return (
    <div className={`fixed inset-0 z-[100] overflow-auto ${pinyon.variable} ${herr.variable} ${caveat.variable} ${sacramento.variable}`} style={{ background: '#07080d', color: INK }} data-lenis-prevent>
      <div data-sheet="scripts" className="relative overflow-hidden" style={{ width: 1440 }}>
        <ChartBackdrop seed={808} h={2600} />
        <div className="relative mx-auto max-w-[1152px] px-6 py-20">
          <p className="font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: '#77748a' }}>
            Lab · handwritten name · same layout, only the face changes
          </p>
          {faces.map((f) => (
            <section key={f.key} className="mt-14 border-t pt-10" style={{ borderColor: 'rgba(255,255,255,.09)' }}>
              <div className="flex items-baseline gap-4">
                <span className="grid h-8 min-w-8 place-items-center rounded-full border px-2 font-mono text-[12px]" style={{ borderColor: 'rgba(255,255,255,.2)' }}>
                  {f.key}
                </span>
                <h2 className="font-display text-[22px] font-bold">{f.name}</h2>
                <p className="text-[14px]" style={{ color: '#a9a6b8' }}>
                  {f.note}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-[1fr_300px] items-end gap-10">
                <h1 className="font-display text-[74px] font-bold leading-[1.02] tracking-[-0.035em]">
                  Hi, I&apos;m{' '}
                  <span
                    style={{
                      fontFamily: f.family,
                      fontWeight: 400,
                      fontSize: `${1.12 * f.scale}em`,
                      letterSpacing: 0,
                      background: SPEC,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      paddingInline: '.1em',
                    }}
                  >
                    Tristan Morton
                  </span>
                  .
                </h1>
                <div className="space-y-5 pb-3">
                  <div className="flex items-center gap-3">
                    <PrismMark size={28} />
                    <span style={{ fontFamily: f.family, fontSize: 30 * f.scale, color: INK }}>Tristan Morton</span>
                  </div>
                  <p className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: '#77748a' }}>
                    Footer signature (ink, 30px)
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span style={{ fontFamily: f.family, fontSize: 20 * f.scale, color: '#cfc9f5' }}>the Prism</span>
                    <span className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: '#77748a' }}>
                      chart label (20px)
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
