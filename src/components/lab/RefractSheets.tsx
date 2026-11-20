'use client';

import { projects, type Project, type ProjectKind } from '@/data/projects';
import { experience } from '@/data/experience';
import { education } from '@/data/education';
import { skillCategories, secondarySkills } from '@/data/skills';
import { news, newsTypeLabels } from '@/data/news';
import { personal } from '@/data/personal';
import { plain, isPh } from '@/data/ph';
import { covers } from '@/components/scenes/covers/registry';
import { Stage } from '@/components/scenes/Stage';
import { Icon } from '@/components/ui/Icon';
import { PrismCharacter } from '@/components/ui/Prism';
import { BANDS, Glass, LightBackdrop, LightHeader, R_BG, R_DIM, R_INK, R_KIND, R_LINE, R_MUTED, SPEC, Swatch } from './RefractKit';

// Static light & refraction mockups of the sections after the hero, matching the constellation sheets
// section for section so the comparison is about the motif. Exploration only.

const kindName: Record<ProjectKind, string> = { software: 'Software', ai: 'AI', data: 'Data', systems: 'Systems' };
const ROSE = BANDS[3];
const GOLD = BANDS[4];

function Sheet({ id, seed, children, h = 900 }: { id: string; seed: number; children: React.ReactNode; h?: number }) {
  return (
    <section data-sheet={id} className="relative overflow-hidden" style={{ background: R_BG, color: R_INK, width: 1440 }}>
      <LightBackdrop seed={seed} h={h} />
      <div className="relative mx-auto max-w-[1152px] px-6 py-24">{children}</div>
    </section>
  );
}

function Cover({ p, className = '' }: { p: Project; className?: string }) {
  const c = covers[p.cover];
  return (
    <div className={`relative ${className}`} style={{ background: 'rgba(255,255,255,.02)' }}>
      <Stage>
        <c.Scene t={c.frozenAt} reduced />
      </Stage>
    </div>
  );
}

const Mono = ({ children, color = R_DIM, className = '' }: { children: React.ReactNode; color?: string; className?: string }) => (
  <p className={`font-mono text-[11px] uppercase tracking-[.16em] ${className}`} style={{ color }}>
    {children}
  </p>
);

/* ---------------- 1. Projects: the work split into a spectrum ---------------- */
export function RProjectsSheet() {
  const spotlight = projects.find((p) => p.spotlight)!;
  const featured = projects.filter((p) => p.featured && !p.spotlight);
  const kinds: ProjectKind[] = ['software', 'systems', 'ai', 'data'];
  const total = projects.length;
  return (
    <Sheet id="projects" seed={5} h={1700}>
      <LightHeader n="05" label="Projects" title="Things I've" accent="built" aside="11 projects · 4 bands" />

      {/* spectrum strip: one band per kind, width by count; each project is a line in its band */}
      <Glass className="mb-4 p-6" sheen={false}>
        <div className="flex h-[84px] overflow-hidden rounded-md">
          {kinds.map((k) => {
            const list = projects.filter((p) => p.kind === k);
            return (
              <div key={k} className="relative flex items-stretch justify-evenly" style={{ width: `${(list.length / total) * 100}%`, background: `linear-gradient(180deg, ${R_KIND[k]}33, ${R_KIND[k]}10)` }}>
                {list.map((p) => (
                  <span key={p.slug} className="w-[2px]" style={{ background: R_KIND[k], opacity: p.featured ? 1 : 0.45, boxShadow: p.featured ? `0 0 12px ${R_KIND[k]}` : undefined }} />
                ))}
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex">
          {kinds.map((k) => {
            const list = projects.filter((p) => p.kind === k);
            return (
              <div key={k} style={{ width: `${(list.length / total) * 100}%` }} className="pr-3">
                <p className="font-serif text-[19px] italic" style={{ color: R_KIND[k] }}>
                  {kindName[k]}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: R_DIM }}>
                  {list.map((p) => p.title.replace('2D Visibility & Lighting Engine', 'Visibility engine')).join(' · ')}
                </p>
              </div>
            );
          })}
        </div>
      </Glass>
      <div className="mb-12 flex items-center gap-2">
        {(['all', 'featured', ...kinds] as const).map((k) => {
          const n = k === 'all' ? total : k === 'featured' ? projects.filter((p) => p.featured).length : projects.filter((p) => p.kind === k).length;
          const on = k === 'featured';
          return (
            <span
              key={k}
              className="flex h-10 items-center gap-2 rounded-full border px-4 text-[13px]"
              style={{ borderColor: on ? 'transparent' : R_LINE, color: on ? R_BG : R_MUTED, background: on ? R_INK : 'transparent' }}
            >
              {k !== 'all' && k !== 'featured' && <Swatch color={R_KIND[k]} w={8} />}
              {k === 'all' ? 'All' : k === 'featured' ? 'Featured' : kindName[k]}
              <span style={{ opacity: 0.6 }}>{n}</span>
            </span>
          );
        })}
        <span className="ml-auto flex h-10 w-[300px] items-center gap-2 rounded-full border px-4 text-[14px]" style={{ borderColor: R_LINE, color: R_DIM }}>
          <Icon name="search" size={15} /> Search projects or technology
        </span>
      </div>

      <Glass className="mb-6 grid min-h-[540px] grid-cols-[1.15fr_1fr]" tone={R_KIND[spotlight.kind]}>
        <Cover p={spotlight} className="h-full border-r" />
        <div className="flex flex-col p-8">
          <p className="flex items-center gap-2 text-[13px]" style={{ color: R_MUTED }}>
            <Swatch color={R_KIND[spotlight.kind]} w={8} /> Spotlight · {kindName[spotlight.kind]} · {spotlight.period}
          </p>
          <h3 className="mt-4 font-display text-[34px] font-bold leading-[1.05] tracking-[-0.03em]">{spotlight.title}</h3>
          <p className="mt-3 text-[15.5px] leading-relaxed" style={{ color: R_MUTED }}>
            {spotlight.summary}
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ['127x', 'faster on mazes'],
              ['66', 'benchmark rows'],
              ['4', 'wall layouts tested'],
            ].map(([v, l], i) => (
              <div key={l} className="rounded-lg border p-3" style={{ borderColor: R_LINE }}>
                <span className="block h-[2px] w-8 rounded-full" style={{ background: BANDS[i + 1] }} />
                <p className="mt-2 font-display text-[22px] font-bold">{v}</p>
                <p className="text-[12px]" style={{ color: R_DIM }}>
                  {l}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-auto flex gap-3 pt-6">
            <span className="relative flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold" style={{ background: R_INK, color: R_BG }}>
              Read the case study <Icon name="arrowRight" size={15} />
            </span>
            <span className="flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold" style={{ borderColor: R_LINE }}>
              <Icon name="github" size={15} /> Source
            </span>
          </div>
        </div>
      </Glass>

      <div className="grid grid-cols-3 gap-6">
        {featured.map((p) => (
          <Glass key={p.slug} tone={R_KIND[p.kind]}>
            <Cover p={p} className="aspect-[16/10] border-b" />
            <div className="p-5">
              <p className="flex items-center gap-2 text-[12.5px]" style={{ color: R_MUTED }}>
                <Swatch color={R_KIND[p.kind]} w={7} /> {kindName[p.kind]}
                <span className="ml-auto" style={{ color: R_DIM }}>
                  {p.period}
                </span>
              </p>
              <h3 className="mt-2.5 font-display text-[22px] font-bold tracking-[-0.02em]">{p.title}</h3>
              <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed" style={{ color: R_MUTED }}>
                {p.summary}
              </p>
            </div>
          </Glass>
        ))}
      </div>
      <p className="mt-8 text-center text-[13px]" style={{ color: R_DIM }}>
        Show all {projects.length} projects ↓
      </p>
    </Sheet>
  );
}

/* ---------------- 2. Case study ---------------- */
export function RCaseStudySheet() {
  const p = projects.find((x) => x.slug === 'docs-qa-copilot')!;
  const kinds: ProjectKind[] = ['software', 'systems', 'ai', 'data'];
  return (
    <Sheet id="case-study" seed={21} h={1500}>
      <div className="grid grid-cols-[1fr_280px] gap-12">
        <div>
          <p className="flex items-center gap-2 text-[13px]" style={{ color: R_MUTED }}>
            <Swatch color={R_KIND[p.kind]} w={8} /> {kindName[p.kind]} · {p.period} · Live
          </p>
          <h1 className="mt-4 font-display text-[64px] font-bold leading-[.98] tracking-[-0.04em]">{p.title}</h1>
          <p className="mt-5 max-w-[640px] font-serif text-[22px] italic leading-snug" style={{ color: '#d9d4f7' }}>
            Answers you can check: every claim points at a page, and the evaluation shows every miss.
          </p>
          <div className="mt-7 flex gap-3">
            <span className="flex h-11 items-center gap-2 rounded-full px-5 font-semibold" style={{ background: R_INK, color: R_BG }}>
              <Icon name="external" size={15} /> Live site
            </span>
            <span className="flex h-11 items-center gap-2 rounded-full border px-5 font-semibold" style={{ borderColor: R_LINE }}>
              <Icon name="github" size={15} /> Source
            </span>
            <span className="flex h-11 items-center gap-2 px-3 font-semibold" style={{ color: R_MUTED }}>
              Evaluation page <Icon name="arrowUpRight" size={14} />
            </span>
          </div>
          <Glass className="mt-10" tone={R_KIND[p.kind]}>
            <Cover p={p} className="aspect-[16/8]" />
          </Glass>

          <Mono className="mt-14">Measured on a frozen 50-question set</Mono>
          <div className="mt-4 space-y-4">
            {[
              [46, 50, 'Answers correct'],
              [40, 42, 'Citations correct'],
              [28, 30, 'Held-out answers correct'],
              [8, 8, 'Unanswerable questions abstained'],
            ].map(([a, b, l], i) => (
              <div key={String(l)} className="grid grid-cols-[220px_1fr_70px] items-center gap-4">
                <p className="text-[14.5px]" style={{ color: R_MUTED }}>
                  {l}
                </p>
                <div className="h-3 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,.07)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(Number(a) / Number(b)) * 100}%`, background: `linear-gradient(90deg, ${BANDS[i]}, ${BANDS[i + 1]})` }} />
                </div>
                <p className="text-right font-display text-[20px] font-bold">
                  {a}
                  <span style={{ color: R_DIM }}>/{b}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[13.5px]" style={{ color: R_DIM }}>
            One question moves a split by 3 to 5 points. Held-out questions were run once, after the code froze.
          </p>

          <Mono className="mt-14">At a glance</Mono>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {(['problem', 'built', 'decisions', 'outcome'] as const).map((k, i) => (
              <Glass key={k} className="p-5" tone={BANDS[i]}>
                <p className="font-serif text-[20px] italic" style={{ color: BANDS[i] }}>
                  {k === 'built' ? 'What I built' : k[0].toUpperCase() + k.slice(1)}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed" style={{ color: R_MUTED }}>
                  {p.glance![k]}
                </p>
              </Glass>
            ))}
          </div>
        </div>

        <aside className="sticky top-8 self-start">
          <Glass className="p-5" sheen={false}>
            <Mono>Where it sits</Mono>
            <div className="mt-3 flex h-10 overflow-hidden rounded-md">
              {kinds.map((k) => {
                const list = projects.filter((x) => x.kind === k);
                return (
                  <div key={k} className="flex justify-evenly" style={{ width: `${(list.length / projects.length) * 100}%`, background: k === p.kind ? `${R_KIND[k]}40` : `${R_KIND[k]}12` }}>
                    {list.map((x) => (
                      <span key={x.slug} className="w-[2px]" style={{ background: R_KIND[k], opacity: x.slug === p.slug ? 1 : 0.35, boxShadow: x.slug === p.slug ? `0 0 10px ${R_KIND[k]}` : undefined }} />
                    ))}
                  </div>
                );
              })}
            </div>
            <ul className="mt-4 space-y-1.5 text-[13px]">
              {projects
                .filter((x) => x.kind === p.kind)
                .map((x) => (
                  <li key={x.slug} className="flex items-center gap-2" style={{ color: x.slug === p.slug ? R_INK : R_MUTED }}>
                    <Swatch color={R_KIND.ai} w={6} /> {x.title}
                  </li>
                ))}
            </ul>
          </Glass>
          <Glass className="mt-4 p-5" sheen={false}>
            <Mono>Built with</Mono>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: R_MUTED }}>
              {p.tech.join(' · ')}
            </p>
            <Mono className="mt-4">My part</Mono>
            <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: R_MUTED }}>
              {p.role}
            </p>
          </Glass>
          <p className="mt-4 text-[13px]" style={{ color: R_DIM }}>
            Next: Internship Scout Agent →
          </p>
        </aside>
      </div>
    </Sheet>
  );
}

/* ---------------- 3. Journey: one beam passing through each stop ---------------- */
export function RJourneySheet() {
  const formwork = experience[0];
  const jmu = education[0];
  const nova = education[1];
  const stops = [
    { x: 230, when: nova.period, title: nova.school, kind: 'Education', color: ROSE },
    { x: 500, when: plain(jmu.period), title: jmu.school, kind: 'Education', color: BANDS[2], ph: isPh(jmu.period) },
    { x: 780, when: formwork.period, title: formwork.org, kind: 'Work', color: BANDS[0] },
    { x: 1000, when: 'Dec 2027', title: 'Graduation', kind: 'Ahead', color: GOLD, future: true },
  ];
  const y = 230;
  return (
    <Sheet id="journey" seed={33} h={1250}>
      <LightHeader n="02" label="Experience & education" title="The path" accent="so far" aside="2023 → 2027" />
      <Glass className="h-[400px]" sheen={false}>
        <svg viewBox="0 0 1104 400" className="h-full w-full" aria-hidden>
          <defs>
            <filter id="jb">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <linearGradient id="jin" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity=".8" />
            </linearGradient>
          </defs>
          {/* beam segments: white in, then the colour of each stage */}
          <line x1="20" y1={y} x2={stops[0].x - 18} y2={y} stroke="url(#jin)" strokeWidth="2" />
          {stops.slice(0, -1).map((s, i) => {
            const n = stops[i + 1];
            return (
              <g key={s.title}>
                <line x1={s.x + 18} y1={y} x2={n.x - 18} y2={y} stroke={s.color} strokeWidth="7" opacity=".35" filter="url(#jb)" />
                <line x1={s.x + 18} y1={y} x2={n.x - 18} y2={y} stroke={s.color} strokeWidth="1.8" strokeDasharray={n.future ? '6 7' : undefined} />
              </g>
            );
          })}
          {stops.map((s, i) => {
            const up = i % 2 === 1;
            return (
              <g key={s.title} transform={`translate(${s.x} ${y})`}>
                <path d="M0 -24 L22 14 L-22 14Z" fill="rgba(255,255,255,.06)" stroke={s.future ? 'rgba(255,255,255,.3)' : '#fff'} strokeOpacity={s.future ? 1 : 0.5} strokeDasharray={s.future ? '3 3' : undefined} strokeLinejoin="round" />
                <text y={up ? 44 : -44} textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="11" letterSpacing=".14em" fill={s.color}>
                  {s.kind.toUpperCase()}
                </text>
                <text y={up ? -64 : 52} textAnchor="middle" fontFamily="var(--font-bricolage)" fontWeight="700" fontSize="17" fill={R_INK}>
                  {s.title}
                </text>
                <text y={up ? -44 : 72} textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill={s.ph ? '#f5b301' : R_DIM}>
                  {s.when}
                  {s.ph ? ' (placeholder start)' : ''}
                </text>
              </g>
            );
          })}
          <g transform={`translate(${stops[2].x - 21} ${y - 104})`}>
            <foreignObject width="42" height="56">
              <PrismCharacter pose="wave" size={42} />
            </foreignObject>
          </g>
          <text x="1084" y="384" textAnchor="end" fontFamily="var(--font-jetbrains), monospace" fontSize="10" letterSpacing=".12em" fill={R_DIM}>
            EACH STOP CHANGES THE LIGHT · DASHED = AHEAD
          </text>
        </svg>
      </Glass>

      <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6">
        <Glass className="p-7" tone={BANDS[0]}>
          <p className="text-[13px]" style={{ color: BANDS[0] }}>
            Now · {formwork.period}
          </p>
          <h3 className="mt-2 font-display text-[28px] font-bold tracking-[-0.025em]">{formwork.role}</h3>
          <p style={{ color: R_MUTED }}>
            {formwork.org} · {formwork.place}
          </p>
          <ul className="mt-5 space-y-3 text-[15px] leading-relaxed" style={{ color: R_MUTED }}>
            {formwork.points.slice(0, 3).map((pt) => (
              <li key={pt} className="flex gap-3">
                <span className="mt-[9px]">
                  <Swatch color={BANDS[0]} w={6} />
                </span>
                {pt}
              </li>
            ))}
          </ul>
        </Glass>
        <div className="grid gap-6">
          {[
            [jmu, BANDS[2]],
            [nova, ROSE],
          ].map(([e, c]) => {
            const ed = e as (typeof education)[number];
            return (
              <Glass key={ed.id} className="p-6" tone={c as string}>
                <p className="text-[13px]" style={{ color: c as string }}>
                  {plain(ed.period)}
                </p>
                <h3 className="mt-1.5 font-display text-[21px] font-bold">{ed.school}</h3>
                <p className="text-[14.5px]" style={{ color: R_MUTED }}>
                  {ed.credential}
                </p>
              </Glass>
            );
          })}
        </div>
      </div>
    </Sheet>
  );
}

/* ---------------- 4. Skills: an emission spectrum per category ---------------- */
export function RSkillsSheet() {
  const tone = (i: number) => BANDS[i % BANDS.length];
  return (
    <Sheet id="skills" seed={44} h={1250}>
      <LightHeader n="04" label="Skills" title="Skills, in" accent="spectrum" aside={`${skillCategories.reduce((a, c) => a + c.items.length, 0)} lines`} />
      <div className="space-y-3">
        {skillCategories.map((c, ci) => (
          <div key={c.id} className="grid grid-cols-[200px_1fr] items-center gap-6">
            <div>
              <p className="font-serif text-[21px] italic" style={{ color: tone(ci) }}>
                {c.label}
              </p>
              <p className="text-[12px] leading-snug" style={{ color: R_DIM }}>
                {c.blurb}
              </p>
            </div>
            <div className="relative h-[64px] overflow-hidden rounded-lg" style={{ background: `linear-gradient(90deg, ${tone(ci)}10, ${tone(ci + 1)}18, ${tone(ci)}08)`, border: `1px solid ${R_LINE}` }}>
              <div className="absolute inset-0 flex items-stretch justify-around px-6">
                {c.items.map((s, i) => (
                  <div key={s} className="relative flex flex-col items-center">
                    <span className="h-full w-[2px]" style={{ background: tone(ci), boxShadow: `0 0 10px ${tone(ci)}` }} />
                    <span
                      className="absolute whitespace-nowrap font-mono text-[10.5px]"
                      style={{ color: R_INK, top: i % 2 ? 'auto' : 6, bottom: i % 2 ? 6 : 'auto', left: i === c.items.length - 1 ? 'auto' : 6, right: i === c.items.length - 1 ? 6 : 'auto', background: 'rgba(8,8,12,.78)', padding: '0 4px', borderRadius: 3 }}
                    >
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 grid grid-cols-3 gap-6">
        {secondarySkills.map((g, i) => (
          <Glass key={g.id} className="p-5" tone={BANDS[i + 1]}>
            <Mono>{g.label}</Mono>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: R_MUTED }}>
              {g.items.map((s) => plain(s)).join(' · ')}
            </p>
          </Glass>
        ))}
      </div>
      <p className="mt-8 text-[13px]" style={{ color: R_DIM }}>
        No proficiency bars: each line is a thing I have used in a listed project or role.
      </p>
    </Sheet>
  );
}

/* ---------------- 5. Activity ---------------- */
export function RLogSheet() {
  const sorted = [...news].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 8);
  const typeTone: Record<string, string> = { launch: BANDS[0], release: BANDS[1], work: BANDS[2], education: ROSE, award: GOLD, 'open-source': '#22c55e', study: GOLD };
  return (
    <Sheet id="log" seed={55} h={1200}>
      <LightHeader n="09" label="Activity" title="Recent" accent="activity" aside="newest first" />
      <div className="grid grid-cols-[200px_1fr] gap-10">
        <div className="space-y-1.5">
          {Object.entries(newsTypeLabels).map(([k, l]) => (
            <p key={k} className="flex items-center gap-3 rounded-full px-3 py-1.5 text-[13.5px]" style={{ color: R_MUTED }}>
              <Swatch color={typeTone[k]} w={7} /> {l}
              <span className="ml-auto" style={{ opacity: 0.6 }}>
                {news.filter((n) => n.type === k).length}
              </span>
            </p>
          ))}
        </div>
        <ol className="relative space-y-3">
          {sorted.map((n) => {
            const d = new Date(n.date + 'T00:00:00Z');
            return (
              <li key={n.id}>
                <Glass className={`grid grid-cols-[96px_1fr] items-center gap-6 py-4 pl-5 pr-6 ${n.placeholder ? 'opacity-60' : ''}`} sheen={false}>
                  <span aria-hidden className="absolute bottom-3 left-0 top-3 w-[3px] rounded-full" style={{ background: typeTone[n.type], boxShadow: `0 0 14px ${typeTone[n.type]}` }} />
                  <p className="text-[13px]" style={{ color: R_DIM }}>
                    {d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
                  </p>
                  <div>
                    <p className="text-[12px]" style={{ color: typeTone[n.type] }}>
                      {newsTypeLabels[n.type]}
                      {n.placeholder ? ' · placeholder' : ''}
                    </p>
                    <p className="font-display text-[19px] font-bold tracking-[-0.015em]">{plain(n.title)}</p>
                    <p className="text-[14.5px]" style={{ color: R_MUTED }}>
                      {plain(n.detail)}
                    </p>
                  </div>
                </Glass>
              </li>
            );
          })}
        </ol>
      </div>
    </Sheet>
  );
}

/* ---------------- 6. Contact + footer: light breaking over the horizon ---------------- */
export function RContactSheet() {
  return (
    <section data-sheet="contact" className="relative overflow-hidden" style={{ background: R_BG, color: R_INK, width: 1440 }}>
      <LightBackdrop seed={66} h={1300} />
      <div className="relative mx-auto max-w-[1152px] px-6 pt-24">
        <LightHeader n="10" label="Contact" title="Let's" accent="talk" aside={personal.location} />
        <div className="grid grid-cols-[1fr_1.35fr] gap-8">
          <div className="space-y-3">
            {[
              ['mail', 'Email', personal.email, BANDS[0]],
              ['linkedin', 'LinkedIn', personal.links.linkedinHandle, BANDS[1]],
              ['github', 'GitHub', personal.links.githubUser, BANDS[2]],
            ].map(([ic, l, v, c]) => (
              <Glass key={l} className="flex items-center gap-4 p-4" tone={c}>
                <span className="grid h-11 w-11 place-items-center rounded-full" style={{ background: `${c}1f`, color: c }}>
                  <Icon name={ic} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px]" style={{ color: R_DIM }}>
                    {l}
                  </p>
                  <p className="truncate font-semibold">{v}</p>
                </div>
                <Icon name="arrowUpRight" size={16} />
              </Glass>
            ))}
          </div>
          <Glass className="space-y-4 p-7">
            {['Name', 'Email'].map((f) => (
              <div key={f}>
                <p className="mb-2 text-[13px]" style={{ color: R_MUTED }}>
                  {f}
                </p>
                <div className="h-12 rounded-lg border" style={{ borderColor: R_LINE, background: 'rgba(255,255,255,.03)' }} />
              </div>
            ))}
            <div>
              <p className="mb-2 text-[13px]" style={{ color: R_MUTED }}>
                Message
              </p>
              <div className="h-32 rounded-lg border" style={{ borderColor: R_LINE, background: 'rgba(255,255,255,.03)' }} />
            </div>
            <div className="relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full font-semibold" style={{ background: R_INK, color: R_BG }}>
              <Icon name="send" size={16} /> Write it in my email app
              <span className="absolute inset-x-8 bottom-0 h-[2px]" style={{ background: SPEC }} />
            </div>
          </Glass>
        </div>
      </div>

      {/* footer: a beam meets the prism on the horizon and the spectrum spreads across the ground like dawn */}
      <div className="relative mt-24 h-[420px]">
        <svg viewBox="0 0 1440 420" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <filter id="fb">
              <feGaussianBlur stdDeviation="30" />
            </filter>
            <linearGradient id="fbeam" x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity=".85" />
            </linearGradient>
          </defs>
          <g filter="url(#fb)" opacity=".55" style={{ mixBlendMode: 'screen' }}>
            {BANDS.map((c, i) => (
              <path key={c} d={`M748 300 L${1440} ${150 + i * 50} L1440 ${200 + i * 50}Z`} fill={c} />
            ))}
          </g>
          {BANDS.map((c, i) => (
            <line key={c} x1="748" y1="300" x2="1440" y2={175 + i * 50} stroke={c} strokeOpacity=".6" />
          ))}
          <line x1="0" y1="190" x2="704" y2="292" stroke="url(#fbeam)" strokeWidth="1.6" />
          <path d="M720 228 L770 330 L670 330Z" fill="rgba(255,255,255,.07)" stroke="#fff" strokeOpacity=".4" strokeLinejoin="round" />
          <circle cx="708" cy="300" r="3.5" fill={R_INK} />
          <circle cx="732" cy="300" r="3.5" fill={R_INK} />
          <path d="M0 340 Q 360 320 720 334 T 1440 330 V420 H0Z" fill="#050508" />
        </svg>
        <div className="absolute bottom-[78px] left-[calc(50%-300px)]">
          <PrismCharacter pose="sit" size={54} />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-[1152px] items-center justify-between px-6 pb-6 text-[13px]" style={{ color: R_DIM }}>
          <span>© 2026 {personal.name}</span>
          <span>Built by hand in Leesburg, VA</span>
          <span>Back to top ↑</span>
        </div>
      </div>
    </section>
  );
}

const rsheets = { projects: RProjectsSheet, 'case-study': RCaseStudySheet, journey: RJourneySheet, skills: RSkillsSheet, log: RLogSheet, contact: RContactSheet };

export function AllRefractSheets() {
  return (
    <>
      {Object.entries(rsheets).map(([k, S]) => (
        <S key={k} />
      ))}
    </>
  );
}
