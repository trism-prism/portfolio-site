'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { footerScenes, FW, FH } from './Scenes';
import { personal } from '@/data/personal';
import { hasPlaceholders } from '@/data/audit';
import { useIdle, useMedia, useNear } from '@/lib/hooks';
import { useMotion } from '@/lib/motion';
import { useSceneTime } from '@/lib/clock';
import { emit, onUi } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { Stage } from '@/components/scenes/Stage';
import { ThemeButton } from '@/components/shell/Theme';
import { MothMark } from '@/components/ui/Moth';

const SCENE_KEY = 'tm-footer-scene';
const YEAR = new Date().getFullYear();
const now = () => performance.now();

export function Footer() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(0);
  const [swap, setSwap] = useState(false);
  const { reduced } = useMotion();
  const [ref, near] = useNear<HTMLDivElement>('100% 0px');
  const idle = useIdle(30000);
  const t = useSceneTime(near && !reduced && !paused);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SCENE_KEY);
      const i = footerScenes.findIndex((s) => s.id === saved);
      if (i >= 0) setIdx(i);
    } catch {}
  }, []);

  const go = useCallback((i: number) => {
    const n = (i + footerScenes.length) % footerScenes.length;
    setSwap(true);
    window.setTimeout(() => {
      setIdx(n);
      setSwap(false);
    }, 210);
    try {
      localStorage.setItem(SCENE_KEY, footerScenes[n].id);
    } catch {}
  }, []);

  const scene = footerScenes[idx];
  const S = scene.Scene;

  return (
    <footer className="relative z-[2] overflow-hidden border-t border-line pt-14" aria-label="Site footer" data-annotate="footer">
      <div className="wrap">
        <div
          ref={ref}
          className="relative mx-auto max-w-[900px]"
          onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
          onTouchEnd={(e) => {
            if (!touch.current) return;
            const dx = e.changedTouches[0].clientX - touch.current.x;
            const dy = e.changedTouches[0].clientY - touch.current.y;
            touch.current = null;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
          }}
        >
          <div
            role="group"
            aria-roledescription="scene"
            aria-label={`${scene.name}: ${scene.label}`}
            className="relative aspect-[3/1] w-full overflow-hidden rounded-2xl border border-line"
            style={{ opacity: swap ? 0 : 1, transform: swap ? 'translateY(10px)' : 'none', transition: 'opacity .21s, transform .36s cubic-bezier(.16,1,.3,1)', background: 'var(--sc-panel)' }}
          >
            {near || reduced ? (
              <Stage w={FW} h={FH}>
                <S t={t} reduced={reduced} hold={hold} idle={idle} />
              </Stage>
            ) : null}
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="icon-btn absolute right-3 top-3 h-8 w-8"
              aria-label={paused ? 'Play scene' : 'Pause scene'}
              aria-pressed={paused}
              hidden={reduced}
            >
              <Icon name={paused ? 'play' : 'pause'} size={14} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="label">{scene.name}</span>
            <button type="button" className="icon-btn h-8 w-8" onClick={() => go(idx - 1)} aria-label="Previous scene">
              <Icon name="chevronLeft" size={15} />
            </button>
            {footerScenes.map((s, i) => (
              <button key={s.id} type="button" onClick={() => go(i)} aria-label={`Scene: ${s.name}`} aria-current={i === idx} className="grid h-6 w-6 place-items-center">
                <span className={`h-2 w-2 rounded-full ${i === idx ? 'bg-accent' : 'bg-line-2'}`} />
              </button>
            ))}
            <button type="button" className="icon-btn h-8 w-8" onClick={() => go(idx + 1)} aria-label="Next scene">
              <Icon name="chevronRight" size={15} />
            </button>
          </div>
        </div>

        <p className="font-sig mt-8 text-center text-[30px] leading-none text-fg">{personal.name}</p>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="display text-[26px] text-fg">
            Say <span className="serif-accent">hello</span>
          </p>
          <EmailControl onHold={setHold} />
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-line py-8 md:flex-row">
          <div className="flex items-center gap-3">
            <MothMark size={28} />
            <p className="text-[13px] text-muted">
              © {YEAR} {personal.name} · Leesburg, VA
            </p>
          </div>
          <nav aria-label="Footer" className="mono flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] text-muted">
            <a href="/llms.txt" className="hover:text-fg">llms.txt</a>
            <a href="/rss.xml" className="hover:text-fg">rss</a>
            <a href="/data/projects.json" className="hover:text-fg">data</a>
            <a href={personal.links.vcard} className="hover:text-fg">vcard</a>
            <a href={personal.links.resume} className="hover:text-fg">résumé</a>
          </nav>
          <div className="flex items-center gap-2">
            <a className="icon-btn h-10 w-10" href={personal.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (new tab)">
              <Icon name="github" size={17} />
            </a>
            <a className="icon-btn h-10 w-10" href={personal.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (new tab)">
              <Icon name="linkedin" size={17} />
            </a>
            <ThemeButton />
          </div>
        </div>
        {hasPlaceholders && (
          <p className="mono pb-8 text-center text-[11px] text-ph" data-placeholder="">
            Private preview: amber dashed items are placeholders. The production build refuses to finish until they are filled or removed.
          </p>
        )}
        <p className="mono pb-24 text-center text-[11px] text-muted md:pb-10">Characters and scenes are original SVG. Try the Konami code.</p>
      </div>
    </footer>
  );
}

/**
 * Desktop: a ring-progress button. Short press (<220 ms) copies at once; holding to 650 ms copies when the
 * ring completes; releasing in between cancels. Enter/Space copy immediately.
 * Phones: a real mailto link with a draggable knob; past 85% it opens mail, otherwise it springs back.
 */
function EmailControl({ onHold }: { onHold: (v: number) => void }) {
  const fine = useMedia('(hover: hover) and (pointer: fine)', true);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [pulse, setPulse] = useState(false);
  const start = useRef(0);
  const raf = useRef(0);
  const done = useRef(false);

  useEffect(
    () =>
      onUi((e) => {
        if (e.type === 'email-pulse') {
          setPulse(true);
          window.setTimeout(() => setPulse(false), 2400);
        }
      }),
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(personal.email);
      setStatus('copied');
      emit({ type: 'toast', text: `Copied ${personal.email}` });
    } catch {
      setStatus('failed');
    }
    window.setTimeout(() => setStatus('idle'), 1800);
  };

  const tick = () => {
    const p = Math.min(1, (now() - start.current) / 650);
    setProgress(p);
    onHold(p);
    if (p >= 1 && !done.current) {
      done.current = true;
      copy();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  };
  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    done.current = false;
    start.current = now();
    raf.current = requestAnimationFrame(tick);
  };
  const up = () => {
    cancelAnimationFrame(raf.current);
    const held = now() - start.current;
    if (!done.current && held < 220) copy();
    done.current = true;
    setProgress(0);
    onHold(0);
  };

  if (!fine) return <SlideToEmail />;

  const C = 2 * Math.PI * 21;
  return (
    <button
      type="button"
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={() => progress > 0 && up()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          copy();
        }
      }}
      className={`group flex items-center gap-3 rounded-full border border-line-2 bg-panel py-2 pl-2 pr-5 text-left ${pulse ? 'pulse-ring' : ''}`}
      aria-label={`Copy email address ${personal.email}`}
    >
      <span className="relative grid h-12 w-12 place-items-center">
        <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="24" cy="24" r="21" fill="none" stroke="var(--line-2)" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="21" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} strokeLinecap="round" />
        </svg>
        <Icon name={status === 'copied' ? 'check' : 'mail'} size={18} className={status === 'copied' ? 'text-green' : 'text-accent'} />
      </span>
      <span>
        <span className={`block text-[16px] font-semibold text-fg ${pulse ? 'underline decoration-accent underline-offset-4' : ''}`}>{personal.email}</span>
        <span className="mono block text-[11px] text-muted" aria-live="polite">
          {status === 'copied' ? 'Copied to clipboard' : status === 'failed' ? 'Copy failed, select the address instead' : 'Click to copy · hold to charge the scene'}
        </span>
      </span>
    </button>
  );
}

function SlideToEmail() {
  const track = useRef<HTMLAnchorElement>(null);
  const [x, setX] = useState(0);
  const [drag, setDrag] = useState(false);
  const [ok, setOk] = useState(false);
  const startX = useRef(0);
  const max = () => (track.current ? track.current.clientWidth - 52 : 200);
  return (
    <a
      ref={track}
      href={`mailto:${personal.email}`}
      className="relative flex h-14 w-full max-w-[340px] items-center overflow-hidden rounded-full border border-line-2 bg-panel"
      aria-label={`Email ${personal.email}`}
      onClick={(e) => drag && e.preventDefault()}
    >
      <span className="w-full text-center text-[14px] font-medium text-fg-2" style={{ opacity: 1 - x / Math.max(1, max()) }}>
        {ok ? 'Opening mail…' : `Slide to email · ${personal.email}`}
      </span>
      <span
        className="absolute left-1 top-1 grid h-12 w-12 touch-none place-items-center rounded-full bg-accent-strong text-[#031b19]"
        style={{ transform: `translateX(${x}px)`, transition: drag ? 'none' : 'transform .45s cubic-bezier(.34,1.56,.64,1)' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          startX.current = e.clientX - x;
          setDrag(true);
        }}
        onPointerMove={(e) => drag && setX(Math.min(max(), Math.max(0, e.clientX - startX.current)))}
        onPointerUp={() => {
          if (x > max() * 0.85) {
            setOk(true);
            window.location.href = `mailto:${personal.email}`;
            window.setTimeout(() => {
              setOk(false);
              setX(0);
            }, 1400);
          } else setX(0);
          window.setTimeout(() => setDrag(false), 0);
        }}
        aria-hidden="true"
      >
        <Icon name={ok ? 'check' : 'arrowRight'} size={18} />
      </span>
    </a>
  );
}
