import { sectionNumber, sections, type SectionId } from '@/data/sections';
import { Mascot } from './Mascot';

export function SectionHeader({ id }: { id: SectionId }) {
  const s = sections.find((x) => x.id === id)!;
  return (
    <header className="relative mb-10 md:mb-14">
      <p className="mono mb-3 text-[13px] text-fg-2">
        <span className="text-accent">{sectionNumber(id)} /</span> {s.kicker}
      </p>
      <div className="flex items-end gap-5">
        <h2 id={`${id}-title`} tabIndex={-1} className="display shrink-0 text-[40px] leading-[1.05] text-fg md:text-[52px]">
          {s.title}
          {s.accent && <> <span className="serif-accent text-[1.05em]">{s.accent}</span></>}
        </h2>
        <div className="relative mb-3 h-px flex-1 bg-line-2">
          <Mascot sectionId={id} />
        </div>
      </div>
    </header>
  );
}
