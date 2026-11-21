'use client';

import Link from 'next/link';
import { personal } from '@/data/personal';
import { PrismMark } from '@/components/lab/legacy/Prism';
import { Icon } from '@/components/ui/Icon';

// Design lab: two motif explorations for the hero, rendered over the live site so they share real fonts,
// data and the prism. Same content and layout in both; only the motif layer and tile style change.
// Private exploration only; delete src/app/lab and src/components/lab once a direction is chosen.

export const SPECTRUM = ['#5eead4', '#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'];
export const spectrumGradient = `linear-gradient(90deg, ${SPECTRUM.join(', ')})`;

export const TILES = [
  { label: 'TS', side: 'l', y: 16 },
  { label: 'Py', side: 'l', y: 32 },
  { label: 'C++', side: 'l', y: 48 },
  { label: '⚛', side: 'l', y: 64 },
  { label: 'pg', side: 'l', y: 80 },
  { label: 'N', side: 'r', y: 20 },
  { label: 'C#', side: 'r', y: 38 },
  { label: 'K', side: 'r', y: 56 },
  { label: '▲', side: 'r', y: 74 },
] as const;

export function LabHero({
  variant,
  name,
  background,
  tiles,
  note,
}: {
  variant: string;
  name: string;
  background: React.ReactNode;
  tiles: React.ReactNode;
  note: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden" style={{ background: '#07080d', color: '#eceaf3' }} data-lenis-prevent>
      <div className="relative min-h-[100svh] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">{background}</div>
        <div className="pointer-events-none absolute inset-0 hidden md:block">{tiles}</div>

        <header className="relative z-10 mx-auto flex h-16 max-w-[1152px] items-center gap-6 px-6">
          <PrismMark size={34} animated />
          <nav className="ml-auto hidden gap-6 text-[14.5px] text-[#a9a6b8] lg:flex">
            {['About', 'Experience', 'Skills', 'Projects', 'More'].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </nav>
          <span className="flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-[12px] text-[#a9a6b8]">
            <Icon name="search" size={14} /> Ctrl K
          </span>
          <span className="hidden h-10 items-center rounded-lg bg-[#eceaf3] px-4 text-sm font-semibold text-[#07080d] sm:flex">Contact me</span>
        </header>

        <main className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-[1152px] items-center px-6 pb-20">
          <div className="max-w-[620px]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3.5 py-1.5 text-[13px] text-[#c9c6d6] backdrop-blur">
              <span className="h-2 w-2 rounded-full" style={{ background: spectrumGradient }} />
              {personal.status}
            </p>
            <h1 className="mt-8 font-display text-[46px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-[64px] lg:text-[74px]">
              Hi, I&apos;m{' '}
              <span
                className="font-serif text-[1.12em] font-normal italic tracking-[-0.01em]"
                style={{ background: spectrumGradient, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingRight: '.06em' }}
              >
                {personal.name}
              </span>
              .
            </h1>
            <p className="mt-3 font-display text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#c9c6d6] sm:text-[32px]">
              I build software you can <span className="font-serif text-[1.1em] font-normal italic text-white">inspect</span>.
            </p>
            <p className="mt-6 max-w-[540px] text-[17px] leading-relaxed text-[#a9a6b8]">{personal.intro}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <span className="relative inline-flex h-12 items-center gap-2 rounded-xl px-6 font-semibold text-[#07080d]" style={{ background: '#eceaf3' }}>
                See projects <Icon name="arrowDownRight" size={16} />
                <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full" style={{ background: spectrumGradient }} />
              </span>
              <span className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/15 px-5 font-semibold">
                <Icon name="file" size={16} /> Read CV
              </span>
            </div>
            <p className="mt-7 font-mono text-[12px] uppercase tracking-[.16em] text-[#77748a]">{name}</p>
          </div>
        </main>
      </div>

      <aside className="fixed bottom-4 left-1/2 z-[101] flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-[#11121a]/90 p-1 text-[12.5px] shadow-2xl backdrop-blur">
        <span className="px-3 font-mono text-[11px] uppercase tracking-wider text-[#77748a]">Lab</span>
        {[
          ['refraction', 'Light & refraction'],
          ['cartography', 'Constellations & cartography'],
        ].map(([k, label]) => (
          <Link key={k} href={`/lab/${k}`} className={`rounded-full px-3 py-1.5 ${variant === k ? 'bg-white text-[#07080d]' : 'text-[#c9c6d6] hover:text-white'}`}>
            {label}
          </Link>
        ))}
        <Link href="/" className="rounded-full px-3 py-1.5 text-[#77748a] hover:text-white">
          Site
        </Link>
      </aside>
      <p className="sr-only">{note}</p>
    </div>
  );
}
