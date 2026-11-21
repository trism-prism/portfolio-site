import { sectionNumber, sections, type SectionId } from '@/data/sections';
import { Mascot } from './Mascot';
import { StarGlyph } from './StarGlyph';

// Ruler ticks hang up from the rule: every 10th 10px, every 5th 7px, the rest 4px.
function Ticks({ count, className }: { count: number; className: string }) {
  return (
    <div className={`absolute inset-x-0 bottom-0 justify-between ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="w-px bg-line" style={{ height: i % 10 === 0 ? 10 : i % 5 === 0 ? 7 : 4 }} />
      ))}
    </div>
  );
}

export function SectionHeader({ id }: { id: SectionId }) {
  const s = sections.find((x) => x.id === id)!;
  return (
    <header className="relative mb-10 md:mb-14">
      <p className="mono mb-3 flex items-center gap-3 text-[12px] uppercase tracking-[.18em] text-muted">
        <StarGlyph color="var(--fg)" size={12} />
        <span className="text-fg">{sectionNumber(id)}</span> {s.nav}
        <span className="ml-auto hidden normal-case tracking-[.08em] md:inline">{s.kicker}</span>
      </p>
      {/* Phones: the title wraps and the ruler runs full width beneath it. */}
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-end md:gap-5">
        <h2 id={`${id}-title`} tabIndex={-1} className="display text-[36px] leading-[1.05] text-fg md:shrink-0 md:text-[52px]">
          {s.title}
          {s.accent && <> <span className="serif-accent text-[1.05em] text-accent-serif">{s.accent}</span></>}
        </h2>
        <div className="relative mb-2 h-[10px] w-full md:w-auto md:flex-1">
          <span className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden="true" />
          <Ticks count={41} className="hidden md:flex" />
          <Ticks count={21} className="flex md:hidden" />
          {/* the moth sits about 48px in from the end of the ruler */}
          <div className="absolute inset-y-0 left-0 right-6">
            <Mascot sectionId={id} />
          </div>
        </div>
      </div>
    </header>
  );
}
