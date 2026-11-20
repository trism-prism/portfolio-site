// Central motion policy. The default follows the operating system's reduced-motion setting.
// A visitor may override it; the override is stored per browser and is a convenience only.
// The resolved value is written to <html data-motion="reduce|full">, and CSS keys off that.

export type MotionPreference = 'system' | 'reduce' | 'full';
export type ResolvedMotion = 'reduce' | 'full';

export const MOTION_STORAGE_KEY = 'motion-preference';
export const MOTION_OPTIONS: { value: MotionPreference; label: string }[] = [
  { value: 'system', label: 'Match system' },
  { value: 'reduce', label: 'Reduce' },
  { value: 'full', label: 'Allow' },
];

export function parsePreference(value: unknown): MotionPreference {
  return value === 'reduce' || value === 'full' ? value : 'system';
}

export function resolveMotion(pref: MotionPreference, systemPrefersReduced: boolean): ResolvedMotion {
  if (pref === 'system') return systemPrefersReduced ? 'reduce' : 'full';
  return pref;
}

/**
 * Inline script run before first paint so the attribute is right before any CSS transition can
 * start. Kept dependency-free and wrapped in try/catch: storage may be unavailable.
 */
export const motionBootScript = `(function(){try{var p=null;try{p=localStorage.getItem('${MOTION_STORAGE_KEY}')}catch(e){}var r=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;var m=p==='reduce'||p==='full'?p:(r?'reduce':'full');document.documentElement.setAttribute('data-motion',m)}catch(e){}})();`;
