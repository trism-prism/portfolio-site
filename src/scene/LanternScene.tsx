'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { toPoints } from '../lib/visibility';
import { LANTERN_TOP, scenes, type SceneId } from './geometry';
import { litPolygon } from './light';
import { SceneMarkup } from './SceneMarkup';
import styles from './LanternScene.module.css';

const STEP = 16; // arrow-key step in scene units
const DRAG_START = 10; // px of mostly horizontal movement before a touch drag moves the lantern
const IDLE_AFTER = 1500; // ms without input before the lantern starts to sway
const SWAY_RAMP = 2500; // ms to bring the sway up from nothing, so the lantern never jumps

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
    const pos = Object.fromEntries(
      (Object.keys(scenes) as SceneId[]).map((id) => {
        const l = scenes[id].lantern;
        return [id, { x: l.x, y: l.y, tx: l.x, ty: l.y }];
      }),
    ) as Record<SceneId, { x: number; y: number; tx: number; ty: number }>;
    const active = (): SceneId => (wide.matches ? 'wide' : 'narrow');

    let raf = 0;
    let timer = 0;
    let last = 0;
    let inView = true;
    let lastInput = performance.now();
    let touch: { id: number; x: number; y: number; dragging: boolean } | null = null;

    const apply = (id: SceneId, x: number, y: number) => {
      const scene = scenes[id];
      const svg = svgs[id];
      svg.querySelector('[data-poly]')?.setAttribute('points', toPoints(litPolygon(scene, { x, y })));
      svg.querySelectorAll('[data-disc]').forEach((c) => c.setAttribute('transform', `translate(${x} ${y})`));
      svg.querySelector('[data-lantern]')?.setAttribute('transform', `translate(${x} ${y})`);
      svg.querySelector('[data-trolley]')?.setAttribute('transform', `translate(${x} 0)`);
      svg.querySelector('[data-chain]')?.setAttribute('height', String(Math.max(0, y - LANTERN_TOP - scene.lantern.rodY - 8)));
    };

    const clamp = (id: SceneId) => {
      const l = scenes[id].lantern;
      const s = pos[id];
      s.tx = Math.min(l.maxX, Math.max(l.minX, s.tx));
      s.ty = Math.min(l.maxY, Math.max(l.minY, s.ty));
    };

    const running = () => inView && !document.hidden;

    const frame = (now: number) => {
      raf = 0;
      timer = 0;
      if (!running()) return;
      const id = active();
      const s = pos[id];
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      let moving: boolean;
      if (reduced.matches) {
        moving = s.x !== s.tx || s.y !== s.ty;
        s.x = s.tx;
        s.y = s.ty;
      } else {
        const k = 1 - Math.exp(-dt * 14);
        s.x += (s.tx - s.x) * k;
        s.y += (s.ty - s.y) * k;
        moving = Math.abs(s.tx - s.x) > 0.05 || Math.abs(s.ty - s.y) > 0.05;
        if (!moving) {
          s.x = s.tx;
          s.y = s.ty;
        }
      }
      let sx = 0;
      let sy = 0;
      const idle = !reduced.matches && !moving && now - lastInput > IDLE_AFTER;
      if (idle) {
        const t = now / 1000;
        const a = Math.min(1, (now - lastInput - IDLE_AFTER) / SWAY_RAMP);
        const ramp = a * a * (3 - 2 * a);
        sx = Math.sin((t * Math.PI * 2) / 7) * 4 * ramp;
        sy = Math.sin((t * Math.PI * 2) / 7 + 1.2) * 1.5 * ramp;
      }
      apply(id, s.x + sx, s.y + sy);
      if (moving) raf = requestAnimationFrame(frame);
      else if (!reduced.matches) timer = window.setTimeout(() => (raf = requestAnimationFrame(frame)), 66); // idle sway: about 15 redraws a second
    };

    const kick = () => {
      if (!running()) return;
      window.clearTimeout(timer);
      if (!raf) {
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
    const target = (clientX: number, clientY: number, xOnly: boolean) => {
      const q = toScene(clientX, clientY);
      if (!q) return;
      pos[q.id].tx = q.x;
      if (!xOnly) pos[q.id].ty = q.y;
      clamp(q.id);
      lastInput = performance.now();
      kick();
    };

    // Mouse and pen: the light follows the pointer. Touch: the lantern moves only after a mostly horizontal
    // movement of DRAG_START px, so a vertical scroll that starts on the scene leaves it alone.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return target(e.clientX, e.clientY, false);
      if (!touch || touch.id !== e.pointerId) return;
      if (!touch.dragging) {
        const dx = e.clientX - touch.x;
        const dy = e.clientY - touch.y;
        if (Math.abs(dy) >= DRAG_START && Math.abs(dy) > Math.abs(dx)) touch = null;
        else if (Math.abs(dx) >= DRAG_START && Math.abs(dx) > Math.abs(dy)) touch.dragging = true;
        else return;
      }
      target(e.clientX, e.clientY, true);
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') touch = { id: e.pointerId, x: e.clientX, y: e.clientY, dragging: false };
      else target(e.clientX, e.clientY, false);
    };
    const onUp = (e: PointerEvent) => {
      if (touch?.id === e.pointerId) touch = null;
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
    const onChange = () => {
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
    wide.addEventListener('change', onChange);
    reduced.addEventListener('change', onChange);
    kick();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      io.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      wide.removeEventListener('change', onChange);
      reduced.removeEventListener('change', onChange);
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
        <SceneMarkup scene={scenes.wide} className={`${styles.svg} ${styles.wide}`} />
        <SceneMarkup scene={scenes.narrow} className={`${styles.svg} ${styles.narrow}`} />
        <span ref={status} className="visually-hidden" role="status" aria-live="polite" />
      </div>
      <figcaption id="scene-caption" className={styles.caption}>
        Move the lantern with the pointer, a sideways drag or the arrow keys.{' '}
        <Link href="/work/visibility-engine/">How the light is computed</Link>
      </figcaption>
    </figure>
  );
}
