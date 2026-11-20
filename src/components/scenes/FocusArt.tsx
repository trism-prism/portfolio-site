'use client';

import type { FocusKey } from '@/data/focus';
import { C, Label, Lines, Packet, Check, Cross, type SceneProps } from './Stage';
import { along, lerp, loop, seg, pulse } from '@/lib/kit';

// Small stages: 80x80 (lead card 160x80). Labels stay 8px after the card scales the art.

function FullStack({ t: raw }: SceneProps) {
  const t = loop(raw, 4);
  const p = seg(t, 0.2, 2.2);
  const back = seg(t, 2.2, 3.6);
  const pts: [number, number][] = [[30, 40], [80, 40], [130, 40]];
  return (
    <g>
      <rect x="10" y="22" width="40" height="36" rx="4" fill={C.panel} stroke={C.line} />
      <rect x="10" y="22" width="40" height="7" rx="3" fill={C.faint} />
      <Lines x={16} y={38} widths={[24, 16]} gap={7} sw={1.6} />
      <circle cx="80" cy="40" r="12" fill={C.panel} stroke={C.violet} />
      <Label x={80} y={43} fill={C.violet} size={3.8}>API</Label>
      <g transform="translate(118 26)">
        <ellipse cx="12" cy="4" rx="12" ry="4" fill={C.panel} stroke={C.accent} />
        <path d="M0 4 v20 a12 4 0 0 0 24 0 v-20" fill={C.panel} stroke={C.accent} />
        <ellipse cx="12" cy="14" rx="12" ry="4" fill="none" stroke={C.accent} opacity=".4" />
      </g>
      <line x1="50" y1="40" x2="68" y2="40" stroke={C.line} strokeDasharray="2 2" />
      <line x1="92" y1="40" x2="118" y2="40" stroke={C.line} strokeDasharray="2 2" />
      {p > 0 && p < 1 && <Packet x={along(pts, p)[0]} y={40} r={2.2} />}
      {back > 0 && back < 1 && <Packet x={along([...pts].reverse() as [number, number][], back)[0]} y={40} r={2.2} color={C.violet} />}
      <Label x={30} y={72} size={3.8}>REACT</Label>
      <Label x={130} y={72} size={3.8}>POSTGRES</Label>
    </g>
  );
}

function AiEval({ t: raw }: SceneProps) {
  const t = loop(raw, 5);
  const marks = [1, 1, 1, 0, 1, 1, 1, 1];
  return (
    <g>
      {marks.map((m, i) => {
        const on = seg(t, 0.3 + i * 0.4, 0.5 + i * 0.4);
        const x = 14 + (i % 4) * 17;
        const y = 22 + Math.floor(i / 4) * 20;
        return (
          <g key={i} opacity={0.25 + on * 0.75}>
            <rect x={x - 7} y={y - 7} width="14" height="14" rx="3" fill={C.panel} stroke={C.line} />
            {on > 0.5 && (m ? <Check x={x} y={y} s={0.6} /> : <Cross x={x} y={y} s={0.6} color={C.amber} />)}
          </g>
        );
      })}
      <Label x={40} y={70} size={3.8} fill={C.green}>{t > 3.6 ? '7/8 · 1 ABSTAIN' : 'FROZEN SET'}</Label>
    </g>
  );
}

function Data({ t: raw }: SceneProps) {
  const t = loop(raw, 5);
  const bars = [10, 14, 11, 16, 12, 13, 10, 15];
  const spike = seg(t, 2, 2.6);
  return (
    <g>
      <rect x="8" y="30" width="64" height="12" fill={C.accent} opacity=".1" />
      <line x1="8" y1="36" x2="72" y2="36" stroke={C.accent} strokeDasharray="2 2" opacity=".6" />
      {bars.map((b, i) => {
        const h = i === 7 ? lerp(b, 34, spike) : b;
        return <rect key={i} x={10 + i * 8} y={62 - h} width="5" height={h} rx="1" fill={i === 7 && spike > 0.5 ? C.red : C.line} />;
      })}
      <Label x={40} y={74} size={3.8}>MEDIAN ± MAD</Label>
    </g>
  );
}

function Systems({ t }: SceneProps) {
  const a = t * 0.8;
  const lx = 40 + Math.cos(a) * 14;
  const ly = 36 + Math.sin(a) * 8;
  return (
    <g>
      <path d={`M${lx},${ly} L8,8 L72,8 L72,40 L52,40 L52,30 L28,30 L28,64 L8,64 Z`} fill="#f59e0b" opacity=".12" />
      {Array.from({ length: 9 }, (_, i) => {
        const ang = (i / 9) * Math.PI * 2;
        return <line key={i} x1={lx} y1={ly} x2={lx + Math.cos(ang) * 40} y2={ly + Math.sin(ang) * 40} stroke="#fde68a" strokeOpacity=".22" />;
      })}
      <g stroke="#fb923c" strokeWidth="2" strokeLinecap="round">
        <line x1="28" y1="30" x2="52" y2="30" />
        <line x1="52" y1="30" x2="52" y2="48" />
        <line x1="20" y1="56" x2="40" y2="66" />
      </g>
      <circle cx={lx} cy={ly} r="3" fill="#fde68a" />
      <Label x={40} y={76} size={3.8}>EXACT PREDICATES</Label>
    </g>
  );
}

function Quality({ t: raw }: SceneProps) {
  const t = loop(raw, 5);
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const on = seg(t, 0.3 + i * 0.5, 0.5 + i * 0.5);
        const bug = i === 2;
        const fixed = bug && t > 3.4;
        return (
          <g key={i} opacity={0.3 + on * 0.7}>
            <rect x="10" y={14 + i * 14} width="60" height="10" rx="3" fill={C.panel} stroke={bug && !fixed && on > 0.5 ? C.red : C.line} />
            <Lines x={16} y={19 + i * 14} widths={[28]} sw={1.4} />
            {on > 0.5 && (bug && !fixed ? <Cross x={62} y={19 + i * 14} s={0.5} /> : <Check x={62} y={19 + i * 14} s={0.5} />)}
          </g>
        );
      })}
      <Label x={40} y={76} size={3.8} fill={t > 3.4 ? C.green : C.label}>{t > 3.4 ? 'FIXED · SHIP' : 'QA PASS'}</Label>
    </g>
  );
}

function Security({ t: raw }: SceneProps) {
  const t = loop(raw, 5);
  const p = seg(t, 0.8, 2.6);
  const keyOn = t > 2.8;
  return (
    <g>
      {[0, 1].map((k) => (
        <g key={k} transform={`translate(${k ? 56 : 8} 22)`}>
          <rect width="16" height="24" rx="3" fill={C.panel} stroke={keyOn ? C.green : C.line} />
          <circle cx="8" cy="20" r="1.4" fill={C.line} />
        </g>
      ))}
      <line x1="24" y1="34" x2="56" y2="34" stroke={C.line} strokeDasharray="2 2" />
      {p > 0 && p < 1 && <Packet x={lerp(26, 54, p)} y={34} r={2} color={C.violet} />}
      {p > 0 && p < 1 && <Packet x={lerp(54, 26, p)} y={34} r={2} color={C.accent} />}
      <g transform="translate(32 50)" opacity={0.4 + pulse(t, 2.8, 4.8) * 0.6}>
        <rect y="5" width="16" height="12" rx="2" fill={C.panel} stroke={keyOn ? C.green : C.line} />
        <path d={`M3 5 v-3 a5 5 0 0 1 10 0 v${keyOn ? 3 : 1}`} stroke={keyOn ? C.green : C.line} fill="none" strokeWidth="1.4" />
      </g>
      <Label x={40} y={16} size={3.8}>PAKE</Label>
    </g>
  );
}

function Networked({ t: raw }: SceneProps) {
  const t = loop(raw, 4);
  return (
    <g>
      <circle cx="14" cy="40" r="8" fill={C.panel} stroke={C.accent} />
      <circle cx="66" cy="40" r="8" fill={C.panel} stroke={C.violet} />
      <line x1="22" y1="40" x2="58" y2="40" stroke={C.line} strokeDasharray="2 2" />
      {[0, 1, 2].map((k) => {
        const p = seg(t, k * 0.9, k * 0.9 + 1.1);
        const dropped = k === 1 && p > 0.5;
        if (p <= 0 || p >= 1) return null;
        const j = Math.sin(t * 30 + k) * 2;
        return dropped ? <Cross key={k} x={40} y={40} s={0.5} /> : <Packet key={k} x={lerp(22, 58, p)} y={40 + j} r={2} />;
      })}
      <Label x={40} y={64} size={3.8}>JITTER · LOSS</Label>
    </g>
  );
}

export const focusArt: Record<FocusKey, { Scene: React.ComponentType<SceneProps>; frozenAt: number; label: string }> = {
  fullstack: { Scene: FullStack, frozenAt: 1.2, label: 'A request moving from a React front end through an API to PostgreSQL and back.' },
  'ai-eval': { Scene: AiEval, frozenAt: 4, label: 'An evaluation grid filling with passes and one abstention.' },
  data: { Scene: Data, frozenAt: 3, label: 'Daily counts within a median and MAD band, with one spike flagged.' },
  systems: { Scene: Systems, frozenAt: 1, label: 'A light casting rays around walls.' },
  quality: { Scene: Quality, frozenAt: 4, label: 'A test checklist where one failing case is fixed before shipping.' },
  security: { Scene: Security, frozenAt: 3.4, label: 'Two devices exchange keys and a lock closes.' },
  networked: { Scene: Networked, frozenAt: 1.5, label: 'Packets crossing a jittery link, one dropped.' },
};
