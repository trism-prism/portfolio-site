'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Person, LOOKS } from './Cast';
import { PrismCharacter } from '@/components/ui/Prism';
import { boxWalls, polyPath, raySeg, visibility, type Pt, type Seg } from '@/lib/visibility';
import { clamp, easeOut, lerp, loop, seg } from '@/lib/kit';
import { emit } from '@/lib/nav';

export const FW = 720, FH = 240;
export type FooterSceneProps = { t: number; reduced: boolean; hold: number; idle: boolean };

const mono = 'var(--font-jetbrains), monospace';

/* ---------------- 1. Lightroom ----------------
   The prism carries a lamp (your pointer steers it); the lit area is a real visibility polygon.
   Anyone the light reaches waves; people in shadow doze. */
const sg = (ax: number, ay: number, bx: number, by: number): Seg => ({ a: { x: ax, y: ay }, b: { x: bx, y: by } });
const ROOM: Seg[] = [
  ...boxWalls(FW, FH).map((s) => s),
  sg(150, 0, 150, 90), sg(150, 140, 150, FH), sg(570, 0, 570, 100), sg(570, 150, 570, FH),
  sg(270, 70, 330, 70), sg(390, 170, 450, 170), sg(250, 150, 290, 190), sg(430, 50, 470, 90),
];
const SEATS: Pt[] = [{ x: 70, y: 200 }, { x: 95, y: 110 }, { x: 640, y: 200 }, { x: 660, y: 110 }, { x: 360, y: 225 }];

function litBy(light: Pt, p: Pt) {
  const d = { x: p.x - light.x, y: p.y - light.y };
  const len = Math.hypot(d.x, d.y);
  const dir = { x: d.x / len, y: d.y / len };
  for (const w of ROOM) {
    const t = raySeg(light, dir, w);
    if (t !== null && t < len - 1) return false;
  }
  return true;
}

export function Lightroom({ t, reduced, idle }: FooterSceneProps) {
  const id = useId().replace(/:/g, '');
  const svg = useRef<SVGGElement>(null);
  const [pointer, setPointer] = useState<Pt | null>(null);
  useEffect(() => {
    const el = svg.current?.ownerSVGElement;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      setPointer({ x: ((e.clientX - r.left) / r.width) * FW, y: ((e.clientY - r.top) / r.height) * FH });
    };
    const leave = () => setPointer(null);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);
  const auto = { x: 360 + Math.sin(t * 0.35) * 240, y: 120 + Math.sin(t * 0.6) * 60 };
  const light = pointer && !reduced ? { x: clamp(pointer.x, 4, FW - 4), y: clamp(pointer.y, 4, FH - 4) } : reduced ? { x: 360, y: 120 } : auto;
  const vis = visibility(light, ROOM);
  return (
    <g ref={svg}>
      <defs>
        <radialGradient id={`lr-${id}`} cx={light.x} cy={light.y} r="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" stopOpacity=".55" />
          <stop offset=".4" stopColor="#f59e0b" stopOpacity=".18" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={FW} height={FH} fill="#05080a" opacity=".55" />
      <path d={polyPath(vis.polygon)} fill={`url(#lr-${id})`} />
      <g stroke="#fb923c" strokeWidth="3.5" strokeLinecap="round">
        {ROOM.slice(4).map((w, i) => (
          <line key={i} x1={w.a.x} y1={w.a.y} x2={w.b.x} y2={w.b.y} />
        ))}
      </g>
      {SEATS.map((s, i) => {
        const lit = litBy(light, { x: s.x, y: s.y - 40 });
        return (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(.72)`} opacity={lit ? 1 : 0.55}>
            <Person look={LOOKS[(i + 1) % LOOKS.length]} pose={lit ? 'wave' : 'sit'} phase={t} eyesClosed={!lit && idle} flip={s.x > 360} />
          </g>
        );
      })}
      <g transform={`translate(${light.x - 17} ${light.y - 8})`}>
        <PrismCharacter pose={idle ? 'sleep' : 'idle'} size={34} />
      </g>
      <circle cx={light.x} cy={light.y} r="4" fill="#fde68a" />
      <text x={FW - 12} y={FH - 10} textAnchor="end" fontFamily={mono} fontSize="10" fill="var(--sc-label)">
        {pointer ? 'YOUR LIGHT' : 'MOVE YOUR POINTER HERE'} · {vis.rays} RAYS
      </text>
    </g>
  );
}

/* ---------------- 2. Game day ----------------
   Scroll velocity drives the play: scroll down and the offense runs toward the end zone, scroll up and
   the play rewinds. Idle long enough and everyone takes a knee. */
export function GameDay({ t, reduced, idle }: FooterSceneProps) {
  const [pos, setPos] = useState(0.15);
  const [vel, setVel] = useState(0);
  useEffect(() => {
    if (reduced) return;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let decay = 0;
    const on = () => {
      const now = performance.now();
      if (now - lastT < 66) return; // throttle like a 15 Hz rate update
      const dy = window.scrollY - lastY;
      const v = dy / (now - lastT);
      lastY = window.scrollY;
      lastT = now;
      setVel(v);
      setPos((p) => clamp(p + v * 0.06, 0.05, 0.95));
      clearTimeout(decay);
      decay = window.setTimeout(() => setVel(0), 250);
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => {
      window.removeEventListener('scroll', on);
      clearTimeout(decay);
    };
  }, [reduced]);
  const moving = Math.abs(vel) > 0.02;
  const x0 = 60 + pos * 560;
  const players = [0, 1, 2, 3, 4];
  return (
    <g>
      <rect x="20" y="40" width="680" height="170" rx="6" fill="#0f3d2e" opacity=".55" />
      <rect x="20" y="40" width="50" height="170" fill="#14532d" opacity=".5" />
      <rect x="650" y="40" width="50" height="170" fill="#14532d" opacity=".5" />
      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <line x1={70 + i * 58} y1="40" x2={70 + i * 58} y2="210" stroke="#e2e8f0" strokeOpacity=".22" />
          <text x={70 + i * 58} y="58" textAnchor="middle" fontFamily={mono} fontSize="9" fill="#e2e8f0" opacity=".35">
            {i <= 5 ? i * 10 : (10 - i) * 10}
          </text>
        </g>
      ))}
      <text x="675" y="130" fontFamily={mono} fontSize="11" fill="#e2e8f0" opacity=".5" transform="rotate(90 675 130)" textAnchor="middle">
        END ZONE
      </text>
      <line x1={x0 + 40} y1="40" x2={x0 + 40} y2="210" stroke="#fbbf24" strokeWidth="2" opacity=".6" />
      {players.map((i) => (
        <g key={i} transform={`translate(${x0 + (i % 2) * 18 - i * 6} ${100 + i * 22}) scale(.62)`}>
          <Person look={{ ...LOOKS[3], shirt: i === 2 ? '#2dd4bf' : '#38bdf8' }} pose={idle ? 'sit' : moving ? 'run' : 'stand'} phase={moving ? t * 1.6 : t * 0.2} flip={vel < -0.02} />
        </g>
      ))}
      <ellipse cx={x0 + 30} cy={150} rx="6" ry="3.6" fill="#92400e" stroke="#fde68a" strokeWidth=".6" />
      <g transform="translate(110 236) scale(.9)">
        <Person look={LOOKS[0]} pose={pos > 0.9 ? 'cheer' : 'clipboard'} phase={t} />
      </g>
      <text x={FW - 16} y="30" textAnchor="end" fontFamily={mono} fontSize="10" fill="var(--sc-label)">
        {reduced ? 'SCROLL-DRIVEN PLAY (PAUSED)' : `SCROLL TO RUN THE PLAY · ${Math.round(pos * 100)} YD`}
      </text>
      <text x="20" y="30" fontFamily={mono} fontSize="10" fill="var(--sc-label)">
        SPREAD −3.5 · BRIER 0.177
      </text>
    </g>
  );
}

/* ---------------- 3. Trivia ----------------
   The prism hosts a question from the heart-disease project. Wrong answers shake; the right one sets
   off cheers and an envelope that flies to the email control below. */
const Q = {
  q: 'Which model shipped in the heart-disease project?',
  a: ['Random forest', 'Logistic regression', 'XGBoost'],
  right: 1,
  why: 'It won on precision at recall ≥ 0.90, so the simpler model shipped.',
};
export function Trivia({ t, reduced }: FooterSceneProps) {
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const [solvedAt, setSolvedAt] = useState<number | null>(null);
  const solved = picked === Q.right;
  const env = solvedAt !== null && !reduced ? seg(t, solvedAt, solvedAt + 1.4) : solved ? 1 : 0;
  useEffect(() => {
    if (solved && env >= 1) emit({ type: 'email-pulse' });
  }, [solved, env >= 1]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (i: number) => {
    setPicked(i);
    if (i === Q.right) setSolvedAt(t);
    else {
      setWrong(i);
      window.setTimeout(() => setWrong(null), 420);
    }
  };
  return (
    <g>
      <rect x="150" y="16" width="420" height="120" rx="10" fill="var(--sc-ink)" stroke="var(--sc-line)" />
      <text x="166" y="38" fontFamily={mono} fontSize="10" fill="var(--sc-label)">TRIVIA · FROM THE PROJECTS</text>
      <text x="360" y="60" textAnchor="middle" fontFamily="var(--font-inter)" fontSize="15" fontWeight="600" fill="var(--fg)">
        {Q.q}
      </text>
      <text x="360" y="82" textAnchor="middle" fontFamily="var(--font-inter)" fontSize="12" fill={solved ? 'var(--green)' : 'var(--sc-label)'}>
        {solved ? Q.why : picked !== null ? 'Not quite. Try another.' : 'Pick an answer below.'}
      </text>
      <g transform="translate(110 150)">
        <PrismCharacter pose={solved ? 'cheer' : wrong !== null ? 'crouch' : 'wave'} size={44} />
      </g>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${220 + i * 70} 232) scale(.8)`} className={wrong !== null && i === 2 ? 'shake' : undefined}>
          <Person look={LOOKS[(i + 1) % LOOKS.length]} pose={solved ? 'cheer' : i === 2 && wrong !== null ? 'shrug' : 'think'} phase={t + i * 0.3} />
        </g>
      ))}
      {env > 0 && env < 1 && (
        <g transform={`translate(${lerp(360, 360, env)} ${lerp(120, 300, easeOut(env))}) rotate(${env * 30})`}>
          <rect x="-14" y="-10" width="28" height="20" rx="2" fill="var(--sc-ink)" stroke="var(--accent)" />
          <path d="M-14 -10 L0 2 L14 -10" stroke="var(--accent)" fill="none" />
        </g>
      )}
      <foreignObject x="150" y="94" width="420" height="40">
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          {Q.a.map((a, i) => (
            <button
              key={a}
              type="button"
              onClick={() => choose(i)}
              disabled={solved}
              className={`mono rounded-full border px-3 py-1 text-[11.5px] ${wrong === i ? 'shake border-red-400 text-red-400' : solved && i === Q.right ? 'border-green text-green' : 'border-line-2 text-fg-2 hover:text-fg'}`}
              style={{ background: 'var(--panel)' }}
            >
              {a}
            </button>
          ))}
        </div>
      </foreignObject>
      {solved && (
        <foreignObject x="590" y="110" width="120" height="30">
          <button type="button" className="mono text-[11px] text-accent underline" onClick={() => { setPicked(null); setSolvedAt(null); }}>
            play again
          </button>
        </foreignObject>
      )}
    </g>
  );
}

/* ---------------- 4. Orbit ----------------
   The cast walks a perspective ellipse around a prism, scaled and layered by depth, hopping as they
   pass the front. Holding the email button speeds them up; after a while without input they slow. */
export function Orbit({ t, reduced, hold, idle }: FooterSceneProps) {
  const speed = reduced ? 0 : (idle ? 0.06 : 0.22) + hold * 1.4;
  const [a0, setA0] = useState(0);
  const lastT = useRef(t);
  useEffect(() => {
    const dt = Math.min(0.1, Math.max(0, t - lastT.current));
    lastT.current = t;
    if (dt) setA0((a) => a + dt * speed);
  }, [t, speed]);
  const cast = useMemo(() => LOOKS.map((l, i) => ({ l, off: (i / LOOKS.length) * Math.PI * 2 })), []);
  const placed = cast
    .map(({ l, off }, i) => {
      const a = a0 + off;
      const depth = (Math.sin(a) + 1) / 2; // 0 back, 1 front
      const x = 360 + Math.cos(a) * 250;
      const y = 126 + Math.sin(a) * 46;
      const hop = Math.max(0, Math.cos(a - Math.PI / 2) - 0.92) * 120;
      return { l, i, x, y: y - hop, depth, front: depth > 0.5 };
    })
    .sort((p, q) => p.depth - q.depth);
  const back = placed.filter((p) => !p.front);
  const front = placed.filter((p) => p.front);
  const draw = (p: (typeof placed)[number]) => (
    <g key={p.i} transform={`translate(${p.x} ${p.y + 52}) scale(${0.55 + p.depth * 0.45})`} opacity={0.55 + p.depth * 0.45}>
      <Person look={p.l} pose={hold > 0.2 ? 'cheer' : p.depth > 0.85 ? 'wave' : 'run'} phase={t * (0.5 + speed)} flip={Math.cos(a0) > 0 === p.front} />
    </g>
  );
  return (
    <g>
      <ellipse cx="360" cy="178" rx="262" ry="50" fill="none" stroke="var(--sc-line)" strokeDasharray="4 6" />
      {back.map(draw)}
      <g transform="translate(330 96)">
        <PrismCharacter pose={hold > 0.2 ? 'cheer' : idle ? 'sleep' : 'idle'} size={60} />
      </g>
      {front.map(draw)}
      <text x="20" y="28" fontFamily={mono} fontSize="10" fill="var(--sc-label)">
        {hold > 0.05 ? 'FASTER!' : idle ? 'RESTING · MOVE TO WAKE' : 'HOLD THE EMAIL BUTTON TO SPEED UP'}
      </text>
    </g>
  );
}

export const footerScenes = [
  { id: 'lightroom', name: 'Lightroom', Scene: Lightroom, label: 'A room where the prism carries a lamp; your pointer moves the light and a computed visibility polygon shows what it reaches.' },
  { id: 'gameday', name: 'Game day', Scene: GameDay, label: 'A football field where scrolling the page runs the play forward or rewinds it.' },
  { id: 'trivia', name: 'Trivia', Scene: Trivia, label: 'A trivia question from the projects with three answer buttons.' },
  { id: 'orbit', name: 'Orbit', Scene: Orbit, label: 'The cast walks in a ring around the prism; holding the email button speeds them up.' },
] as const;
