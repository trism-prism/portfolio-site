'use client';

import { useId, useMemo } from 'react';
import { C, Box, Label, Lines, Packet, Check, type SceneProps } from '../Stage';
import { along, clamp, easeCine, easeOut, lerp, loop, mulberry32, seg, type P } from '@/lib/kit';
import { boxWalls, buildGrid, gridCast, polyPath, visibility, type Seg } from '@/lib/visibility';

/* ---------------- 2D Visibility & Lighting Engine ----------------
   A light wanders among walls; its visibility polygon is computed live every frame. One ray walks the
   grid (cells it visits light up), and the counters compare wall tests for brute force vs the grid. */
const W = 320, H = 200;
const s = (ax: number, ay: number, bx: number, by: number): Seg => ({ a: { x: ax, y: ay }, b: { x: bx, y: by } });
const VIS_WALLS: Seg[] = [
  ...boxWalls(W, H),
  s(60, 40, 110, 40), s(110, 40, 110, 70),
  s(200, 30, 200, 80), s(230, 55, 280, 55),
  s(50, 130, 95, 160), s(140, 120, 190, 120), s(190, 120, 190, 150),
  s(240, 110, 270, 160), s(120, 165, 160, 185),
];
const VIS_GRID = buildGrid(VIS_WALLS, W, H, 40);

export function VisibilityCover({ t }: SceneProps) {
  const id = useId().replace(/:/g, '');
  const light = { x: 160 + 95 * Math.sin(t * 0.45), y: 98 + 42 * Math.sin(t * 0.73 + 1) };
  const vis = visibility(light, VIS_WALLS, VIS_GRID);
  const ang = t * 0.5;
  const d = { x: Math.cos(ang), y: Math.sin(ang) };
  const visited: [number, number][] = [];
  const hit = gridCast(light, d, VIS_WALLS, VIS_GRID, (cx, cy) => visited.push([cx, cy]));
  const end = { x: light.x + d.x * hit.t, y: light.y + d.y * hit.t };
  return (
    <g>
      <defs>
        <radialGradient id={`lg-${id}`} cx={light.x} cy={light.y} r="190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" stopOpacity=".55" />
          <stop offset=".45" stopColor="#f59e0b" stopOpacity=".2" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* grid */}
      <g stroke={C.faint} strokeWidth=".6">
        {Array.from({ length: VIS_GRID.cols - 1 }, (_, i) => (
          <line key={`v${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2={H} />
        ))}
        {Array.from({ length: VIS_GRID.rows - 1 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={(i + 1) * 40} x2={W} y2={(i + 1) * 40} />
        ))}
      </g>
      {visited.map(([cx, cy], i) => (
        <rect key={i} x={cx * 40 + 1} y={cy * 40 + 1} width="38" height="38" fill={C.accent} opacity={0.1 + 0.04 * (visited.length - i)} />
      ))}
      <path d={polyPath(vis.polygon)} fill={`url(#lg-${id})`} />
      <path d={polyPath(vis.polygon)} fill="none" stroke="#fbbf24" strokeOpacity=".35" strokeWidth=".7" />
      <g stroke="#fb923c" strokeWidth="2.2" strokeLinecap="round">
        {VIS_WALLS.slice(4).map((w, i) => (
          <line key={i} x1={w.a.x} y1={w.a.y} x2={w.b.x} y2={w.b.y} />
        ))}
      </g>
      <line x1={light.x} y1={light.y} x2={end.x} y2={end.y} stroke={C.accent} strokeWidth="1" strokeDasharray="3 2" />
      <circle cx={end.x} cy={end.y} r="2.5" fill={C.accent} />
      <circle cx={light.x} cy={light.y} r="9" fill="#fde68a" opacity=".25" />
      <circle cx={light.x} cy={light.y} r="4" fill="#fde68a" />
      <rect x="6" y="6" width="132" height="30" rx="5" fill={C.ink} opacity=".82" stroke={C.line} />
      <Label x={12} y={18} anchor="start">BRUTE {vis.bruteTests}</Label>
      <Label x={12} y={30} anchor="start" fill={C.accent}>GRID  {vis.gridTests}</Label>
      <Label x={134} y={30} anchor="end" fill={C.soft}>{(vis.bruteTests / Math.max(1, vis.gridTests)).toFixed(1)}x</Label>
      <Label x={W - 8} y={H - 8} anchor="end">RAYS {vis.rays}</Label>
    </g>
  );
}

/* ---------------- Docs Q&A Copilot ----------------
   Pages are chunked into a vector field; a question lands, pulls its nearest chunks, and an answer
   streams with page citations. Then an unanswerable question gets an explicit "not found". */
export function DocsQaCover({ t: raw }: SceneProps) {
  const t = loop(raw, 9);
  const dots = useMemo(() => {
    const r = mulberry32(7);
    return Array.from({ length: 26 }, () => [118 + r() * 76, 52 + r() * 96] as P);
  }, []);
  const unanswerable = t > 6;
  const q: P = unanswerable ? [178, 132] : [150, 92];
  const near = useMemo(
    () => [...dots].map((d, i) => [Math.hypot(d[0] - q[0], d[1] - q[1]), i] as const).sort((a, b) => a[0] - b[0]).slice(0, 3).map(([, i]) => i),
    [dots, q[0], q[1]], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const ingest = seg(t, 0, 1.6);
  const ask = seg(t, 1.7, 2.4);
  const retrieve = seg(t, 2.4, 3.2);
  const answer = seg(t, 3.2, 5.6);
  const q2 = seg(t, 6, 6.6);
  const nf = seg(t, 6.8, 7.3);
  return (
    <g>
      {/* PDFs */}
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${18 + k * 10} ${56 + k * 14})`}>
          <Box x={0} y={0} w={44} h={58} r={3} fill={C.ink} />
          <path d="M32 0 L44 12 L32 12 Z" fill={C.line} />
          <Lines x={6} y={20} widths={[28, 32, 22, 30, 26]} gap={7} sw={1.6} />
        </g>
      ))}
      <Label x={46} y={150}>296 PAGES</Label>
      {/* chunks flying into the field */}
      {dots.map((d, i) => {
        const p = clamp(ingest * 1.6 - (i / dots.length) * 0.6);
        const from: P = [50, 90];
        const x = lerp(from[0], d[0], easeOut(p));
        const y = lerp(from[1], d[1], easeOut(p));
        const lit = near.includes(i) && retrieve > 0 && t < (unanswerable ? 9 : 6);
        if (p <= 0) return null;
        return <circle key={i} cx={x} cy={y} r={lit ? 3 : 2} fill={lit && !unanswerable ? C.accent : lit ? C.amber : C.line} />;
      })}
      <Label x={156} y={162}>PGVECTOR</Label>
      {/* query */}
      {(ask > 0 || unanswerable) && (
        <g opacity={unanswerable ? q2 : ask}>
          <circle cx={q[0]} cy={q[1]} r="4" fill="none" stroke={unanswerable ? C.amber : C.soft} strokeWidth="1.4" />
          {near.map((i) => (
            <line key={i} x1={q[0]} y1={q[1]} x2={dots[i][0]} y2={dots[i][1]} stroke={unanswerable ? C.amber : C.accent} strokeWidth=".8" strokeDasharray="2 2" opacity={unanswerable ? q2 : retrieve} />
          ))}
          <Box x={unanswerable ? 120 : 112} y={22} w={84} h={18} r={9} fill={C.ink} stroke={unanswerable ? C.amber : C.soft} />
          <Label x={unanswerable ? 162 : 154} y={34} fill={unanswerable ? C.amber : C.soft}>{unanswerable ? 'Q: OFF-TOPIC?' : 'Q: COVERAGE?'}</Label>
        </g>
      )}
      {/* answer card */}
      <Box x={214} y={44} w={92} h={112} r={6} fill={C.ink} />
      <Label x={222} y={58} anchor="start">ANSWER</Label>
      {!unanswerable ? (
        <g>
          <Lines x={222} y={70} widths={[70 * clamp(answer * 3), 62 * clamp(answer * 3 - 1), 66 * clamp(answer * 3 - 2)]} gap={9} color={C.fg} sw={1.6} />
          {[0, 1].map((k) => {
            const o = seg(answer, 0.45 + k * 0.25, 0.6 + k * 0.25);
            return (
              <g key={k} opacity={o} transform={`translate(${222 + k * 38} 104)`}>
                <rect width="32" height="13" rx="6.5" fill={C.accent} opacity=".16" stroke={C.accent} />
                <Label x={16} y={9.5} fill={C.accent}>{k ? 'P.12' : 'P.30'}</Label>
              </g>
            );
          })}
          <g opacity={seg(answer, 0.9, 1)}>
            <Check x={228} y={134} />
            <Label x={238} y={137} anchor="start" fill={C.green}>CITED</Label>
          </g>
        </g>
      ) : (
        <g opacity={nf}>
          <rect x="222" y="80" width="76" height="18" rx="9" fill={C.amber} opacity=".14" stroke={C.amber} />
          <Label x={260} y={92} fill={C.amber}>NOT FOUND</Label>
          <Label x={260} y={118}>0 CITATIONS</Label>
        </g>
      )}
      <Label x={W - 14} y={H - 10} anchor="end" fill={C.soft}>{t > 6 ? '8/8 ABSTAINED' : '46/50 CORRECT'}</Label>
    </g>
  );
}

/* ---------------- Kiln ----------------
   A syllabus becomes tasks that fill each weekday's time budget; the one that does not fit is deferred
   by a binary search. Then the plan is encrypted and synced as ciphertext, and a pairing code appears. */
const DAYS = ['M', 'T', 'W', 'T', 'F'];
const BUDGET = [3, 2, 3, 2, 1]; // blocks per weekday
const TASKS = [0, 1, 2, 0, 2, 3, 1, 0, 4, 2, 3]; // target day per task, in order
export function KilnCover({ t: raw }: SceneProps) {
  const t = loop(raw, 10);
  const fill = [0, 0, 0, 0, 0];
  const placed = TASKS.map((day, i) => {
    const start = 0.6 + i * 0.32;
    const p = seg(t, start, start + 0.5);
    const slot = fill[day] < BUDGET[day] ? fill[day]++ : -1;
    return { day, i, p, slot };
  });
  const lockP = seg(t, 5.2, 5.8);
  const sync = seg(t, 5.9, 7.6);
  const code = seg(t, 7.6, 8.2);
  const colX = (d: number) => 96 + d * 26;
  const blockY = (slot: number) => 140 - (slot + 1) * 22;
  return (
    <g>
      <Box x={14} y={42} w={50} h={74} r={4} fill={C.ink} />
      <Lines x={21} y={58} widths={[34, 28, 36, 22, 30, 26]} gap={9} sw={1.6} />
      <Label x={39} y={130}>SYLLABUS</Label>
      {DAYS.map((d, i) => (
        <g key={i}>
          <rect x={colX(i)} y={140 - BUDGET[i] * 22 - 2} width="22" height={BUDGET[i] * 22 + 2} rx="3" fill="none" stroke={C.line} strokeDasharray="2 2" />
          <Label x={colX(i) + 11} y={154}>{d}</Label>
        </g>
      ))}
      {placed.map(({ day, i, p, slot }) => {
        if (p <= 0) return null;
        const from: P = [64, 70];
        const target: P = slot >= 0 ? [colX(day) + 1, blockY(slot) + 2] : [colX(day) + 1, 40];
        const x = lerp(from[0], target[0], easeCine(p));
        const y = lerp(from[1], target[1], easeCine(p)) - Math.sin(p * Math.PI) * 18;
        const deferred = slot < 0;
        const color = deferred ? C.amber : [C.accent, C.violet, C.sky, C.green][i % 4];
        return <rect key={i} x={x} y={y} width="20" height="18" rx="3" fill={color} opacity={deferred ? 0.85 : 0.8 * (1 - lockP * 0.5)} />;
      })}
      {/* binary search bracket for the deferred task */}
      {t > 4.2 && t < 9.6 && (
        <g opacity={seg(t, 4.2, 4.6)}>
          <path d="M96 168 v4 h126 v-4" stroke={C.amber} fill="none" />
          {[0, 1, 2].map((k) => (
            <line key={k} x1={96 + [63, 31, 47][k] * 2} y1={176} x2={96 + [63, 31, 47][k] * 2} y2={182} stroke={C.amber} opacity={seg(t, 4.4 + k * 0.25, 4.6 + k * 0.25)} />
          ))}
          <Label x={159} y={192} fill={C.amber}>DEFER · BINARY SEARCH</Label>
        </g>
      )}
      {/* lock + sync */}
      <g opacity={lockP} transform="translate(236 70)">
        <rect x="0" y="10" width="20" height="16" rx="3" fill={C.ink} stroke={C.soft} />
        <path d={`M4 10 v-4 a6 6 0 0 1 12 0 v${lerp(-2, 4, lockP)}`} stroke={C.soft} fill="none" strokeWidth="1.6" />
        <Label x={10} y={40} fill={C.soft}>AES-GCM</Label>
      </g>
      <g transform="translate(270 30)">
        <path d="M6 22 a10 10 0 0 1 4 -18 a12 12 0 0 1 22 4 a8 8 0 0 1 2 14 Z" fill={C.ink} stroke={C.line} />
        <Label x={20} y={36}>WORKER</Label>
      </g>
      {sync > 0 &&
        [0, 1, 2].map((k) => {
          const p = clamp(sync * 1.5 - k * 0.25);
          const [x, y] = along([[246, 80], [262, 70], [286, 52]], p);
          return (
            <text key={k} x={x} y={y} fontSize="6" fontFamily="var(--font-jetbrains)" fill={C.soft} opacity={p > 0 && p < 1 ? 1 : 0}>
              {['9f3a', 'c1e7', '04bd'][k]}
            </text>
          );
        })}
      <g opacity={code} transform="translate(250 112)">
        {['4', '8', '1', '2', '0', '7'].map((c, k) => (
          <g key={k} transform={`translate(${k * 10 - 4} 0)`}>
            <rect width="9" height="13" rx="2" fill={C.ink} stroke={C.violet} />
            <Label x={4.5} y={9.5} fill={C.violet}>{c}</Label>
          </g>
        ))}
        <Label x={26} y={26} fill={C.violet}>CPACE PAIR</Label>
      </g>
    </g>
  );
}

/* ---------------- GengaRate ----------------
   AniList GraphQL import with a 429 + Retry-After pause, title cards landing with ratings, and two tabs
   taking turns on a Web Lock to refresh the session token. */
export function GengaRateCover({ t: raw }: SceneProps) {
  const t = loop(raw, 9);
  const waiting = t > 1.6 && t < 2.8;
  const flow = (k: number) => {
    const start = k * 0.55 + (k >= 3 ? 1.2 : 0);
    return seg(t, start, start + 0.6);
  };
  const lockOwner = t < 5.5 ? 0 : t < 7.2 ? 1 : 0;
  const lockMove = t > 5.3 && t < 5.7 ? seg(t, 5.3, 5.7) : t > 7.0 && t < 7.4 ? 1 - seg(t, 7.0, 7.4) : lockOwner;
  return (
    <g>
      <Box x={12} y={24} w={58} h={24} r={12} fill={C.ink} stroke={C.violet} />
      <Label x={41} y={39} fill={C.violet}>ANILIST</Label>
      <Box x={12} y={84} w={58} h={24} r={6} fill={C.ink} />
      <Label x={41} y={99}>API</Label>
      <line x1="41" y1="48" x2="41" y2="84" stroke={C.line} strokeDasharray="2 3" />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const p = flow(k);
        if (p <= 0 || p >= 1) return null;
        return <Packet key={k} x={41} y={lerp(52, 82, p)} color={C.violet} r={2.4} />;
      })}
      {waiting && (
        <g>
          <rect x="74" y="52" width="66" height="16" rx="8" fill={C.amber} opacity=".14" stroke={C.amber} />
          <Label x={107} y={63} fill={C.amber}>429 · WAIT 1s</Label>
        </g>
      )}
      <line x1="70" y1="96" x2="96" y2="96" stroke={C.line} />
      {/* poster grid */}
      {Array.from({ length: 8 }, (_, k) => {
        const appear = seg(t, 0.6 + k * 0.42 + (k >= 3 ? 1.2 : 0), 1 + k * 0.42 + (k >= 3 ? 1.2 : 0));
        const x = 102 + (k % 4) * 52;
        const y = 22 + Math.floor(k / 4) * 74;
        const stars = Math.round(clamp((t - 1.2 - k * 0.42 - (k >= 3 ? 1.2 : 0)) * 4) * (3 + ((k * 7) % 3)));
        return (
          <g key={k} opacity={appear} transform={`translate(${x} ${y + (1 - appear) * 8})`}>
            <rect width="44" height="50" rx="4" fill={[C.violet, C.accent, C.coral, C.sky][k % 4]} opacity=".22" stroke={C.line} />
            <path d={`M6 40 L18 24 L26 32 L32 26 L40 40 Z`} fill={[C.violet, C.accent, C.coral, C.sky][k % 4]} opacity=".5" />
            {[0, 1, 2, 3, 4].map((st) => (
              <circle key={st} cx={4 + st * 9} cy={58} r="2.6" fill={st < stars ? C.amber : C.faint} />
            ))}
          </g>
        );
      })}
      {/* tabs + web lock */}
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${12 + k * 34} 136)`}>
          <rect width="30" height="40" rx="3" fill={C.ink} stroke={lockOwner === k ? C.accent : C.line} />
          <rect width="30" height="7" rx="2" fill={C.faint} />
          <Label x={15} y={34}>{`T${k + 1}`}</Label>
        </g>
      ))}
      <g transform={`translate(${lerp(19, 53, lockMove)} 150)`}>
        <rect x="0" y="4" width="16" height="12" rx="2" fill={C.accent} opacity=".25" stroke={C.accent} />
        <path d="M3 4 v-3 a5 5 0 0 1 10 0 v3" stroke={C.accent} fill="none" strokeWidth="1.4" />
      </g>
      <Label x={12} y={192} anchor="start">WEB LOCK · REFRESH</Label>
    </g>
  );
}

