'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { toPoints, type Point } from '../lib/visibility';
import {
  LANTERN_PARTS,
  LIGHT_BANDS,
  COLORS,
  scenes,
  shapePath,
  steppedDisc,
  type Scene,
  type SceneId,
  type Shape,
} from './geometry';
import { initialLit, litPolygon } from './light';
import styles from './LanternScene.module.css';

const discs = LIGHT_BANDS.map((b) => toPoints(steppedDisc(b.r)));

function ShapeEl({ shape }: { shape: Shape }) {
  return (
    <path
      d={shapePath(shape)}
      fill={shape.fill ?? 'none'}
      fillRule={shape.evenodd ? 'evenodd' : undefined}
      stroke={shape.stroke}
      strokeWidth={shape.strokeWidth}
      strokeLinecap={shape.stroke ? 'square' : undefined}
    />
  );
}

function SceneSvg({ scene }: { scene: Scene }) {
  const { x, y, railY } = scene.lantern;
  const id = scene.id;
  const chainH = y - railY - 8 - 32;
  return (
    <svg
      className={`${styles.svg} ${styles[id]}`}
      viewBox={`0 0 ${scene.w} ${scene.h}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-scene={id}
    >
      <defs>
        {discs.map((pts, i) => (
          <clipPath id={`${id}-band-${i}`} key={i} data-band={i} transform={`translate(${x} ${y})`}>
            <polygon points={pts} />
          </clipPath>
        ))}
        <polygon id={`${id}-lit`} data-lit points={initialLit[id]} />
      </defs>
      {scene.back.map((s) => (
        <ShapeEl shape={s} key={s.id} />
      ))}
      {LIGHT_BANDS.map((b, i) => (
        <g key={i} clipPath={`url(#${id}-band-${i})`}>
          <use href={`#${id}-lit`} fill={b.fill} fillOpacity={b.opacity} />
        </g>
      ))}
      {scene.front.map((s) => (
        <ShapeEl shape={s} key={s.id} />
      ))}
      <g data-trolley transform={`translate(${x} 0)`}>
        <rect x={-8} y={railY - 4} width={16} height={16} fill={COLORS.plum} />
        <rect data-chain x={-2} y={railY + 8} width={4} height={chainH} fill={COLORS.plum} />
      </g>
      <g data-lantern transform={`translate(${x} ${y})`}>
        {LANTERN_PARTS.map((q, i) => (
          <rect key={i} x={q.x} y={q.y} width={q.w} height={q.h} fill={q.fill} />
        ))}
      </g>
    </svg>
  );
}

const STEP = 16;

export function LanternScene() {
  const root = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const wide = window.matchMedia('(min-width: 700px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const svgs = Object.fromEntries(
      Array.from(el.querySelectorAll<SVGSVGElement>('svg[data-scene]')).map((s) => [s.dataset.scene as SceneId, s]),
    ) as Record<SceneId, SVGSVGElement>;
    const pos: Record<SceneId, { x: number; y: number; tx: number; ty: number }> = {
      wide: { ...scenes.wide.lantern, tx: scenes.wide.lantern.x, ty: scenes.wide.lantern.y },
      narrow: { ...scenes.narrow.lantern, tx: scenes.narrow.lantern.x, ty: scenes.narrow.lantern.y },
    };
    const active = (): SceneId => (wide.matches ? 'wide' : 'narrow');

    let raf = 0;
    let last = 0;
    let lastDraw = 0;
    let inView = true;
    let lastInput = -1e9;
    let dragging: number | null = null;

    const apply = (id: SceneId, x: number, y: number) => {
      const scene = scenes[id];
      const svg = svgs[id];
      const lit = svg.querySelector<SVGPolygonElement>('[data-lit]');
      lit?.setAttribute('points', toPoints(litPolygon(scene, { x, y })));
      svg.querySelectorAll('[data-band]').forEach((c) => c.setAttribute('transform', `translate(${x} ${y})`));
      svg.querySelector('[data-lantern]')?.setAttribute('transform', `translate(${x} ${y})`);
      svg.querySelector('[data-trolley]')?.setAttribute('transform', `translate(${x} 0)`);
      svg.querySelector('[data-chain]')?.setAttribute('height', String(Math.max(0, y - scene.lantern.railY - 8 - 32)));
    };

    const clamp = (id: SceneId) => {
      const l = scenes[id].lantern;
      const s = pos[id];
      s.tx = Math.min(l.maxX, Math.max(l.minX, s.tx));
      s.ty = Math.min(l.maxY, Math.max(l.minY, s.ty));
    };

    const frame = (now: number) => {
      raf = 0;
      const id = active();
      const s = pos[id];
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      let moving = false;
      if (reduced.matches) {
        moving = s.x !== s.tx || s.y !== s.ty;
        s.x = s.tx;
        s.y = s.ty;
      } else {
        const k = 1 - Math.exp(-dt * 14);
        s.x += (s.tx - s.x) * k;
        s.y += (s.ty - s.y) * k;
        if (Math.abs(s.tx - s.x) < 0.05 && Math.abs(s.ty - s.y) < 0.05) {
          s.x = s.tx;
          s.y = s.ty;
        } else moving = true;
      }
      let sx = 0;
      let sy = 0;
      const idle = !reduced.matches && !moving && now - lastInput > 1500;
      if (idle) {
        const t = now / 1000;
        sx = Math.sin((t * Math.PI * 2) / 7) * 4;
        sy = Math.sin((t * Math.PI * 2) / 7 + 1.2) * 1.5;
      }
      // Idle sway is slow, so it redraws at about 15 per second; direct movement redraws every frame.
      if (moving || now - lastDraw > 66 || !idle) {
        lastDraw = now;
        apply(id, s.x + sx, s.y + sy);
      }
      if (inView && !document.hidden && (moving || !reduced.matches)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && inView && !document.hidden) {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };

    const toScene = (clientX: number, clientY: number) => {
      const id = active();
      const m = svgs[id].getScreenCTM();
      if (!m) return null;
      const q = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
      return { id, x: q.x, y: q.y };
    };
    const target = (e: PointerEvent, xOnly: boolean) => {
      const q = toScene(e.clientX, e.clientY);
      if (!q) return;
      pos[q.id].tx = q.x;
      if (!xOnly) pos[q.id].ty = q.y;
      clamp(q.id);
      lastInput = performance.now();
      kick();
    };

    // Mouse and pen: the light follows the pointer. Touch: a horizontal drag moves it, and vertical
    // drags are left to the browser so the page still scrolls (touch-action: pan-y in the CSS).
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        if (dragging === e.pointerId) target(e, true);
      } else target(e, false);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        dragging = e.pointerId;
        target(e, true);
      } else target(e, false);
    };
    const onUp = (e: PointerEvent) => {
      if (dragging === e.pointerId) dragging = null;
    };
    const onKey = (e: KeyboardEvent) => {
      const d: Record<string, [number, number]> = {
        ArrowLeft: [-STEP, 0],
        ArrowRight: [STEP, 0],
        ArrowUp: [0, -STEP],
        ArrowDown: [0, STEP],
      };
      const m = d[e.key];
      if (!m) return;
      e.preventDefault();
      const id = active();
      pos[id].tx += m[0];
      pos[id].ty += m[1];
      clamp(id);
      lastInput = performance.now();
      const l = scenes[id].lantern;
      if (status.current) {
        const pct = Math.round(((pos[id].tx - l.minX) / (l.maxX - l.minX)) * 100);
        status.current.textContent = `Lantern ${pct} percent of the way across.`;
      }
      kick();
    };
    const onResize = () => {
      clamp(active());
      kick();
    };

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) kick();
    });
    io.observe(el);
    const onVisibility = () => kick();
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    wide.addEventListener('change', onResize);
    reduced.addEventListener('change', onResize);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      wide.removeEventListener('change', onResize);
      reduced.removeEventListener('change', onResize);
    };
  }, []);

  return (
    <figure className={styles.figure}>
      <div
        ref={root}
        className={styles.scene}
        role="group"
        tabIndex={0}
        aria-roledescription="interactive scene"
        aria-label="A colonnade at night lit by one lantern. Use the arrow keys to move the lantern and watch the shadows change."
        aria-describedby="scene-caption"
        data-testid="lantern-scene"
      >
        <SceneSvg scene={scenes.wide} />
        <SceneSvg scene={scenes.narrow} />
        <span ref={status} className="visually-hidden" role="status" aria-live="polite" />
      </div>
      <figcaption id="scene-caption" className={styles.caption}>
        One lantern, real shadows. Move it with the pointer, a sideways drag, or the arrow keys.{' '}
        <Link href="/work/visibility-engine/">How the light is worked out</Link>
      </figcaption>
    </figure>
  );
}
