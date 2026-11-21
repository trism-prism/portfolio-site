'use client';

import { useEffect, useSyncExternalStore } from 'react';
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
          emit({ type: 'toast', text: `Theme: ${n === 'light' ? 'twilight' : 'dark'}` });
        }
      }),
    [],
  );
  return null;
}

function subscribeTheme(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => mo.disconnect();
}
const currentTheme = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

export function ThemeButton() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => 'dark');
  return (
    <button
      type="button"
      className="icon-btn"
      aria-label={theme === 'light' ? 'Switch to the night sky' : 'Switch to the twilight sky'}
      onClick={() => emit({ type: 'theme' })}
    >
      <Icon name="sun" />
    </button>
  );
}
