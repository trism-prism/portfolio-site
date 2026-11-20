'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { boxWalls, buildGrid, polyArea, polyPath, visibility, type Pt, type Seg } from '@/lib/visibility';
import { useMotion } from '@/lib/motion';
import { useSeenOnce } from '@/lib/hooks';
import { mulberry32 } from '@/lib/kit';

/* ---------------- Visibility: drag the light ----------------
   A real visibility polygon computed in the browser as you move the light (pointer or arrow keys).
   It is a sketch of the idea using epsilon rays, not the engine's exact C++ method. */
const DW = 480, DH = 300;
const sg = (ax: number, ay: number, bx: number, by: number): Seg => ({ a: { x: ax, y: ay }, b: { x: bx, y: by } });
const LAYOUTS: Record<string, Seg[]> = {
  rooms: [sg(120, 0, 120, 110), sg(120, 160, 120, 300), sg(120, 150, 260, 150), sg(310, 150, 480, 150), sg(330, 40, 330, 110), sg(200, 220, 260, 260), sg(380, 210, 430, 260), sg(40, 60, 80, 60)],
  pillars: (() => {
    const out: Seg[] = [];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        const x = 70 + i * 110, y = 60 + j * 90, r = 14;
        out.push(sg(x - r, y - r, x + r, y - r), sg(x + r, y - r, x + r, y + r), sg(x + r, y + r, x - r, y + r), sg(x - r, y + r, x - r, y - r));
      }
    return out;
  })(),
  maze: (() => {
    const r = mulberry32(5);
    const out: Seg[] = [];
    for (let i = 0; i < 26; i++) {
      const x = 20 + Math.floor(r() * 11) * 40, y = 20 + Math.floor(r() * 7) * 40;
      out.push(r() > 0.5 ? sg(x, y, x + 40, y) : sg(x, y, x, y + 40));
    }
    return out;
  })(),
};

export function VisibilityDemo() {
  const id = useId().replace(/:/g, '');
  const [layout, setLayout] = useState<keyof typeof LAYOUTS>('rooms');
  const [light, setLight] = useState<Pt>({ x: 200, y: 90 });
  const [showRays, setShowRays] = useState(false);
  const svg = useRef<SVGSVGElement>(null);
  const walls = useMemo(() => [...boxWalls(DW, DH), ...LAYOUTS[layout]], [layout]);
  const grid = useMemo(() => buildGrid(walls, DW, DH, 40), [walls]);
  const vis = useMemo(() => visibility(light, walls, grid), [light, walls, grid]);
  const area = polyArea(vis.polygon) / (DW * DH);

  const move = (e: React.PointerEvent) => {
    if (!svg.current) return;
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType !== 'mouse') return;
    const r = svg.current.getBoundingClientRect();
    setLight({ x: Math.min(DW - 2, Math.max(2, ((e.clientX - r.left) / r.width) * DW)), y: Math.min(DH - 2, Math.max(2, ((e.clientY - r.top) / r.height) * DH)) });
  };
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 30 : 10;
    const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    setLight((l) => ({ x: Math.min(DW - 2, Math.max(2, l.x + d[0])), y: Math.min(DH - 2, Math.max(2, l.y + d[1])) }));
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Wall layout" className="flex rounded-lg border border-line-2 p-0.5">
          {Object.keys(LAYOUTS).map((k) => (
            <button key={k} role="radio" aria-checked={layout === k} onClick={() => setLayout(k as keyof typeof LAYOUTS)} className={`mono rounded-md px-3 py-1 text-xs ${layout === k ? 'bg-panel-2 text-fg' : 'text-fg-2'}`}>
              {k}
            </button>
          ))}
        </div>
        <label className="mono flex items-center gap-2 text-xs text-fg-2">
          <input type="checkbox" checked={showRays} onChange={(e) => setShowRays(e.target.checked)} className="accent-[var(--accent)]" /> show rays
        </label>
      </div>
      <svg
        ref={svg}
        viewBox={`0 0 ${DW} ${DH}`}
        className="w-full touch-none rounded-xl border border-line bg-[#07090a] focus-visible:outline-2"
        tabIndex={0}
        role="application"
        aria-label={`Visibility demo. Light at ${Math.round(light.x)}, ${Math.round(light.y)}. ${Math.round(area * 100)} percent of the room is lit. Use arrow keys to move the light.`}
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onKeyDown={onKey}
      >
        <defs>
          <radialGradient id={`dl-${id}`} cx={light.x} cy={light.y} r="320" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fde68a" stopOpacity=".7" />
            <stop offset=".5" stopColor="#f59e0b" stopOpacity=".22" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={polyPath(vis.polygon)} fill={`url(#dl-${id})`} />
        {showRays &&
          vis.polygon.map((p, i) => <line key={i} x1={light.x} y1={light.y} x2={p.x} y2={p.y} stroke="#5eead4" strokeOpacity=".25" strokeWidth=".6" />)}
        <g stroke="#fb923c" strokeWidth="3" strokeLinecap="round">
          {LAYOUTS[layout].map((w, i) => (
            <line key={i} x1={w.a.x} y1={w.a.y} x2={w.b.x} y2={w.b.y} />
          ))}
        </g>
        <circle cx={light.x} cy={light.y} r="12" fill="#fde68a" opacity=".25" />
        <circle cx={light.x} cy={light.y} r="5" fill="#fde68a" />
      </svg>
      <dl className="mono mt-3 grid grid-cols-2 gap-2 text-[12px] sm:grid-cols-4">
        {[
          ['rays', vis.rays],
          ['brute tests', vis.bruteTests],
          ['grid tests', vis.gridTests],
          ['lit area', `${(area * 100).toFixed(1)}%`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border border-line p-2">
            <dt className="text-muted">{k}</dt>
            <dd className="text-fg">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-[12.5px] text-muted">Drag, tap or use the arrow keys (Shift for bigger steps). A browser sketch with epsilon rays; the engine itself uses exact predicates and one-sided hit limits.</p>
    </div>
  );
}

/* ---------------- Docs Q&A: scripted terminal ----------------
   Three predefined scripts. Typing ~35 ms/char, 320 ms command pause, 170 ms per output row, 2.6 s hold
   before the next tab. Manual tab choice stops auto-advance. Nothing is executed. */
const SCRIPTS: Record<string, { cmd: string; out: { t: string; c?: string }[] }> = {
  ingest: {
    cmd: 'npm run ingest -- data/*.pdf',
    out: [
      { t: 'reading 2 PDFs · 296 pages' },
      { t: 'word-gap threshold set from measured gaps', c: 'amber' },
      { t: 'chunking by section, keeping page numbers' },
      { t: 'embedding → pgvector' },
      { t: '✓ index ready', c: 'green' },
    ],
  },
  ask: {
    cmd: 'ask "What does Part A cover for a hospital stay?"',
    out: [
      { t: 'retrieving top passages…' },
      { t: 'Part A covers inpatient hospital care… [1]' },
      { t: '[1] Medicare & You 2027, p.30', c: 'accent' },
      { t: 'ask "What is the capital of Peru?"' },
      { t: 'not found in these documents · 0 citations', c: 'amber' },
    ],
  },
  eval: {
    cmd: 'npm run eval -- --frozen',
    out: [
      { t: 'dev 20 · held-out 30 · run once after freeze' },
      { t: 'answers   46/50   92%', c: 'green' },
      { t: 'citations 40/42   95%', c: 'green' },
      { t: 'held-out  28/30', c: 'green' },
      { t: 'abstain    8/8 unanswerable', c: 'accent' },
    ],
  },
};
const TABS = Object.keys(SCRIPTS);

export function DocsQaTerminal() {
  const { reduced } = useMotion();
  const [ref, seen] = useSeenOnce<HTMLDivElement>('0px 0px -20% 0px');
  const [tab, setTab] = useState(0);
  const [auto, setAuto] = useState(true);
  const [chars, setChars] = useState(0);
  const [rows, setRows] = useState(0);
  const s = SCRIPTS[TABS[tab]];

  useEffect(() => {
    if (reduced) {
      setChars(s.cmd.length);
      setRows(s.out.length);
      return;
    }
    if (!seen) return;
    setChars(0);
    setRows(0);
    const timers: number[] = [];
    for (let i = 1; i <= s.cmd.length; i++) timers.push(window.setTimeout(() => setChars(i), i * 35));
    const outStart = s.cmd.length * 35 + 320;
    s.out.forEach((_, i) => timers.push(window.setTimeout(() => setRows(i + 1), outStart + (i + 1) * 170)));
    if (auto) timers.push(window.setTimeout(() => setTab((t) => (t + 1) % TABS.length), outStart + s.out.length * 170 + 2600));
    return () => timers.forEach(clearTimeout);
  }, [tab, seen, reduced, auto, s]);

  const color = (c?: string) => (c === 'green' ? 'text-green' : c === 'amber' ? 'text-amber' : c === 'accent' ? 'text-accent' : 'text-fg-2');
  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-line bg-[#07090a]">
      <div role="tablist" aria-label="Script" className="flex border-b border-line">
        {TABS.map((k, i) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === i}
            onClick={() => {
              setAuto(false);
              setTab(i);
            }}
            className={`mono px-4 py-2 text-xs ${tab === i ? 'bg-[#101a1d] text-accent' : 'text-[#869799]'}`}
          >
            {k}
          </button>
        ))}
        <span className="mono ml-auto self-center px-3 text-[10.5px] text-[#869799]">scripted · nothing runs</span>
      </div>
      <div className="mono min-h-[190px] p-4 text-[12.5px] leading-6" role="log" aria-live="off">
        <div className="text-[#eef5f4]">
          <span className="text-accent">$ </span>
          {s.cmd.slice(0, chars)}
          {chars < s.cmd.length && <span className="caret" />}
        </div>
        {s.out.slice(0, rows).map((o, i) => (
          <div key={i} className={color(o.c)}>
            {o.t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Heart disease: threshold explorer ----------------
   ILLUSTRATIVE ONLY: synthetic scores, not the model's outputs. Shows why lowering the threshold
   trades precision (false alarms) for recall (caught patients). Arrow keys move 5 points. */
export function HeartThreshold() {
  const [thr, setThr] = useState(50);
  const data = useMemo(() => {
    const r = mulberry32(303);
    const g = () => (r() + r() + r()) / 3;
    const sick = Array.from({ length: 28 }, () => Math.min(0.99, 0.25 + g() * 0.85));
    const healthy = Array.from({ length: 33 }, () => Math.max(0.01, g() * 0.85 - 0.1));
    return { sick, healthy };
  }, []);
  const th = thr / 100;
  const tp = data.sick.filter((s) => s >= th).length;
  const fp = data.healthy.filter((s) => s >= th).length;
  const recall = tp / data.sick.length;
  const precision = tp + fp ? tp / (tp + fp) : 1;
  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5 };
    if (e.key in map) {
      e.preventDefault();
      setThr((v) => Math.min(100, Math.max(0, v + map[e.key])));
    } else if (e.key === 'Home') setThr(0);
    else if (e.key === 'End') setThr(100);
  };
  return (
    <div className="rounded-xl border border-line bg-[#07090a] p-4">
      <p className="mono mb-3 text-[11px] uppercase tracking-wider text-amber">Illustrative synthetic data · not the model&apos;s real scores</p>
      <svg viewBox="0 0 400 120" className="w-full" aria-hidden="true">
        <line x1="0" y1="60" x2="400" y2="60" stroke="rgb(255 255 255 / .1)" />
        {data.healthy.map((s, i) => (
          <circle key={`h${i}`} cx={s * 400} cy={30 + ((i * 37) % 24)} r="4.5" fill={s >= th ? '#f59e0b' : '#5b6b6e'} />
        ))}
        {data.sick.map((s, i) => (
          <circle key={`s${i}`} cx={s * 400} cy={78 + ((i * 29) % 24)} r="4.5" fill={s >= th ? '#22c55e' : '#ef4444'} />
        ))}
        <line x1={th * 400} y1="8" x2={th * 400} y2="112" stroke="#5eead4" strokeWidth="2" />
        <text x="4" y="14" fontSize="9" fill="#869799" fontFamily="monospace">HEALTHY</text>
        <text x="4" y="118" fontSize="9" fill="#869799" fontFamily="monospace">SICK</text>
      </svg>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Decision threshold"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={thr}
        aria-valuetext={`Threshold ${th.toFixed(2)}, recall ${recall.toFixed(2)}, precision ${precision.toFixed(2)}`}
        onKeyDown={onKey}
        onPointerDown={(e) => {
          const el = e.currentTarget;
          el.setPointerCapture(e.pointerId);
          const set = (x: number) => {
            const r = el.getBoundingClientRect();
            setThr(Math.round(Math.min(1, Math.max(0, (x - r.left) / r.width)) * 100));
          };
          set(e.clientX);
          const mv = (ev: PointerEvent) => set(ev.clientX);
          const up = () => {
            el.removeEventListener('pointermove', mv);
            el.removeEventListener('pointerup', up);
          };
          el.addEventListener('pointermove', mv);
          el.addEventListener('pointerup', up);
        }}
        className="relative mt-2 h-8 cursor-ew-resize touch-pan-y rounded-full"
      >
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[rgb(255_255_255/.1)]" />
        <div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#5eead4] bg-[#07090a]" style={{ left: `${thr}%` }} />
      </div>
      <dl className="mono mt-3 grid grid-cols-3 gap-2 text-[12px]">
        <div className="rounded-lg border border-line p-2">
          <dt className="text-[#869799]">threshold</dt>
          <dd className="text-[#eef5f4]">{th.toFixed(2)}</dd>
        </div>
        <div className="rounded-lg border border-line p-2">
          <dt className="text-[#869799]">recall</dt>
          <dd className={recall >= 0.9 ? 'text-green' : 'text-amber'}>
            {tp}/28 · {recall.toFixed(2)}
          </dd>
        </div>
        <div className="rounded-lg border border-line p-2">
          <dt className="text-[#869799]">precision</dt>
          <dd className="text-[#eef5f4]">
            {precision.toFixed(2)} · {fp} alarms
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[12.5px] text-[#869799]">The real project picked its threshold out of fold on training data only, keeping recall at or above 0.90.</p>
    </div>
  );
}
