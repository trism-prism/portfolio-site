// Original SVG cast for the footer scenes. Feet sit at (0,0); characters are about 64 units tall.

export type PersonPose = 'stand' | 'wave' | 'cheer' | 'sit' | 'think' | 'run' | 'shrug' | 'clipboard';

export type Look = { shirt: string; pants: string; skin: string; hair: string; hairStyle?: 'short' | 'long' | 'cap' | 'bun' | 'curly' };

export const LOOKS: Look[] = [
  { shirt: '#2dd4bf', pants: '#334155', skin: '#e8b48f', hair: '#3b2a20', hairStyle: 'short' }, // the owner (placeholder look)
  { shirt: '#a78bfa', pants: '#1e293b', skin: '#c68863', hair: '#111827', hairStyle: 'curly' },
  { shirt: '#f59e0b', pants: '#3f3f46', skin: '#f1c7a5', hair: '#a16207', hairStyle: 'long' },
  { shirt: '#38bdf8', pants: '#27272a', skin: '#8d5a3b', hair: '#0f0f0f', hairStyle: 'cap' },
  { shirt: '#fb7185', pants: '#334155', skin: '#f3d0b5', hair: '#7c2d12', hairStyle: 'bun' },
  { shirt: '#22c55e', pants: '#1f2937', skin: '#d9a07a', hair: '#292524', hairStyle: 'short' },
  { shirt: '#e2e8f0', pants: '#475569', skin: '#b07a55', hair: '#1c1917', hairStyle: 'long' },
];

function Hair({ look }: { look: Look }) {
  const h = look.hair;
  switch (look.hairStyle) {
    case 'long':
      return <path d="M-8 -52 Q0 -62 8 -52 L9 -40 L6 -44 L-6 -44 L-9 -40 Z" fill={h} />;
    case 'cap':
      return (
        <>
          <path d="M-8 -52 Q0 -61 8 -52 Z" fill={h} />
          <rect x="-1" y="-54" width="13" height="3" rx="1.5" fill={h} />
        </>
      );
    case 'bun':
      return (
        <>
          <circle cx="0" cy="-60" r="4" fill={h} />
          <path d="M-8 -51 Q0 -60 8 -51 Z" fill={h} />
        </>
      );
    case 'curly':
      return <path d="M-9 -50 q-1 -6 3 -8 q2 -4 6 -3 q4 -2 6 2 q4 2 3 8 Z" fill={h} />;
    default:
      return <path d="M-8 -50 Q-7 -60 1 -59 Q8 -58 8 -50 L5 -53 Z" fill={h} />;
  }
}

/** A person; `phase` drives the run cycle and small idle motion. */
export function Person({ look, pose = 'stand', phase = 0, flip = false, eyesClosed = false }: { look: Look; pose?: PersonPose; phase?: number; flip?: boolean; eyesClosed?: boolean }) {
  const sit = pose === 'sit';
  const run = pose === 'run';
  const swing = run ? Math.sin(phase * Math.PI * 2) * 0.7 : 0;
  const bob = run ? Math.abs(Math.sin(phase * Math.PI * 2)) * -2 : Math.sin(phase * Math.PI * 2) * 0.6;
  const hipY = sit ? -16 : -22;
  const leg = (dir: number) =>
    sit ? `M${dir * 3} ${hipY} L${dir * 3 + 9} ${hipY} L${dir * 3 + 9} 0` : `M${dir * 3} ${hipY} L${dir * 3 + Math.sin(swing * dir) * 9} 0`;
  const arm = (side: number) => {
    const sx = side * 7;
    if (pose === 'wave' && side === 1) return `M${sx} -40 L${sx + 6} -50 L${sx + 9 + Math.sin(phase * 12) * 2} -60`;
    if (pose === 'cheer') return `M${sx} -40 L${sx + side * 5} -52 L${sx + side * 7} -62`;
    if (pose === 'think' && side === 1) return `M${sx} -40 L${sx + 2} -32 L${sx - 4} -44`;
    if (pose === 'shrug') return `M${sx} -40 L${sx + side * 8} -36 L${sx + side * 11} -44`;
    if (pose === 'clipboard' && side === 1) return `M${sx} -40 L${sx + 3} -30 L${sx - 2} -28`;
    if (run) return `M${sx} -40 L${sx - Math.sin(swing * side) * 8} -28`;
    if (sit) return `M${sx} -40 L${sx + side * 3} -28 L${sx + 6} -22`;
    return `M${sx} -40 L${sx + side * 2} -24`;
  };
  return (
    <g transform={`translate(0 ${bob}) ${flip ? 'scale(-1 1)' : ''}`}>
      <ellipse cx="0" cy="1" rx="11" ry="2.2" fill="#000" opacity=".25" />
      <g stroke={look.pants} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={leg(-1)} />
        <path d={leg(1)} />
      </g>
      <rect x="-8" y="-44" width="16" height={sit ? 30 : 24} rx="6" fill={look.shirt} />
      <g stroke={look.skin} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={arm(-1)} />
        <path d={arm(1)} />
      </g>
      {pose === 'clipboard' && <rect x="2" y="-36" width="10" height="13" rx="1.5" fill="#e2e8f0" stroke="#64748b" />}
      <circle cx="0" cy="-50" r="8" fill={look.skin} />
      <Hair look={look} />
      {eyesClosed ? (
        <g stroke="#1f2937" strokeWidth="1.1" strokeLinecap="round">
          <path d="M1 -49 h2.6" />
          <path d="M5.6 -49 h2" />
        </g>
      ) : (
        <g fill="#1f2937">
          <circle cx="2.4" cy="-50" r="1.1" />
          <circle cx="6.2" cy="-50" r="1.1" />
        </g>
      )}
      {(pose === 'cheer' || pose === 'wave') && <path d="M2 -45.6 q2.2 1.8 4.4 0" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />}
    </g>
  );
}
