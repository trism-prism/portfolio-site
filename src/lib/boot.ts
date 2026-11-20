// Inline <head> scripts. Kept out of 'use client' modules so the server can read the strings.
export const MOTION_KEY = 'tm-motion';
export const THEME_KEY = 'tm-theme';

/** Sets data-motion before first paint: stored override, else the OS reduced-motion setting. */
export const motionBootScript = `try{var m=localStorage.getItem('${MOTION_KEY}');if(m!=='full'&&m!=='reduced'){m=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'}document.documentElement.dataset.motion=m}catch(e){document.documentElement.dataset.motion='full'}`;

/** Applies a stored light/dark choice before first paint. Dark is the default. */
export const themeBootScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
