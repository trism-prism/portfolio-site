'use client';

import { C, Box, Label, Packet, Check, Cross, type SceneProps } from './Stage';
import { along, lerp, loop, seg, type P } from '@/lib/kit';

/* Formwork, in résumé terms only: a chat request flows through the agent to MCP tool definitions and
   REST connections, accuracy checks tick before launch; a QA pass catches the JWT caching bug; releases
   leave on a ~3-per-week train. No product UI, client names or internal details. */
export function FormworkScene({ t: raw }: SceneProps) {
  const t = loop(raw, 10);
  const route: P[] = [[40, 42], [104, 42], [168, 42], [236, 42], [292, 42]];
  const req = seg(t, 0.2, 2.6);
  const checks = seg(t, 2.6, 3.6);
  const qa = seg(t, 3.8, 6.6);
  const train = seg(t, 6.8, 9.6);
  const [px, py] = along(route, req);
  const nodes = [
    { x: 40, label: 'CHAT' },
    { x: 104, label: 'AGENT', c: C.violet },
    { x: 168, label: 'MCP TOOLS', c: C.accent },
    { x: 236, label: 'REST API' },
    { x: 292, label: 'PLATFORM' },
  ];
  const rows = ['AUTH', 'SEARCH', 'FINANCIALS', 'JWT CACHE', 'MIGRATIONS'];
  return (
    <g>
      <line x1="40" y1="42" x2="292" y2="42" stroke={C.line} strokeDasharray="2 3" />
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={42} r="13" fill={C.ink} stroke={n.c ?? C.line} />
          <Label x={n.x} y={68} fill={n.c ?? C.label}>{n.label}</Label>
        </g>
      ))}
      {req > 0 && req < 1 && <Packet x={px} y={py} />}
      {[0, 1, 2].map((k) => (
        <g key={k} opacity={seg(checks, k * 0.3, k * 0.3 + 0.3)}>
          <Check x={150 + k * 18} y={86} />
        </g>
      ))}
      <Label x={168} y={102} fill={C.green}>{checks > 0.9 ? 'ACCURACY CHECKED · LIVE' : ''}</Label>
      {/* QA lane */}
      <Box x={14} y={112} w={150} h={76} r={6} fill={C.ink} />
      <Label x={22} y={126} anchor="start">QA PASS · 500+ CASES</Label>
      {rows.map((r, i) => {
        const p = seg(qa, i * 0.18, i * 0.18 + 0.2);
        const bug = i === 3;
        const fixed = bug && qa > 0.95;
        return (
          <g key={r} opacity={0.35 + p * 0.65}>
            <Label x={24} y={142 + i * 10} anchor="start" size={6.5} fill={bug && p > 0.9 && !fixed ? C.red : C.label}>{r}</Label>
            {p > 0.9 && (bug && !fixed ? <Cross x={150} y={140 + i * 10} s={0.7} /> : <Check x={150} y={140 + i * 10} s={0.7} />)}
          </g>
        );
      })}
      {/* release train */}
      <Box x={178} y={112} w={128} h={76} r={6} fill={C.ink} />
      <Label x={186} y={126} anchor="start">~3 RELEASES / WEEK</Label>
      <line x1="186" y1="164" x2="298" y2="164" stroke={C.line} />
      {[0, 1, 2].map((k) => {
        const p = seg(train, k * 0.25, k * 0.25 + 0.5);
        return (
          <g key={k} transform={`translate(${lerp(170, 300, p)} 152)`} opacity={p > 0 && p < 1 ? 1 : 0}>
            <rect width="22" height="12" rx="3" fill={[C.accent, C.violet, C.sky][k]} opacity=".7" />
          </g>
        );
      })}
      <Label x={242} y={180} fill={C.soft}>{['MON', 'WED', 'FRI'][Math.min(2, Math.floor(train * 3))]}</Label>
    </g>
  );
}
