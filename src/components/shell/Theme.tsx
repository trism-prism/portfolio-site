'use client';

import { useEffect } from 'react';
import { emit, onUi } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { THEME_KEY } from '@/lib/boot';


export function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
  return next;
}

/** Listens for the palette's theme command. Dark is the default. */
export function ThemeController() {
  useEffect(
    () =>
      onUi((e) => {
        if (e.type === 'theme') {
          const n = toggleTheme();
          emit({ type: 'toast', text: `Theme: ${n}` });
        }
      }),
    [],
  );
  return null;
}

export function ThemeButton() {
  return (
    <button type="button" className="icon-btn" aria-label="Toggle light and dark theme" onClick={() => emit({ type: 'theme' })}>
      <Icon name="sun" />
    </button>
  );
}
