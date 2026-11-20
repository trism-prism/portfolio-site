'use client';

import { useId, useMemo } from 'react';
import { C, Box, Label, Lines, Packet, Check, Cross, type SceneProps } from '../Stage';
import { along, easeCine, easeOut, lerp, loop, mulberry32, pulse, seg, type P } from '@/lib/kit';

/* ---------------- College football upsets ----------------
   Brier scores grow (lower is better), then an integrity audit sweeps the game table, flags the
   leaked FBS-vs-FCS rows, and the inflated 32% skill score corrects to 27%. */
export function CfbCover({ t: raw }: SceneProps) {
  const t = loop(raw, 9);
  const grow = easeOut(seg(t, 0.2, 1.8));
  const scan = seg(t, 2.4, 4.6);
  const fix = seg(t, 5, 5.8);
  const rows = 10;
  const leaked = [3, 8];
  const naiveH = 0.244 * 380 * grow;
  const spreadH = 0.177 * 380 * grow;
  return (
    <g>
      <line x1="24" y1="160" x2="132" y2="160" stroke={C.line} />
      <rect x="38" y={160 - naiveH} width="30" height={naiveH} rx="3" fill={C.line} />
      <rect x="86" y={160 - spreadH} width="30" height={spreadH} rx="3" fill={C.accent} opacity=".8" />
      <Label x={53} y={174}>NAIVE</Label>
      <Label x={101} y={174} fill={C.accent}>SPREAD</Label>
      <Label x={53} y={160 - naiveH - 6}>{(0.244 * grow).toFixed(3)}</Label>
      <Label x={101} y={160 - spreadH - 6} fill={C.accent}>{(0.177 * grow).toFixed(3)}</Label>
      <Label x={78} y={24}>BRIER · LOWER IS BETTER</Label>
      {/* game table */}
      <Box x={150} y={18} w={156} h={142} r={6} fill={C.ink} />
      {Array.from({ length: rows }, (_, i) => {
        const y = 30 + i * 12.6;
        const flagged = leaked.includes(i) && scan * rows > i + 0.5;
        const removed = flagged && fix > 0;
        return (
          <g key={i} opacity={removed ? 1 - fix * 0.7 : 1}>
            {flagged && <rect x="154" y={y - 6} width="148" height="11" rx="2" fill={C.red} opacity=".16" />}
            <Lines x={160} y={y} widths={[34]} color={flagged ? C.red : C.line} sw={1.6} />
            <Lines x={204} y={y} widths={[22]} color={flagged ? C.red : C.line} sw={1.6} />
            <circle cx={240} cy={y} r="2" fill={flagged ? C.red : i % 3 ? C.line : C.accent} />
            <Lines x={252} y={y} widths={[40]} color={C.faint} sw={1.6} />
            {flagged && <Label x={298} y={y + 3} anchor="end" fill={C.red} size={6.5}>FCS</Label>}
          </g>
        );
      })}
      {scan > 0 && scan < 1 && <line x1="152" y1={24 + scan * 132} x2="304" y2={24 + scan * 132} stroke={C.amber} strokeWidth="1.4" />}
      <g transform="translate(150 168)">
        <Label x={0} y={12} anchor="start">SKILL</Label>
        <g opacity={1 - fix}>
          <Label x={42} y={12} anchor="start" fill={C.red}>32%</Label>
        </g>
        {fix > 0 && <line x1="40" y1="9" x2={40 + 22 * fix} y2="9" stroke={C.red} strokeWidth="1.4" />}
        <g opacity={fix}>
          <Label x={72} y={12} anchor="start" fill={C.green}>27% HONEST</Label>
        </g>
        <Label x={156} y={12} anchor="end" fill={C.amber} >{scan > 0.1 ? 'LEAK 13.1%' : ''}</Label>
      </g>
    </g>
  );
}

/* ---------------- Internship Scout Agent ----------------
   Postings arrive; the agent fetches a full posting by database ID through a guarded tool, scores it
   0-100 on a gauge, and the top matches fold into an emailed digest. */
const SCORES = [87, 42, 74, 63];
export function ScoutCover({ t: raw }: SceneProps) {
  const t = loop(raw, 9);
  const k = Math.min(3, Math.floor(seg(t, 0.8, 6.0) * 4));
  const local = (seg(t, 0.8, 6.0) * 4) % 1;
  const call = seg(local, 0.1, 0.45);
  const ret = seg(local, 0.45, 0.7);
  const score = SCORES[k] * easeOut(seg(local, 0.6, 0.95));
  const env = seg(t, 6.4, 8.4);
  const ang = Math.PI + (score / 100) * Math.PI;
  return (
    <g>
      {SCORES.map((sc, i) => {
        const appear = seg(t, i * 0.18, i * 0.18 + 0.4);
        const active = i === k && t < 6.2;
        return (
          <g key={i} opacity={appear} transform={`translate(${14 - (1 - appear) * 10} ${24 + i * 38})`}>
            <rect width="64" height="30" rx="4" fill={C.ink} stroke={active ? C.accent : C.line} />
            <Lines x={7} y={10} widths={[40, 30]} gap={8} sw={1.6} />
            <Label x={58} y={25} anchor="end" fill={i < k || (i === k && local > 0.95) ? (sc > 70 ? C.green : C.label) : C.label} size={7}>
              {i < k || (i === k && local > 0.95) || t > 6.2 ? String(sc) : `#${101 + i}`}
            </Label>
          </g>
        );
      })}
      {/* agent */}
      <circle cx="132" cy="92" r="20" fill={C.ink} stroke={C.violet} />
      <Label x={132} y={95} fill={C.violet}>AGENT</Label>
      <line x1="80" y1={39 + k * 38} x2="112" y2="92" stroke={C.line} strokeDasharray="2 2" />
      {/* tool call */}
      <Box x={168} y={22} w={88} h={20} r={4} fill={C.ink} stroke={call > 0 && t < 6.2 ? C.accent : C.line} />
      <Label x={212} y={35} fill={C.accent} size={7}>fetch_posting(id)</Label>
      <path d="M146 78 Q160 50 176 42" stroke={C.line} fill="none" />
      {t < 6.2 && call > 0 && call < 1 && <Packet x={lerp(148, 176, call)} y={lerp(76, 42, call)} r={2.4} />}
      {t < 6.2 && ret > 0 && ret < 1 && <Packet x={lerp(176, 148, ret)} y={lerp(42, 76, ret)} r={2.4} color={C.soft} />}
      <Label x={212} y={54}>HTTPS · SIZE · TIME CAPS</Label>
      {/* gauge */}
      <g transform="translate(212 118)">
        <path d="M-34 0 A34 34 0 0 1 34 0" stroke={C.faint} strokeWidth="7" fill="none" />
        <path d={`M-34 0 A34 34 0 0 1 ${34 * Math.cos(ang)} ${34 * Math.sin(ang)}`} stroke={score > 70 ? C.green : C.amber} strokeWidth="7" fill="none" opacity={t < 6.2 ? 1 : 0.3} />
        <Label x={0} y={-6} fill={C.fg} size={12}>{t < 6.2 ? Math.round(score) : '—'}</Label>
        <Label x={0} y={12}>SCORE 0-100</Label>
      </g>
      {/* digest */}
      <g transform={`translate(${lerp(262, 330, easeCine(seg(env, 0.7, 1)))} ${lerp(150, 120, easeCine(seg(env, 0.7, 1)))})`} opacity={env > 0 ? 1 : 0.5}>
        <rect x="-20" y="-14" width="40" height="28" rx="3" fill={C.ink} stroke={C.soft} />
        <path d="M-20 -14 L0 2 L20 -14" stroke={C.soft} fill="none" />
      </g>
      <Label x={262} y={186}>WEEKLY DIGEST</Label>
    </g>
  );
}

/* ---------------- Heart disease ----------------
   A threshold slides down the precision-recall curve to the recall ≥ 0.90 line, three models compete on
   precision at that recall, the simpler one ships, and 27 of 28 sick test patients light up. */
export function HeartCover({ t: raw }: SceneProps) {
  const t = loop(raw, 9);
  const curve = (x: number) => 0.95 - 0.55 * Math.pow(x, 3.2); // precision as a function of recall
  const thrP = easeOut(seg(t, 0.3, 2.2));
  const rx = lerp(0.3, 0.9, thrP);
  const toXY = (r: number, p: number): P => [24 + r * 120, 150 - p * 120];
  const path = Array.from({ length: 30 }, (_, i) => toXY(i / 29, curve(i / 29)));
  const bars = [
    { n: 'LR', v: 0.705, c: C.accent },
    { n: 'RF', v: 0.653, c: C.line },
    { n: 'XGB', v: 0.655, c: C.line },
  ];
  const grow = easeOut(seg(t, 2.4, 3.6));
  const ships = seg(t, 3.8, 4.2);
  const dots = seg(t, 4.6, 6.4);
  const pt = toXY(rx, curve(rx));
  return (
    <g>
      <line x1="24" y1="150" x2="150" y2="150" stroke={C.line} />
      <line x1="24" y1="26" x2="24" y2="150" stroke={C.line} />
      <path d={'M' + path.map((p) => p.join(',')).join('L')} stroke={C.soft} fill="none" strokeWidth="1.6" />
      <line x1={toXY(0.9, 0)[0]} y1="26" x2={toXY(0.9, 0)[0]} y2="150" stroke={C.amber} strokeDasharray="3 3" />
      <Label x={toXY(0.9, 0)[0]} y={20} fill={C.amber}>RECALL ≥ .90</Label>
      <circle cx={pt[0]} cy={pt[1]} r="4.5" fill={C.accent} />
      <Label x={86} y={164}>RECALL →</Label>
      {bars.map((b, i) => {
        const h = (b.v - 0.55) * 500 * grow;
        return (
          <g key={b.n}>
            <rect x={178 + i * 34} y={112 - h} width="24" height={h} rx="3" fill={b.c} opacity={i === 0 ? 0.85 : 1} />
            <Label x={190 + i * 34} y={124} fill={i === 0 ? C.accent : C.label}>{b.n}</Label>
            <Label x={190 + i * 34} y={108 - h} size={7}>{grow > 0.95 ? b.v.toFixed(3) : ''}</Label>
          </g>
        );
      })}
      <g opacity={ships}>
        <rect x="170" y="20" width="56" height="16" rx="8" fill={C.green} opacity=".15" stroke={C.green} />
        <Label x={198} y={31} fill={C.green}>SHIPS</Label>
      </g>
      <Label x={290} y={31} anchor="end">PREC @ RECALL</Label>
      {/* 28 sick test patients */}
      <g transform="translate(172 138)">
        {Array.from({ length: 28 }, (_, i) => {
          const on = dots * 28 > i;
          const missed = i === 19;
          return <circle key={i} cx={(i % 14) * 9} cy={Math.floor(i / 14) * 10} r="3" fill={!on ? C.faint : missed ? C.red : C.green} />;
        })}
        <Label x={0} y={36} anchor="start" fill={dots > 0.98 ? C.fg : C.label}>{dots > 0.98 ? '27 / 28 CAUGHT · 61 TEST' : 'TEST SET'}</Label>
      </g>
    </g>
  );
}

/* ---------------- Tripwire ----------------
   GDELT batches land every 15 minutes; one country's daily count breaks above its 28-day
   median + MAD band, and the map pings an alert. */
export function TripwireCover({ t: raw }: SceneProps) {
  const t = loop(raw, 9);
  const map = useMemo(() => {
    const r = mulberry32(42);
    const blobs = [
      [62, 64, 34, 22], [84, 112, 16, 22], [158, 62, 26, 18], [166, 104, 20, 26], [214, 70, 42, 26], [252, 124, 16, 10],
    ];
    const pts: P[] = [];
    for (const [cx, cy, rx, ry] of blobs) {
      for (let i = 0; i < 46; i++) {
        const a = r() * Math.PI * 2, d = Math.sqrt(r());
        pts.push([Math.round((cx + Math.cos(a) * rx * d) / 5) * 5, Math.round((cy + Math.sin(a) * ry * d) / 5) * 5]);
      }
    }
    return [...new Map(pts.map((p) => [p.join(','), p])).values()];
  }, []);
  const spike = seg(t, 3.6, 4.4);
  const alert = t > 4.4 && t < 8.6;
  const bars = [9, 11, 8, 10, 12, 9, 10, 11, 9, 8, 10, 11, 9];
  const target: P = [225, 75];
  const tick = Math.floor(t / 1.5);
  return (
    <g>
      {map.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="1.4" fill={C.line} />
      ))}
      {[0, 1, 2, 3, 4].map((k) => {
        const r = mulberry32(tick * 13 + k);
        const p = map[Math.floor(r() * map.length)];
        return <circle key={k} cx={p[0]} cy={p[1]} r="2" fill={C.soft} opacity={1 - ((t % 1.5) / 1.5)} />;
      })}
      {alert && (
        <g>
          <circle cx={target[0]} cy={target[1]} r={4 + ((t * 14) % 18)} fill="none" stroke={C.red} opacity={1 - ((t * 14) % 18) / 18} />
          <circle cx={target[0]} cy={target[1]} r="3.5" fill={C.red} />
          <rect x={target[0] + 8} y={target[1] - 22} width="50" height="15" rx="7.5" fill={C.red} opacity=".15" stroke={C.red} />
          <Label x={target[0] + 33} y={target[1] - 12} fill={C.red}>ALERT</Label>
        </g>
      )}
      {/* 15-minute clock */}
      <g transform="translate(26 28)">
        <circle r="10" fill={C.ink} stroke={C.line} />
        <line x1="0" y1="0" x2={7 * Math.sin((t / 1.5) * Math.PI * 0.5)} y2={-7 * Math.cos((t / 1.5) * Math.PI * 0.5)} stroke={C.accent} strokeWidth="1.4" />
        <Label x={16} y={3} anchor="start">15 MIN</Label>
      </g>
      {/* baseline chart */}
      <g transform="translate(150 140)">
        <rect x="-4" y="-4" width="162" height="52" rx="5" fill={C.ink} stroke={C.line} />
        <rect x="0" y="16" width="154" height="12" fill={C.accent} opacity=".1" />
        <line x1="0" y1="22" x2="154" y2="22" stroke={C.accent} strokeDasharray="2 2" opacity=".7" />
        {bars.map((b, i) => (
          <rect key={i} x={i * 11} y={40 - b * 2} width="7" height={b * 2} fill={C.line} />
        ))}
        <rect x={13 * 11} y={40 - lerp(10, 20, easeOut(spike)) * 2} width="7" height={lerp(10, 20, easeOut(spike)) * 2} fill={spike > 0.5 ? C.red : C.line} />
        <Label x={0} y={-8} anchor="start">MEDIAN + MAD · 28 DAYS</Label>
      </g>
      <Label x={60} y={186}>GDELT → POSTGRES</Label>
    </g>
  );
}

/* ---------------- minivmm ----------------
   The KVM_RUN loop: guest code runs until it exits on port I/O, MMIO or HLT; the VMM handles the exit
   and resumes. Port writes to the serial port print characters in the console. */
const EXITS = ['IO', 'IO', 'MMIO', 'IO', 'IO', 'IO', 'HLT'];
export function MinivmmCover({ t: raw }: SceneProps) {
  const t = loop(raw, 8);
  const step = Math.min(EXITS.length - 1, Math.floor(t / 0.95));
  const local = (t / 0.95) % 1;
  const halted = t >= 0.95 * (EXITS.length - 1) + 0.6;
  const printed = 'Hello'.slice(0, EXITS.slice(0, step + (local > 0.6 ? 1 : 0)).filter((e) => e === 'IO').length);
  const kind = EXITS[step];
  const color = kind === 'IO' ? C.accent : kind === 'MMIO' ? C.violet : C.amber;
  const loopPts: P[] = [[96, 70], [160, 52], [224, 70]];
  const backPts: P[] = [[224, 110], [160, 128], [96, 110]];
  return (
    <g>
      <Box x={12} y={46} w={84} h={88} r={6} fill={C.ink} />
      <Label x={20} y={60} anchor="start">GUEST · 16-BIT</Label>
      {['mov dx, 0x3f8', 'mov al, [si]', 'out dx, al', 'mov [0xb800],ax', 'hlt'].map((l, i) => (
        <text key={i} x="20" y={76 + i * 12} fontSize="7" fontFamily="var(--font-jetbrains)" fill={i === (kind === 'HLT' ? 4 : kind === 'MMIO' ? 3 : 2) ? color : C.label}>
          {l}
        </text>
      ))}
      <Box x={224} y={58} w={84} h={64} r={6} fill={C.ink} stroke={local > 0.45 && local < 0.75 && !halted ? color : C.line} />
      <Label x={266} y={74}>VMM</Label>
      <Label x={266} y={90} fill={color}>{`EXIT_${kind}`}</Label>
      <Label x={266} y={112} size={7}>≈5.3 µs / EXIT</Label>
      <path d={`M${loopPts.map((p) => p.join(',')).join(' L')}`} stroke={C.line} fill="none" strokeDasharray="3 3" />
      <path d={`M${backPts.map((p) => p.join(',')).join(' L')}`} stroke={C.line} fill="none" strokeDasharray="3 3" />
      <Label x={160} y={46}>KVM_RUN</Label>
      <Label x={160} y={142}>RESUME</Label>
      {!halted && local < 0.5 && (() => {
        const [x, y] = along(loopPts, local / 0.5);
        return <Packet x={x} y={y} color={color} />;
      })()}
      {!halted && local >= 0.7 && (() => {
        const [x, y] = along(backPts, (local - 0.7) / 0.3);
        return <Packet x={x} y={y} color={C.soft} r={2.4} />;
      })()}
      <Box x={112} y={154} w={140} h={30} r={5} fill={C.ink} />
      <text x="120" y="173" fontSize="10" fontFamily="var(--font-jetbrains)" fill={C.fg}>
        {printed}
        <tspan fill={C.accent} opacity={Math.floor(t * 2) % 2}>▍</tspan>
      </text>
      <Label x={244} y={166} anchor="end" size={7}>COM1</Label>
      {halted && <Label x={244} y={178} anchor="end" fill={C.amber} size={7}>HALT · EXIT 0</Label>}
      <Label x={54} y={150}>{`EXITS ${step + (local > 0.5 ? 1 : 0)}`}</Label>
    </g>
  );
}

/* ---------------- Lucid Blocks co-op ----------------
   A five-message ownership handoff crosses a lossy, jittery link (one message is dropped and resent);
   then a block breaks and only the changed cells rescan instead of a full 840 KB resync. */
const MSGS = ['REQ', 'GRANT', 'COMMIT', 'ACK', 'DONE'];
export function LucidCover({ t: raw }: SceneProps) {
  const t = loop(raw, 10);
  const hand = (i: number) => {
    const start = 0.4 + i * 0.9 + (i >= 2 ? 0.9 : 0);
    return seg(t, start, start + 0.7);
  };
  const dropP = seg(t, 2.2, 2.9);
  const owner = t > 5.6 ? 1 : 0;
  const breakP = seg(t, 6.2, 6.5);
  const rescan = seg(t, 6.6, 8);
  const cells = 8 * 5;
  const broken = 19;
  const neighbors = [broken - 1, broken + 1, broken - 8, broken + 8];
  return (
    <g>
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${k ? 270 : 50} 46)`}>
          <circle r="16" fill={C.ink} stroke={owner === k ? C.accent : C.line} strokeWidth={owner === k ? 1.6 : 1} />
          <Label x={0} y={3} fill={owner === k ? C.accent : C.label}>{k ? 'GUEST' : 'HOST'}</Label>
          {owner === k && <Label x={0} y={-22} fill={C.accent} size={7}>OWNER</Label>}
        </g>
      ))}
      <line x1="66" y1="46" x2="254" y2="46" stroke={C.line} strokeDasharray="2 3" />
      <Label x={160} y={30}>UDP · 60 MS · 1% LOSS</Label>
      {/* dropped first COMMIT */}
      {dropP > 0 && dropP < 1 && (
        <g>
          {dropP < 0.55 ? <Packet x={lerp(70, 250, dropP * 0.9)} y={46} color={C.amber} r={2.4} /> : <Cross x={lerp(70, 250, 0.5)} y={46} />}
        </g>
      )}
      {MSGS.map((m, i) => {
        const p = hand(i);
        if (p <= 0 || p >= 1) return null;
        const fwd = i % 2 === 0;
        const jitter = Math.sin(t * 40 + i) * 2;
        const x = fwd ? lerp(70, 250, p) : lerp(250, 70, p);
        return (
          <g key={m}>
            <Packet x={x} y={46 + jitter} r={2.4} color={fwd ? C.accent : C.violet} />
            <Label x={x} y={64}>{m}</Label>
          </g>
        );
      })}
      {/* block grid */}
      <g transform="translate(96 88)">
        {Array.from({ length: cells }, (_, i) => {
          const x = (i % 8) * 16;
          const y = Math.floor(i / 8) * 16;
          const isBroken = i === broken && breakP > 0;
          const isNb = neighbors.includes(i) && rescan > 0;
          return (
            <rect
              key={i}
              x={x + (isBroken ? 7 * breakP : 0)}
              y={y + (isBroken ? 7 * breakP : 0)}
              width={isBroken ? 14 * (1 - breakP) : 14}
              height={isBroken ? 14 * (1 - breakP) : 14}
              rx="2"
              fill={isNb ? C.accent : [C.green, C.amber, C.sky][(i * 7) % 3]}
              opacity={isNb ? 0.35 + pulse(rescan, 0, 1) * 0.5 : 0.18}
            />
          );
        })}
      </g>
      <g opacity={seg(t, 6.6, 7)}>
        <Label x={40} y={130} fill={C.label}>FULL RESYNC</Label>
        <Label x={40} y={142} fill={C.label}>840 KB</Label>
        <line x1="10" y1="133" x2="72" y2="139" stroke={C.red} strokeWidth="1.4" />
        <Label x={276} y={130} fill={C.accent}>DIFF RESCAN</Label>
        <Label x={276} y={142} fill={C.accent}>4 CELLS</Label>
        <Check x={276} y={156} />
      </g>
      <Label x={160} y={190}>P95 SWITCH {'<'} 600 MS</Label>
    </g>
  );
}

/* ---------------- This portfolio ----------------
   The site in miniature: hero, a grid of animated covers, then the command palette opens and a
   command types itself. */
export function PortfolioCover({ t: raw }: SceneProps) {
  const t = loop(raw, 9);
  const scroll = easeCine(seg(t, 1.2, 2.6)) * 60;
  const pal = seg(t, 3.6, 4);
  const typed = 'cd projects'.slice(0, Math.floor(seg(t, 4.2, 5.6) * 11));
  const close = seg(t, 7.2, 7.6);
  const clip = 'pf' + useId().replace(/:/g, '');
  return (
    <g>
      <Box x={20} y={14} w={280} h={172} r={8} fill={C.ink} />
      <rect x="20" y="14" width="280" height="14" rx="8" fill={C.faint} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={30 + i * 8} cy={21} r="2.2" fill={C.line} />
      ))}
      <clipPath id={clip}>
        <rect x="21" y="29" width="278" height="156" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <g transform={`translate(0 ${-scroll})`}>
          <path d="M160 44 L170 62 L150 62 Z" fill={C.accent} />
          <Lines x={110} y={74} widths={[100]} color={C.fg} sw={3} />
          <Lines x={124} y={84} widths={[72]} color={C.line} sw={2.4} />
          <rect x="140" y="94" width="40" height="9" rx="3" fill={C.accent} opacity=".7" />
          {Array.from({ length: 6 }, (_, i) => {
            const x = 40 + (i % 3) * 82;
            const y = 120 + Math.floor(i / 3) * 52;
            return (
              <g key={i}>
                <rect x={x} y={y} width="74" height="44" rx="4" fill={C.panel} stroke={C.line} />
                <circle cx={x + 10 + ((t * 18 + i * 9) % 54)} cy={y + 16} r="2" fill={[C.accent, C.violet, C.amber][i % 3]} />
                <Lines x={x + 6} y={y + 32} widths={[40, 28]} gap={5} sw={1.4} />
              </g>
            );
          })}
        </g>
      </g>
      {pal > 0 && (
        <g opacity={pal * (1 - close)}>
          <rect x="20" y="28" width="280" height="158" fill={C.ink} opacity=".55" />
          <g transform={`translate(70 ${54 + (1 - pal) * 8})`}>
            <rect width="180" height="92" rx="6" fill={C.ink} stroke={C.line} />
            <text x="10" y="17" fontSize="8" fontFamily="var(--font-jetbrains)" fill={C.accent}>
              ~/tristan $ <tspan fill={C.fg}>{typed}</tspan>
            </text>
            <line x1="0" y1="25" x2="180" y2="25" stroke={C.line} />
            {['cd about', 'cd projects', 'cat cv'].map((c, i) => {
              const hl = typed.length > 3 ? i === 1 : i === 0;
              return (
                <g key={c}>
                  {hl && <rect x="6" y={31 + i * 18} width="168" height="15" rx="3" fill={C.faint} />}
                  <text x="14" y={41 + i * 18} fontSize="7.5" fontFamily="var(--font-jetbrains)" fill={hl ? C.fg : C.label}>
                    {c}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      )}
    </g>
  );
}

