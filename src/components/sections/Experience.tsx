'use client';

import { useCallback, useState } from 'react';
import { experience, type Experience as Exp } from '@/data/experience';
import { education } from '@/data/education';
import { isPh, plain } from '@/data/ph';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StarGlyph } from '@/components/ui/StarGlyph';
import { Text, PhRibbon } from '@/components/ui/Text';
import { Icon } from '@/components/ui/Icon';
import { GlossText } from '@/components/ui/Gloss';
import { Reveal } from '@/components/ui/Reveal';
import { Modal } from '@/components/ui/Modal';
import { SceneHost } from '@/components/scenes/Stage';
import { FormworkScene } from '@/components/scenes/FormworkScene';
import { useSeenOnce } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';

const tone = (c: string) => ({ '--tone': c }) as React.CSSProperties;

/* ---------------- Route stops, built from data ---------------- */

type StopKind = 'work' | 'education' | 'ahead';
type Stop = { id: string; kind: StopKind; title: string; when: string; placeholder: boolean; at: number };

const KIND_LABEL: Record<StopKind, string> = { work: 'Work', education: 'Education', ahead: 'Ahead' };
const KIND_COLOR: Record<StopKind, string> = { work: 'var(--kind-ai)', education: 'var(--rose)', ahead: 'var(--route)' };

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** Month index (year * 12 + month) of the first "Mon YYYY" in a period string; 0 when there is none. */
function periodStart(period: string): number {
  const m = /([A-Za-z]{3})[a-z]*\.? (\d{4})/.exec(plain(period));
  const month = m ? MONTHS.indexOf(m[1].toLowerCase()) : -1;
  return m && month >= 0 ? Number(m[2]) * 12 + month : 0;
}

function buildStops(): Stop[] {
  const stops: Stop[] = [
    ...education.map<Stop>((e) => ({
      id: `edu-${e.id}`,
      kind: 'education',
      title: e.school,
      when: plain(e.period),
      placeholder: isPh(e.period),
      at: periodStart(e.period),
    })),
    ...experience
      .filter((e) => e.kind === 'primary')
      .map<Stop>((e) => ({
        id: `exp-${e.id}`,
        kind: 'work',
        title: e.org,
        when: plain(e.period),
        placeholder: !!e.placeholder || isPh(e.period),
        at: e.start ? Number(e.start.slice(0, 4)) * 12 + Number(e.start.slice(5, 7)) - 1 : periodStart(e.period),
      })),
  ].sort((a, b) => a.at - b.at);

  // The ahead stop: the date after "Expected" in the current school's period. Without one, it is left out.
  for (const e of education) {
    const m = /Expected\s+(.+)$/.exec(plain(e.period));
    if (m) {
      stops.push({ id: 'ahead', kind: 'ahead', title: 'Graduation', when: m[1].trim(), placeholder: false, at: Infinity });
      break;
    }
  }
  return stops;
}

/* ---------------- Route map geometry (1104 x 380 frame) ---------------- */

const W = 1104;
const H = 380;
const X0 = 210;
const X1 = 1000;
const YS = [300, 210, 270, 170]; // low / high, repeated for more stops
const DRAW = 1.2; // seconds
const EASE = 'cubic-bezier(.33,1,.68,1)'; // ease-out cubic, inverted below to time each stop's fade-in
const r1 = (n: number) => Math.round(n * 10) / 10;

function layout(n: number) {
  const pts = Array.from({ length: n }, (_, i) => ({ x: r1(n === 1 ? X0 : X0 + (i * (X1 - X0)) / (n - 1)), y: YS[i % YS.length] }));
  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 1; i < n; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const k = (b.x - a.x) * 0.4;
    d += ` C${r1(a.x + k)},${a.y} ${r1(b.x - k)},${b.y} ${b.x},${b.y}`;
  }
  // how far along the route each stop is (by chord length), to time its fade-in against the draw
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = cum[n - 1] || 1;
  const delays = cum.map((c) => r1(DRAW * (1 - Math.pow(1 - c / total, 1 / 3))) );
  return { pts, d, delays };
}

function RouteMap({ stops, shown, reduced }: { stops: Stop[]; shown: boolean; reduced: boolean }) {
  const { pts, d, delays } = layout(stops.length);
  const drawn = shown || reduced;
  const ease = reduced ? 'none' : undefined;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="hidden h-full w-full md:block" aria-hidden="true" focusable="false">
      <defs>
        <mask id="route-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
          <path
            d={d}
            fill="none"
            stroke="#fff"
            strokeWidth="8"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: drawn ? 0 : 1,
              transition: ease ?? `stroke-dashoffset ${DRAW}s ${EASE}`,
            }}
          />
        </mask>
      </defs>
      <path d={d} fill="none" stroke="var(--route)" strokeWidth="1.6" strokeDasharray="6 7" mask="url(#route-reveal)" />
      {stops.map((s, i) => {
        const p = pts[i];
        const color = KIND_COLOR[s.kind];
        const ahead = s.kind === 'ahead';
        // a stop higher than both neighbours carries its labels above; the ends have one neighbour, so they stay low
        const up = i > 0 && i < stops.length - 1 && p.y < pts[i - 1].y && p.y < pts[i + 1].y;
        return (
          <g key={s.id} transform={`translate(${p.x} ${p.y})`} style={{ opacity: drawn ? 1 : 0, transition: ease ?? `opacity .5s ease ${delays[i]}s` }}>
            <circle r="15" fill="none" stroke={color} strokeOpacity=".5" strokeDasharray={ahead ? '2 3' : undefined} />
            <circle r={ahead ? 4 : 5} fill={ahead ? 'none' : color} stroke={color} strokeWidth="1.4" />
            <text y={up ? 34 : -28} textAnchor="middle" fontSize="11" letterSpacing=".14em" style={{ fill: color, fontFamily: 'var(--font-mono)' }}>
              {KIND_LABEL[s.kind].toUpperCase()}
            </text>
            <text y={up ? -48 : 42} textAnchor="middle" fontSize="17" fontWeight="700" style={{ fill: 'var(--fg)', fontFamily: 'var(--font-display)' }}>
              {s.title}
            </text>
            <text y={up ? -28 : 62} textAnchor="middle" fontSize="11" style={{ fill: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {s.when}
              {s.placeholder && <tspan style={{ fill: 'var(--ph)' }}> · start is a placeholder</tspan>}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Below 768px: stops top to bottom along a dashed line on the left, oldest first. */
function RouteList({ stops, shown, reduced }: { stops: Stop[]; shown: boolean; reduced: boolean }) {
  const drawn = shown || reduced;
  const n = stops.length;
  const seg = DRAW / Math.max(1, n - 1);
  return (
    <ol className="grid gap-9 p-5 md:hidden" aria-hidden="true">
      {stops.map((s, i) => {
        const color = KIND_COLOR[s.kind];
        const ahead = s.kind === 'ahead';
        const delay = r1(i * seg);
        return (
          <li key={s.id} className="relative pl-9">
            {i < n - 1 && (
              <span
                className="absolute left-[7px] top-[11px] -ml-px w-0 border-l-[1.6px] border-dashed"
                style={{
                  height: 'calc(100% + 36px)',
                  borderColor: 'var(--route)',
                  clipPath: drawn ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
                  transition: reduced ? 'none' : `clip-path ${r1(seg)}s linear ${delay}s`,
                }}
              />
            )}
            <span
              className="absolute left-0 top-[3px] grid h-[15px] w-[15px] place-items-center rounded-full border"
              style={{
                borderColor: `color-mix(in srgb, ${color} 50%, transparent)`,
                borderStyle: ahead ? 'dashed' : 'solid',
                background: 'transparent',
                opacity: drawn ? 1 : 0,
                transition: reduced ? 'none' : `opacity .5s ease ${delay}s`,
              }}
            >
              <span className="block h-[5px] w-[5px] rounded-full border" style={{ background: ahead ? 'transparent' : color, borderColor: color }} />
            </span>
            <div style={{ opacity: drawn ? 1 : 0, transition: reduced ? 'none' : `opacity .5s ease ${delay}s` }}>
              <p className="mono text-[11px] uppercase tracking-[.14em]" style={{ color }}>
                {KIND_LABEL[s.kind]}
              </p>
              <p className="display mt-1 text-[17px] leading-snug text-fg">{s.title}</p>
              <p className="mono mt-0.5 text-[11px] text-muted">
                {s.when}
                {s.placeholder && <span style={{ color: 'var(--ph)' }}> · start is a placeholder</span>}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Route() {
  const [ref, seen] = useSeenOnce<HTMLDivElement>();
  const { reduced } = useMotion();
  const stops = buildStops();
  return (
    <div ref={ref} className="panel relative overflow-hidden md:h-[380px]">
      <RouteMap stops={stops} shown={seen} reduced={reduced} />
      <RouteList stops={stops} shown={seen} reduced={reduced} />
    </div>
  );
}

/* ---------------- Section ---------------- */

export function Experience() {
  const [open, setOpen] = useState<Exp | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const current = experience.find((e) => e.kind === 'primary');
  const secondary = experience.filter((e) => e.kind === 'secondary');
  // newest first
  const schools = [...education].sort((a, b) => periodStart(b.period) - periodStart(a.period));
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <div className="wrap">
        <SectionHeader id="experience" />
        <Reveal>
          <Route />
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
          {current && (
            <Reveal className="min-w-0">
              <article className="panel h-full p-6 md:p-7" data-tone style={tone('var(--kind-ai)')}>
                <p className="text-[13px] text-kind-ai">Now · {current.period}</p>
                <h3 className="display mt-2 text-[26px] leading-[1.15] text-fg">{current.role}</h3>
                <p className="text-fg-2">
                  {current.org} · {current.place}
                </p>
                <ul className="mt-4 grid gap-2.5 text-[15px] leading-relaxed text-fg-2">
                  {current.points.slice(0, 2).map((p) => (
                    <li key={p} className="flex gap-3">
                      <span className="mt-[7px]">
                        <StarGlyph color="var(--kind-ai)" size={9} />
                      </span>
                      <span>
                        <GlossText text={p} />
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {current.stack.map((s) => (
                    <li key={s} className="chip">
                      {s}
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn mt-5 h-10 min-h-0 text-sm" onClick={() => setOpen(current)}>
                  Details <Icon name="arrowRight" size={15} />
                </button>
              </article>
            </Reveal>
          )}

          <div id="education" className="grid min-w-0 content-start gap-6 scroll-mt-4">
            {schools.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.06}>
                <article className="panel h-full p-6" data-tone style={tone('var(--rose)')}>
                  <p className="text-[13px] text-rose">
                    <Text v={e.period} badge={false} />
                  </p>
                  <h3 className="display mt-1.5 text-[20px] leading-snug text-fg">{e.school}</h3>
                  <p className="text-[14.5px] text-fg-2">{e.credential}</p>
                  {e.links && (
                    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
                      {e.links.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="link-u text-fg-2 hover:text-fg">
                          {l.label}
                        </a>
                      ))}
                    </p>
                  )}
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        {secondary.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {secondary.map((e) => (
              <Reveal key={e.id}>
                <article className={`panel relative p-4 ${e.placeholder ? 'ph-card' : ''}`}>
                  {e.placeholder && <PhRibbon />}
                  <h3 className={`text-[15px] font-semibold leading-snug text-fg ${e.placeholder ? 'pr-20' : ''}`}>
                    <Text v={e.role} badge={false} />
                  </h3>
                  <p className="text-[13.5px] text-fg-2">
                    {e.org} · {e.place}
                  </p>
                  <p className="mono mt-1 text-[11.5px] text-muted">
                    <Text v={e.period} badge={false} />
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
      <Modal open={!!open} onClose={close} label={open ? `${open.role} at ${open.org}` : ''}>
        {open && (
          <div className="p-5 md:p-7">
            <p className="mono text-[12.5px] text-accent">{open.period}</p>
            <h3 className="display mt-1 text-2xl text-fg">{open.role}</h3>
            <p className="text-fg-2">
              {open.org} · {open.place}
            </p>
            {open.scene && (
              <div className="panel mt-5 overflow-hidden">
                <SceneHost Scene={FormworkScene} frozenAt={9.2} label="Agent integration, a QA pass and a release train." className="aspect-[16/10] w-full" />
              </div>
            )}
            <h4 className="label mb-3 mt-6 !text-accent">What I did</h4>
            <ul className="grid gap-3">
              {open.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-fg-2">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>
                    <GlossText text={p} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mono mt-6 text-[11.5px] text-muted">Described in the résumé&apos;s public wording only. No client names, screenshots or ticket content.</p>
          </div>
        )}
      </Modal>
    </section>
  );
}
