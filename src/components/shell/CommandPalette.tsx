'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { sections } from '@/data/sections';
import { projects } from '@/data/projects';
import { personal } from '@/data/personal';
import { isPh } from '@/data/ph';
import { emit, goTo, onUi } from '@/lib/nav';
import { useMotion } from '@/lib/motion';
import { Icon } from '@/components/ui/Icon';
import { anyOverlayOpen } from '@/components/ui/Modal';

type Cmd = { id: string; group: string; label: string; hint?: string; icon: string; run: () => void | 'keep' };

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// The shell prompt is styling only: every command dispatches a page action. Nothing is executed.
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const { mode, toggle } = useMotion();

  const close = useCallback(() => {
    setOpen(false);
    setQ('');
    setNote(null);
    restore.current?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (!open && anyOverlayOpen()) return;
        e.preventDefault();
        if (open) close();
        else {
          restore.current = document.activeElement as HTMLElement;
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    const off = onUi((e) => {
      if (e.type === 'palette') {
        restore.current = document.activeElement as HTMLElement;
        setOpen(true);
      }
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      off();
    };
  }, [open, close]);

  const cmds: Cmd[] = useMemo(() => {
    const nav: Cmd[] = [
      { id: 'home', group: 'Navigate', label: 'cd ~', hint: 'Home', icon: 'arrowUp', run: () => goTo('hero') },
      ...sections.map((s) => ({ id: `nav-${s.id}`, group: 'Navigate', label: `cd ${s.id}`, hint: s.nav, icon: 'arrowRight', run: () => goTo(s.id) })),
    ];
    const proj: Cmd[] = projects.map((p) => ({
      id: `p-${p.slug}`,
      group: 'Projects',
      label: `open ${p.slug}`,
      hint: p.title,
      icon: 'code',
      run: () => emit({ type: 'project', slug: p.slug }),
    }));
    const actions: Cmd[] = [
      {
        id: 'email',
        group: 'Actions',
        label: 'copy email',
        hint: personal.email,
        icon: 'copy',
        run: () => {
          copy(personal.email).then((ok) => setNote(ok ? 'Copied ' + personal.email : 'Copy failed; the address is ' + personal.email));
          return 'keep';
        },
      },
      { id: 'cv', group: 'Actions', label: 'cat cv', hint: 'Read the CV in the page', icon: 'file', run: () => emit({ type: 'cv', doc: 'cv' }) },
      { id: 'resume', group: 'Actions', label: 'cat resume', hint: 'One-page résumé', icon: 'file', run: () => emit({ type: 'cv', doc: 'resume' }) },
      { id: 'dl', group: 'Actions', label: 'wget resume.pdf', hint: 'Download the PDF', icon: 'download', run: () => window.open(personal.links.resume, '_blank', 'noopener') },
      ...(isPh(personal.links.schedule)
        ? []
        : [{ id: 'cal', group: 'Actions', label: 'schedule call', hint: 'Book time', icon: 'calendar', run: () => window.open(personal.links.schedule, '_blank', 'noopener') }]),
      { id: 'motion', group: 'Settings', label: `motion ${mode === 'full' ? '--reduced' : '--full'}`, hint: `Currently ${mode}`, icon: 'motion', run: toggle },
      { id: 'theme', group: 'Settings', label: 'theme --toggle', hint: 'Light / dark', icon: 'sun', run: () => emit({ type: 'theme' }) },
      { id: 'annot', group: 'Settings', label: 'man site', hint: "How it's built", icon: 'info', run: () => emit({ type: 'annotations' }) },
      { id: 'gh', group: 'Links', label: 'open github', hint: personal.links.githubUser, icon: 'github', run: () => window.open(personal.links.github, '_blank', 'noopener') },
      { id: 'li', group: 'Links', label: 'open linkedin', hint: personal.links.linkedinHandle, icon: 'linkedin', run: () => window.open(personal.links.linkedin, '_blank', 'noopener') },
      { id: 'llms', group: 'Machine-readable', label: 'cat llms.txt', hint: 'Plain-text summary', icon: 'file', run: () => window.open('/llms.txt', '_blank', 'noopener') },
      { id: 'rss', group: 'Machine-readable', label: 'tail rss.xml', hint: 'Activity feed', icon: 'rss', run: () => window.open('/rss.xml', '_blank', 'noopener') },
      { id: 'json', group: 'Machine-readable', label: 'cat data/projects.json', hint: 'Project data', icon: 'code', run: () => window.open('/data/projects.json', '_blank', 'noopener') },
      { id: 'vcf', group: 'Machine-readable', label: 'save contact.vcf', hint: 'vCard', icon: 'userPlus', run: () => window.open(personal.links.vcard, '_blank', 'noopener') },
    ];
    return [...nav, ...actions, ...proj];
  }, [mode, toggle]);

  const filtered = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return cmds;
    return cmds.filter((c) => terms.every((t) => `${c.label} ${c.hint ?? ''} ${c.group}`.toLowerCase().includes(t)));
  }, [cmds, q]);

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => input.current?.focus(), 10);
      document.documentElement.style.overflow = 'hidden';
      return () => {
        clearTimeout(t);
        document.documentElement.style.overflow = '';
      };
    }
  }, [open]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  if (!open) return null;

  const runAt = (i: number) => {
    const c = filtered[i];
    if (!c) return;
    const r = c.run();
    if (r !== 'keep') {
      setOpen(false);
      setQ('');
      setNote(null);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => (s + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => (s - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runAt(sel);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  let lastGroup = '';
  return createPortal(
    <div className="fixed inset-0 z-[75] flex items-start justify-center px-3 pt-[12vh]">
      <div className="backdrop anim-fade" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="panel anim-pop relative z-[76] w-full max-w-[620px] overflow-hidden shadow-2xl"
        style={{ background: 'var(--panel)' }}
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <span className="mono shrink-0 text-[13px] text-accent">~/{personal.handle} $</span>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={filtered[sel] ? `cmd-${filtered[sel].id}` : undefined}
            aria-label="Type a command or search"
            placeholder="type a command…"
            className="mono h-14 min-w-0 flex-1 bg-transparent text-[14px] text-fg outline-none placeholder:text-muted"
          />
          <kbd className="mono rounded border border-line-2 px-1.5 text-[11px] text-muted">esc</kbd>
        </div>
        <ul id="palette-list" ref={listRef} role="listbox" className="max-h-[52vh] overflow-y-auto p-2" data-lenis-prevent>
          {filtered.length === 0 && <li className="mono px-3 py-6 text-center text-sm text-muted">command not found: {q}</li>}
          {filtered.map((c, i) => {
            const header = c.group !== lastGroup ? c.group : null;
            lastGroup = c.group;
            return (
              <li key={c.id} role="presentation">
                {header && <div className="label px-3 pb-1 pt-3 !text-[10px]">{header}</div>}
                <div
                  id={`cmd-${c.id}`}
                  data-i={i}
                  role="option"
                  aria-selected={i === sel}
                  onMouseMove={() => setSel(i)}
                  onClick={() => runAt(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${i === sel ? 'bg-panel-2 text-fg' : 'text-fg-2'}`}
                >
                  <Icon name={c.icon} size={16} className={i === sel ? 'text-accent' : ''} />
                  <span className="mono text-[13.5px]">{c.label}</span>
                  {c.hint && <span className="ml-auto truncate text-[12.5px] text-muted">{c.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mono flex items-center gap-4 border-t border-line px-4 py-2 text-[11px] text-muted" aria-live="polite">
          {note ?? (
            <>
              <span>↑↓ move</span>
              <span>↵ run</span>
              <span className="ml-auto">{filtered.length} commands</span>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
