'use client';

import { projects, type Project, type ProjectKind } from '@/data/projects';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { skillCategories, secondarySkills } from '@/data/skills';
import { news, newsTypeLabels } from '@/data/news';
import { personal } from '@/data/personal';
import { plain, isPh } from '@/data/ph';
import { mulberry32 } from '@/lib/kit';
import { covers } from '@/components/scenes/covers/registry';
import { Stage } from '@/components/scenes/Stage';
import { Icon } from '@/components/ui/Icon';
import { PrismCharacter } from '@/components/ui/Prism';
import { BG, ChartBackdrop, ChartHeader, Corners, DIM, GOLD, INK, KIND, LINE, MUTED, ROSE, StarGlyph, designation, mono } from './ChartKit';

// Static constellation-motif mockups of the sections after the hero. Exploration only: every choice
// here is a proposal for review, not an approved design. Real data, real covers frozen on one frame.

const kindName: Record<ProjectKind, string> = { software: 'Software', ai: 'AI', data: 'Data', systems: 'Systems' };

function Sheet({ id, seed, children, h = 900 }: { id: string; seed: number; children: React.ReactNode; h?: number }) {
  return (
    <section data-sheet={id} className="relative overflow-hidden" style={{ background: BG, color: INK, width: 1440 }}>
      <ChartBackdrop seed={seed} h={h} />
      <div className="relative mx-auto max-w-[1152px] px-6 py-24">{children}</div>
    </section>
  );
}

function Cover({ p, className = '' }: { p: Project; className?: string }) {
  const c = covers[p.cover];
  return (
    <div className={`relative ${className}`} style={{ background: 'rgba(255,255,255,.025)' }}>
      <Stage>
        <c.Scene t={c.frozenAt} reduced />
      </Stage>
    </div>
  );
}

function Plate({ children, className = '', tone = 'rgba(255,255,255,.3)' }: { children: React.ReactNode; className?: string; tone?: string }) {
  return (
    <div className={`relative border ${className}`} style={{ borderColor: LINE, background: 'rgba(12,13,24,.72)', backdropFilter: 'blur(2px)' }}>
      <Corners color={tone} />
      {children}
    </div>
  );
}

/* ---------------- 1. Projects: sky map + plates ---------------- */
const GROUPS: { kind: ProjectKind; cx: number; cy: number }[] = [
  { kind: 'software', cx: 190, cy: 120 },
  { kind: 'ai', cx: 480, cy: 90 },
  { kind: 'data', cx: 760, cy: 140 },
  { kind: 'systems', cx: 1000, cy: 95 },
];

export function ProjectsSheet() {
  const spotlight = projects.find((p) => p.spotlight)!;
  const featured = projects.filter((p) => p.featured && !p.spotlight);
  const r = mulberry32(9);
  return (
    <Sheet id="projects" seed={5} h={1700}>
      <ChartHeader n="05" label="Projects" title="Things I've" accent="charted" coord="11 objects · 4 constellations" />

      {/* sky map: every project is a star; kinds are constellations; the legend doubles as the filter */}
      <Plate className="mb-4 h-[230px]">
        <svg viewBox="0 0 1104 230" className="h-full w-full" aria-hidden>
          {GROUPS.map((g) => {
            const list = projects.filter((p) => p.kind === g.kind);
            const pts = list.map((_, i) => {
              const a = (i / Math.max(1, list.length)) * Math.PI * 2 + r();
              const d = list.length > 1 ? 40 + r() * 34 : 0;
              return [Math.round(g.cx + Math.cos(a) * d * 1.6), Math.round(g.cy + Math.sin(a) * d * 0.8)];
            });
            return (
              <g key={g.kind}>
                <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke={KIND[g.kind]} strokeOpacity=".35" />
                {list.map((p, i) => (
                  <g key={p.slug}>
                    <circle cx={pts[i][0]} cy={pts[i][1]} r={p.featured ? 12 : 7} fill={KIND[g.kind]} opacity=".18" />
                    <circle cx={pts[i][0]} cy={pts[i][1]} r={p.featured ? 4 : 2.6} fill={KIND[g.kind]} />
                    {p.featured && (
                      <text x={pts[i][0] + 10} y={pts[i][1] - 8} fontFamily={mono} fontSize="9.5" letterSpacing=".12em" fill={INK} fillOpacity=".75">
                        {designation(p.id)}
                      </text>
                    )}
                  </g>
                ))}
                <text x={g.cx} y={212} textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="19" fill={KIND[g.kind]} fillOpacity=".8">
                  {kindName[g.kind]}
                </text>
              </g>
            );
          })}
        </svg>
      </Plate>
      <div className="mb-12 flex items-center gap-2">
        {(['all', 'featured', ...GROUPS.map((g) => g.kind)] as const).map((k) => {
          const n = k === 'all' ? projects.length : k === 'featured' ? projects.filter((p) => p.featured).length : projects.filter((p) => p.kind === k).length;
          const on = k === 'featured';
          return (
            <span key={k} className="flex h-10 items-center gap-2 border px-3.5 font-mono text-[12.5px]" style={{ borderColor: on ? INK : LINE, color: on ? INK : MUTED, background: on ? 'rgba(255,255,255,.06)' : 'transparent' }}>
              {k !== 'all' && k !== 'featured' && <StarGlyph color={KIND[k]} />}
              {k === 'all' ? 'All' : k === 'featured' ? 'Brightest' : kindName[k]}
              <span style={{ color: DIM }}>{n}</span>
            </span>
          );
        })}
        <span className="ml-auto flex h-10 w-[300px] items-center gap-2 border px-3 text-[14px]" style={{ borderColor: LINE, color: DIM }}>
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="5" fill="none" stroke={DIM} />
            <path d="M8 0 v4 M8 12 v4 M0 8 h4 M12 8 h4" stroke={DIM} />
          </svg>
          Find a project or technology
        </span>
      </div>

      {/* spotlight plate */}
      <Plate className="mb-6 grid min-h-[560px] grid-cols-[1.15fr_1fr]" tone={KIND[spotlight.kind]}>
        <Cover p={spotlight} className="h-full border-r" />
        <div className="flex flex-col p-8">
          <p className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[.16em]" style={{ color: KIND[spotlight.kind] }}>
            <StarGlyph color={KIND[spotlight.kind]} size={12} /> {designation(spotlight.id)} · brightest · {kindName[spotlight.kind]} · {spotlight.period}
          </p>
          <h3 className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">{spotlight.title}</h3>
          <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: MUTED }}>
            {spotlight.summary}
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-px border" style={{ borderColor: LINE, background: LINE }}>
            {[
              ['127x', 'faster on mazes'],
              ['66', 'benchmark rows'],
              ['4', 'wall layouts tested'],
            ].map(([v, l]) => (
              <div key={l} className="p-3" style={{ background: BG }}>
                <dt className="font-display text-[22px] font-bold">{v}</dt>
                <dd className="font-mono text-[10.5px] uppercase tracking-[.12em]" style={{ color: DIM }}>
                  {l}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-auto flex gap-3 pt-6">
            <span className="flex h-10 items-center gap-2 px-4 text-sm font-semibold" style={{ background: INK, color: BG }}>
              Read the case study <Icon name="arrowRight" size={15} />
            </span>
            <span className="flex h-10 items-center gap-2 border px-4 text-sm font-semibold" style={{ borderColor: LINE }}>
              <Icon name="github" size={15} /> Source
            </span>
          </div>
        </div>
      </Plate>

      {/* other bright plates */}
      <div className="grid grid-cols-3 gap-6">
        {featured.map((p) => (
          <Plate key={p.slug} tone={KIND[p.kind]}>
            <Cover p={p} className="aspect-[16/10] border-b" />
            <div className="p-5">
              <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[.16em]" style={{ color: KIND[p.kind] }}>
                <StarGlyph color={KIND[p.kind]} /> {designation(p.id)} · {kindName[p.kind]}
                <span className="ml-auto" style={{ color: DIM }}>
                  {p.period}
                </span>
              </p>
              <h3 className="mt-3 font-display text-[22px] font-bold tracking-[-0.02em]">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
                {p.summary}
              </p>
            </div>
          </Plate>
        ))}
      </div>
      <p className="mt-8 text-center font-mono text-[12px] uppercase tracking-[.16em]" style={{ color: DIM }}>
        + {projects.length - featured.length - 1} fainter objects in the full catalogue ↓
      </p>
    </Sheet>
  );
}

/* ---------------- 2. Case study ---------------- */
export function CaseStudySheet() {
  const p = projects.find((x) => x.slug === 'docs-qa-copilot')!;
  const sameKind = projects.filter((x) => x.kind === p.kind);
  return (
    <Sheet id="case-study" seed={21} h={1500}>
      <div className="grid grid-cols-[1fr_280px] gap-12">
        <div>
          <p className="font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: KIND[p.kind] }}>
            {designation(p.id)} · {kindName[p.kind]} · {p.period} · live
          </p>
          <h1 className="mt-4 font-display text-[64px] font-bold leading-[.98] tracking-[-0.04em]">{p.title}</h1>
          <p className="mt-5 max-w-[640px] font-serif text-[22px] italic leading-snug" style={{ color: '#cfc9f5' }}>
            Answers you can check: every claim points at a page, and the evaluation shows every miss.
          </p>
          <div className="mt-7 flex gap-3">
            <span className="flex h-11 items-center gap-2 px-5 font-semibold" style={{ background: INK, color: BG }}>
              <Icon name="external" size={15} /> Live site
            </span>
            <span className="flex h-11 items-center gap-2 border px-5 font-semibold" style={{ borderColor: LINE }}>
              <Icon name="github" size={15} /> Source
            </span>
            <span className="flex h-11 items-center gap-2 px-3 font-semibold" style={{ color: MUTED }}>
              Evaluation page <Icon name="arrowUpRight" size={14} />
            </span>
          </div>
          <Plate className="mt-10" tone={KIND[p.kind]}>
            <Cover p={p} className="aspect-[16/8]" />
          </Plate>

          <h2 className="mt-14 font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: DIM }}>
            Measurements · frozen 50-question set
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-px border" style={{ borderColor: LINE, background: LINE }}>
            {[
              [46, 50, 'answers correct'],
              [40, 42, 'citations correct'],
              [28, 30, 'held-out correct'],
              [8, 8, 'unanswerable abstained'],
            ].map(([a, b, l]) => (
              <div key={String(l)} className="p-5" style={{ background: BG }}>
                <p className="font-display text-[34px] font-bold">
                  {a}
                  <span style={{ color: DIM }}>/{b}</span>
                </p>
                <div className="mt-3 flex gap-[3px]">
                  {Array.from({ length: Number(b) > 20 ? 25 : Number(b) }, (_, i) => {
                    const scale = Number(b) > 20 ? Number(b) / 25 : 1;
                    return <span key={i} className="h-3 flex-1" style={{ background: i * scale < Number(a) ? KIND[p.kind] : 'rgba(255,255,255,.12)' }} />;
                  })}
                </div>
                <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[.12em]" style={{ color: DIM }}>
                  {l}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13.5px]" style={{ color: DIM }}>
            One question moves a split by 3 to 5 points. Held-out questions were run once, after the code froze.
          </p>

          <h2 className="mt-14 font-mono text-[12px] uppercase tracking-[.18em]" style={{ color: DIM }}>
            At a glance
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-6">
            {(['problem', 'built', 'decisions', 'outcome'] as const).map((k, i) => (
              <div key={k} className="border-l pl-5" style={{ borderColor: i % 2 ? 'rgba(255,255,255,.15)' : KIND[p.kind] }}>
                <p className="font-serif text-[20px] italic" style={{ color: '#cfc9f5' }}>
                  {k === 'built' ? 'What I built' : k[0].toUpperCase() + k.slice(1)}
                </p>
                <p className="mt-2 text-[15.5px] leading-relaxed" style={{ color: MUTED }}>
                  {p.glance![k]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* margin chart: where this project sits */}
        <aside className="sticky top-8 self-start">
          <Plate className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: DIM }}>
              Position
            </p>
            <svg viewBox="0 0 240 150" className="mt-3 w-full" aria-hidden>
              <polyline points="30,110 90,40 150,90 210,30" fill="none" stroke={KIND.ai} strokeOpacity=".35" />
              {[
                [30, 110],
                [90, 40],
                [150, 90],
                [210, 30],
              ].map(([x, y], i) => (
                <g key={i}>
                  {i === 1 && <circle cx={x} cy={y} r="14" fill="none" stroke={GOLD} strokeDasharray="2 3" />}
                  <circle cx={x} cy={y} r={i === 1 ? 4.5 : 2.6} fill={KIND.ai} />
                </g>
              ))}
              <text x="120" y="140" textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="15" fill={KIND.ai}>
                AI
              </text>
            </svg>
            <ul className="mt-3 space-y-1.5 text-[13px]" style={{ color: MUTED }}>
              {sameKind.map((x) => (
                <li key={x.slug} className="flex items-center gap-2" style={{ color: x.slug === p.slug ? INK : MUTED }}>
                  <StarGlyph color={KIND.ai} size={9} /> {x.title}
                </li>
              ))}
            </ul>
          </Plate>
          <Plate className="mt-4 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: DIM }}>
              Built with
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
              {p.tech.join(' · ')}
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: DIM }}>
              My part
            </p>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: MUTED }}>
              {p.role}
            </p>
          </Plate>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[.14em]" style={{ color: DIM }}>
            Nearest: Internship Scout Agent →
          </p>
        </aside>
      </div>
    </Sheet>
  );
}

/* ---------------- 3. Journey: experience + education as a charted route ---------------- */
export function JourneySheet() {
  const formwork = experience[0];
  const jmu = education[0];
  const nova = education[1];
  const stops = [
    { x: 210, y: 330, when: nova.period, title: nova.school, sub: nova.credential, tone: ROSE, kind: 'Education' },
    { x: 470, y: 240, when: plain(jmu.period), title: jmu.school, sub: 'B.B.A. CIS · Business Analytics minor', tone: ROSE, kind: 'Education', ph: isPh(jmu.period) },
    { x: 820, y: 300, when: formwork.period, title: formwork.org, sub: formwork.role, tone: KIND.ai, kind: 'Work' },
    { x: 1000, y: 190, when: 'Dec 2027', title: 'Graduation', sub: 'Expected', tone: GOLD, kind: 'Ahead', future: true },
  ];
  const path = `M${stops[0].x},${stops[0].y} C 260,330 330,240 ${stops[1].x},${stops[1].y} S 700,300 ${stops[2].x},${stops[2].y} S 980,190 ${stops[3].x},${stops[3].y}`;
  return (
    <Sheet id="journey" seed={33} h={1250}>
      <ChartHeader n="02" label="Experience & education" title="The route" accent="so far" coord="2023 → 2027" />
      <Plate className="h-[420px]">
        <svg viewBox="0 0 1104 420" className="h-full w-full" aria-hidden>
          {/* contour lines */}
          <g fill="none" stroke="#fff" strokeOpacity=".05">
            {[60, 100, 140, 180, 220].map((rr) => (
              <ellipse key={rr} cx="560" cy="300" rx={rr * 2.6} ry={rr} />
            ))}
            {[40, 70, 100].map((rr) => (
              <ellipse key={rr} cx="900" cy="140" rx={rr * 2} ry={rr * 0.8} />
            ))}
          </g>
          <path d={path} fill="none" stroke={GOLD} strokeOpacity=".75" strokeWidth="1.6" strokeDasharray="6 7" />
          {stops.map((s) => (
            <g key={s.title} transform={`translate(${s.x} ${s.y})`}>
              <circle r="16" fill="none" stroke={s.tone} strokeOpacity=".4" strokeDasharray={s.future ? '2 3' : undefined} />
              <circle r={s.future ? 4 : 5} fill={s.future ? 'none' : s.tone} stroke={s.tone} strokeWidth="1.4" />
              <text y="-30" textAnchor="middle" fontFamily={mono} fontSize="11" letterSpacing=".14em" fill={s.tone}>
                {s.kind.toUpperCase()}
              </text>
              <text y="44" textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="700" fontSize="17" fill={INK}>
                {s.title}
              </text>
              <text y="64" textAnchor="middle" fontFamily={mono} fontSize="11" letterSpacing=".08em" fill={s.ph ? '#f5b301' : DIM}>
                {s.when}
                {s.ph ? ' (placeholder start)' : ''}
              </text>
            </g>
          ))}
          <g transform="translate(820 300)">
            <g transform="translate(-21 -92)">
              <foreignObject width="42" height="56">
                <PrismCharacter pose="wave" size={42} />
              </foreignObject>
            </g>
          </g>
          <text x="1090" y="404" textAnchor="end" fontFamily={mono} fontSize="10" letterSpacing=".12em" fill={DIM}>
            DASHED GOLD = THE ROUTE · HOLLOW = AHEAD
          </text>
        </svg>
      </Plate>

      <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6">
        <Plate className="p-7" tone={KIND.ai}>
          <p className="font-mono text-[11.5px] uppercase tracking-[.16em]" style={{ color: KIND.ai }}>
            Current position · {formwork.period}
          </p>
          <h3 className="mt-3 font-display text-[28px] font-bold tracking-[-0.025em]">{formwork.role}</h3>
          <p style={{ color: MUTED }}>
            {formwork.org} · {formwork.place}
          </p>
          <ul className="mt-5 space-y-3 text-[15px] leading-relaxed" style={{ color: MUTED }}>
            {formwork.points.slice(0, 3).map((pt) => (
              <li key={pt} className="flex gap-3">
                <span className="mt-2">
                  <StarGlyph color={KIND.ai} size={9} />
                </span>
                {pt}
              </li>
            ))}
          </ul>
        </Plate>
        <div className="grid gap-6">
          {[jmu, nova].map((e) => (
            <Plate key={e.id} className="p-6" tone={ROSE}>
              <p className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: ROSE }}>
                {plain(e.period)}
              </p>
              <h3 className="mt-2 font-display text-[21px] font-bold">{e.school}</h3>
              <p className="text-[14.5px]" style={{ color: MUTED }}>
                {e.credential}
              </p>
            </Plate>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

/* ---------------- 4. Skills: a star catalogue ---------------- */
export function SkillsSheet() {
  const tones = [KIND.systems, KIND.software, KIND.data, KIND.data, KIND.ai, KIND.systems, KIND.software, ROSE];
  return (
    <Sheet id="skills" seed={44} h={1250}>
      <ChartHeader n="04" label="Skills" title="Star" accent="catalogue" coord={`${skillCategories.reduce((a, c) => a + c.items.length, 0)} entries`} />
      <div className="grid grid-cols-4 gap-px border" style={{ borderColor: LINE, background: LINE }}>
        {skillCategories.map((c, ci) => {
          const r = mulberry32(100 + ci);
          const rows = Math.ceil(c.items.length / 2);
          const pts = c.items.map((_, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            return [Math.round(14 + col * 118 + r() * 18), Math.round(16 + row * (128 / Math.max(1, rows - 1 || 1)) * (rows > 1 ? 1 : 0) + r() * 8)];
          });
          const order = pts.map((_, i) => i).sort((a, b) => (pts[a][1] - pts[b][1]) || (pts[a][0] - pts[b][0]));
          return (
            <div key={c.id} className="relative p-5" style={{ background: BG }}>
              <p className="font-serif text-[22px] italic" style={{ color: tones[ci] }}>
                {c.label}
              </p>
              <svg viewBox="0 0 250 160" className="mt-2 w-full" aria-hidden>
                <polyline points={order.map((i) => pts[i].join(',')).join(' ')} fill="none" stroke={tones[ci]} strokeOpacity=".3" />
                {c.items.map((s, i) => (
                  <g key={s}>
                    <circle cx={pts[i][0]} cy={pts[i][1]} r="6" fill={tones[ci]} opacity=".15" />
                    <circle cx={pts[i][0]} cy={pts[i][1]} r="2.2" fill={tones[ci]} />
                    <text x={pts[i][0] + 6} y={pts[i][1] - 5} fontFamily={mono} fontSize="8.5" fill={INK} fillOpacity=".75">
                      {s}
                    </text>
                  </g>
                ))}
              </svg>
              <p className="mt-1 text-[13px] leading-snug" style={{ color: DIM }}>
                {c.blurb}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-8 grid grid-cols-3 gap-6">
        {secondarySkills.map((g) => (
          <div key={g.id}>
            <p className="font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: DIM }}>
              {g.label}
            </p>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTED }}>
              {g.items.map((s) => plain(s)).join(' · ')}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-[13px]" style={{ color: DIM }}>
        No proficiency bars: each star is a thing I have used in a listed project or role.
      </p>
    </Sheet>
  );
}

/* ---------------- 5. Activity: an observation log ---------------- */
export function LogSheet() {
  const sorted = [...news].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
  const typeTone: Record<string, string> = { launch: KIND.software, release: KIND.systems, work: KIND.ai, education: ROSE, award: GOLD, 'open-source': '#22c55e', study: KIND.data };
  return (
    <Sheet id="log" seed={55} h={1200}>
      <ChartHeader n="09" label="Activity" title="Observation" accent="log" coord="newest first" />
      <div className="grid grid-cols-[200px_1fr] gap-10">
        <div className="space-y-2">
          {Object.entries(newsTypeLabels).map(([k, l]) => (
            <p key={k} className="flex items-center gap-3 font-mono text-[12.5px]" style={{ color: MUTED }}>
              <StarGlyph color={typeTone[k]} /> {l}
              <span className="ml-auto" style={{ color: DIM }}>
                {news.filter((n) => n.type === k).length}
              </span>
            </p>
          ))}
        </div>
        <ol className="relative">
          <span className="absolute bottom-0 left-[86px] top-0 w-px" style={{ background: 'rgba(255,255,255,.12)' }} />
          {sorted.map((n, i) => {
            const d = new Date(n.date + 'T00:00:00Z');
            return (
              <li key={n.id} className="relative grid grid-cols-[86px_1fr] items-start gap-8 py-4">
                <p className="pt-1 text-right font-mono text-[11.5px] uppercase tracking-[.12em]" style={{ color: DIM }}>
                  {d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                  <br />
                  <span style={{ color: MUTED }}>{d.getUTCFullYear()}</span>
                </p>
                <span className="absolute left-[80px] top-[22px]">
                  <StarGlyph color={typeTone[n.type]} size={13} />
                </span>
                <div className={`border-b pb-4 ${n.placeholder ? 'opacity-60' : ''}`} style={{ borderColor: LINE }}>
                  <p className="font-mono text-[10.5px] uppercase tracking-[.16em]" style={{ color: typeTone[n.type] }}>
                    No. {String(news.length - i).padStart(3, '0')} · {newsTypeLabels[n.type]}
                    {n.placeholder ? ' · placeholder' : ''}
                  </p>
                  <p className="mt-1.5 font-display text-[20px] font-bold tracking-[-0.015em]">{plain(n.title)}</p>
                  <p className="mt-1 text-[14.5px]" style={{ color: MUTED }}>
                    {plain(n.detail)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Sheet>
  );
}

/* ---------------- 6. Contact + footer horizon ---------------- */
export function ContactSheet() {
  return (
    <section data-sheet="contact" className="relative overflow-hidden" style={{ background: BG, color: INK, width: 1440 }}>
      <ChartBackdrop seed={66} h={1300} />
      <div className="relative mx-auto max-w-[1152px] px-6 pt-24">
        <ChartHeader n="10" label="Contact" title="Set a" accent="course" coord={`${personal.location} · 39.12° N 77.56° W`} />
        <div className="grid grid-cols-[1fr_1.35fr] gap-8">
          <div className="space-y-3">
            {[
              ['mail', 'Email', personal.email, 'N'],
              ['linkedin', 'LinkedIn', personal.links.linkedinHandle, 'E'],
              ['github', 'GitHub', personal.links.githubUser, 'S'],
            ].map(([ic, l, v, b]) => (
              <Plate key={l} className="flex items-center gap-4 p-4">
                <span className="grid h-11 w-11 place-items-center rounded-full border font-mono text-[11px]" style={{ borderColor: 'rgba(255,255,255,.2)', color: GOLD }}>
                  {b}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10.5px] uppercase tracking-[.16em]" style={{ color: DIM }}>
                    {l}
                  </p>
                  <p className="truncate font-semibold">{v}</p>
                </div>
                <Icon name={ic} size={18} />
              </Plate>
            ))}
            <p className="pt-2 text-[13.5px]" style={{ color: DIM }}>
              Letters are compass bearings: decorative, not a ranking.
            </p>
          </div>
          <Plate className="space-y-4 p-7">
            {['Name', 'Email'].map((f) => (
              <div key={f}>
                <p className="mb-2 font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: MUTED }}>
                  {f}
                </p>
                <div className="h-12 border" style={{ borderColor: LINE, background: 'rgba(255,255,255,.02)' }} />
              </div>
            ))}
            <div>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[.16em]" style={{ color: MUTED }}>
                Message
              </p>
              <div className="h-32 border" style={{ borderColor: LINE, background: 'rgba(255,255,255,.02)' }} />
            </div>
            <div className="flex h-12 items-center justify-center gap-2 font-semibold" style={{ background: INK, color: BG }}>
              <Icon name="send" size={16} /> Write it in my email app
            </div>
          </Plate>
        </div>
      </div>

      {/* footer horizon: the sky opens up, the Prism constellation rises, the character watches */}
      <div className="relative mt-24 h-[420px]">
        <svg viewBox="0 0 1440 420" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="hz" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#0c0d1c" stopOpacity="0" />
              <stop offset=".7" stopColor="#151634" />
              <stop offset="1" stopColor="#1c1a3a" />
            </linearGradient>
          </defs>
          <rect width="1440" height="420" fill="url(#hz)" />
          <path d="M0 360 Q 200 330 420 350 T 860 340 T 1440 352 V420 H0Z" fill="#05060b" />
          <polyline points="690,90 780,250 600,250 690,90" fill="none" stroke={INK} strokeOpacity=".35" />
          {[
            [690, 90, KIND.systems],
            [780, 250, KIND.ai],
            [600, 250, KIND.software],
            [735, 170, KIND.software],
          ].map(([x, y, c]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x as number} cy={y as number} r="10" fill={c as string} opacity=".25" />
              <circle cx={x as number} cy={y as number} r="3.5" fill={c as string} />
            </g>
          ))}
          <circle cx="675" cy="212" r="2" fill={INK} />
          <circle cx="705" cy="212" r="2" fill={INK} />
          <text x="690" y="285" textAnchor="middle" fontFamily="var(--font-instrument), serif" fontStyle="italic" fontSize="18" fill={INK} fillOpacity=".5">
            the Prism
          </text>
        </svg>
        <div className="absolute bottom-[56px] left-[calc(50%-260px)]">
          <PrismCharacter pose="sit" size={54} />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1152px] items-center justify-between px-6 pb-6 font-mono text-[11.5px] uppercase tracking-[.14em]" style={{ color: DIM }}>
          <span>© 2026 {personal.name}</span>
          <span>You are here · 39.12° N 77.56° W</span>
          <span>Look up</span>
        </div>
      </div>
    </section>
  );
}

export const sheets = { projects: ProjectsSheet, 'case-study': CaseStudySheet, journey: JourneySheet, skills: SkillsSheet, log: LogSheet, contact: ContactSheet };

export function AllSheets() {
  return (
    <>
      {Object.entries(sheets).map(([k, S]) => (
        <S key={k} />
      ))}
    </>
  );
}
