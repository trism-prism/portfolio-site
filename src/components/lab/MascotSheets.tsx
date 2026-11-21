import { Compass, FooterVignette, Mote, Moth, Prism, Snail, Whale, type Pose } from './Mascots';
import { dark, twilight, type Tokens } from './themeTokens';

type Concept = {
  id: string;
  name: string;
  tag: string;
  why: string;
  refs: string;
  C: (p: { pose: Pose; w: number }) => React.ReactNode;
  heroW: number;
  lineW: number;
  sitW: number;
  aspect: number; // sit pose height / width
  drop: number; // fraction of the sit drawing that hangs below the rule
};

const concepts: Concept[] = [
  {
    id: 'prism',
    name: 'Prism',
    tag: 'The current character',
    why: 'A light-splitting prism named after the trism-prism handle. Ties to the spectrum palette, but reads as a shape more than a creature.',
    refs: 'For comparison',
    C: Prism,
    heroW: 110,
    lineW: 96,
    sitW: 46,
    aspect: 64 / 48,
    drop: 0.14,
  },
  {
    id: 'mote',
    name: 'Mote',
    tag: 'A fallen star',
    why: 'A small star finding its way back up. It is the same four-point star used for bullets and legend marks, so the logo, the glyphs and the mascot become one thing.',
    refs: 'Journey, Elden Ring spirits; riding a cloud nods to Journey to the West',
    C: Mote,
    heroW: 220,
    lineW: 175,
    sitW: 54,
    aspect: 1,
    drop: 0.03,
  },
  {
    id: 'moth',
    name: 'Moth',
    tag: 'Wings that carry a star chart',
    why: 'A night moth whose wings are printed with constellations. Drawn to light, quiet and a little mysterious; folded wings become a cloak when it sits.',
    refs: 'Hollow Knight, without the knight',
    C: Moth,
    heroW: 240,
    lineW: 195,
    sitW: 58,
    aspect: 1,
    drop: 0.025,
  },
  {
    id: 'snail',
    name: 'Surveyor',
    tag: 'A snail carrying its map',
    why: 'Its shell is a measured spiral on a night globe and its trail becomes the dashed route line. Slow, careful, leaves traces: craft and care made literal.',
    refs: 'Traces of history; Hollow Knight’s small travellers',
    C: Snail,
    heroW: 260,
    lineW: 205,
    sitW: 96,
    aspect: 110 / 200,
    drop: 0.036,
  },
  {
    id: 'whale',
    name: 'Sky whale',
    tag: 'Scale and wonder',
    why: 'A whale swimming through the sky with a constellation on its back, spouting stars. Small on a rule, vast in the footer, passing slowly behind the hills.',
    refs: 'Journey, Gris; the scale of Destiny skyboxes',
    C: Whale,
    heroW: 270,
    lineW: 205,
    sitW: 104,
    aspect: 100 / 204,
    drop: 0.04,
  },
  {
    id: 'compass',
    name: 'Compass',
    tag: 'A guide that points the way',
    why: 'A floating compass rose with a face. It is the most useful mascot: it turns its gold point toward whatever a visitor should look at next.',
    refs: 'Floating companions (Destiny), astrolabes, old chart roses',
    C: Compass,
    heroW: 150,
    lineW: 128,
    sitW: 54,
    aspect: 1,
    drop: 0.03,
  },
];

const mono = 'font-mono text-[11px] uppercase tracking-[.18em]';

function skyBg(t: Tokens) {
  return `linear-gradient(180deg, ${t.skyTop}, ${t.skyMid} 55%, ${t.skyBottom})`;
}

function Label({ children, t = dark }: { children: React.ReactNode; t?: Tokens }) {
  return (
    <p className={`${mono} mb-3`} style={{ color: t.ink3 }}>
      {children}
    </p>
  );
}

function Lineup() {
  return (
    <section data-sheet="lineup" style={{ width: 1440 }}>
      <div className="px-16 pb-12 pt-14" style={{ background: skyBg(dark), color: dark.ink }}>
        <p className={mono} style={{ color: dark.ink3 }}>
          Mascot concepts · dark
        </p>
        <h2 className="mt-2 font-display text-[44px] font-bold tracking-[-0.03em]">
          Six characters, <span className="font-serif font-normal italic" style={{ color: dark.accentSerif }}>none human</span>
        </h2>
        <div className="mt-10 grid grid-cols-6 gap-4">
          {concepts.map((c, i) => (
            <div key={c.id} className="flex flex-col items-center text-center">
              <div className="flex h-[190px] items-end justify-center">
                <c.C pose="hero" w={c.lineW} />
              </div>
              <p className="mt-5 font-display text-[22px] font-bold">
                {i + 1}. {c.name}
              </p>
              <p className="mt-1 text-[13px]" style={{ color: dark.ink2 }}>
                {c.tag}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-16 pb-12 pt-10" style={{ background: skyBg(twilight), color: twilight.ink }}>
        <p className={mono} style={{ color: twilight.ink3 }}>
          Twilight · logo at 48, 32 and 16px
        </p>
        <div className="mt-6 grid grid-cols-6 gap-4">
          {concepts.map((c) => (
            <div key={c.id} className="flex flex-col items-center">
              <div className="flex h-[120px] items-end justify-center">
                <c.C pose="hero" w={Math.round(c.lineW * 0.66)} />
              </div>
              <div className="mt-5 flex items-end gap-4">
                {[48, 32, 16].map((s) => (
                  <c.C key={s} pose="mark" w={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RuleCell({ c }: { c: Concept }) {
  const h = c.sitW * c.aspect;
  return (
    <div className="relative h-[200px] overflow-hidden rounded-2xl border" style={{ background: skyBg(dark), borderColor: dark.cardBorder }}>
      <p className="absolute left-5 top-[96px] font-display text-[24px] font-bold tracking-[-0.03em]" style={{ color: dark.ink }}>
        Selected <span className="font-serif font-normal italic" style={{ color: dark.accentSerif }}>work</span>
      </p>
      <div className="absolute inset-x-6 top-[140px]">
        <span className="absolute inset-x-0 top-0 h-px" style={{ background: 'rgba(255,255,255,.16)' }} />
        <div className="absolute inset-x-0 top-0 flex justify-between">
          {Array.from({ length: 25 }, (_, i) => (
            <span key={i} style={{ width: 1, height: i % 6 === 0 ? 9 : 4, background: 'rgba(255,255,255,.16)' }} />
          ))}
        </div>
      </div>
      <div className="absolute right-5" style={{ top: Math.round(140 - h + h * c.drop) }}>
        <c.C pose="sit" w={c.sitW} />
      </div>
    </div>
  );
}

function Row({ c, n }: { c: Concept; n: number }) {
  return (
    <section data-sheet={`mascot-${c.id}`} className="border-t px-10 py-12" style={{ width: 1440, background: dark.skyMid, color: dark.ink, borderColor: dark.rule }}>
      <div className="grid grid-cols-[230px_290px_160px_280px_280px] gap-5">
        <div>
          <p className={mono} style={{ color: dark.ink3 }}>
            Concept {n}
          </p>
          <h3 className="mt-2 font-display text-[34px] font-bold tracking-[-0.03em]">{c.name}</h3>
          <p className="mt-1 font-serif text-[18px] italic" style={{ color: dark.accentSerif }}>
            {c.tag}
          </p>
          <p className="mt-4 text-[14px] leading-relaxed" style={{ color: dark.ink2 }}>
            {c.why}
          </p>
          <p className="mt-3 text-[12px] leading-relaxed" style={{ color: dark.ink3 }}>
            {c.refs}
          </p>
        </div>
        <div>
          <Label>Hero</Label>
          <div className="flex h-[200px] items-center justify-center rounded-2xl border" style={{ background: skyBg(dark), borderColor: dark.cardBorder }}>
            <c.C pose="hero" w={c.heroW} />
          </div>
        </div>
        <div>
          <Label>Logo, favicon</Label>
          {[dark, twilight].map((t) => (
            <div key={t.name} className="mb-3 flex h-[94px] items-center justify-center gap-4 rounded-2xl border" style={{ background: skyBg(t), borderColor: t.cardBorder }}>
              {[48, 32, 16].map((s) => (
                <c.C key={s} pose="mark" w={s} />
              ))}
            </div>
          ))}
        </div>
        <div>
          <Label>On a section rule</Label>
          <RuleCell c={c} />
        </div>
        <div>
          <Label>Footer</Label>
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: dark.cardBorder, height: 200 }}>
            <FooterVignette id={c.id} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function MascotSheets() {
  return (
    <>
      <Lineup />
      {concepts.map((c, i) => (
        <Row key={c.id} c={c} n={i + 1} />
      ))}
    </>
  );
}
