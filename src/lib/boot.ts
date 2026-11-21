// Inline <head> scripts. Kept out of 'use client' modules so the server can read the strings.
export const MOTION_KEY = 'tm-motion';
export const THEME_KEY = 'tm-theme';

/** Sets data-motion before first paint: stored override, else the OS reduced-motion setting. */
export const motionBootScript = `try{var m=localStorage.getItem('${MOTION_KEY}');if(m!=='full'&&m!=='reduced'){m=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full'}document.documentElement.dataset.motion=m}catch(e){document.documentElement.dataset.motion='full'}`;

/** Applies a stored light/dark choice before first paint. Dark is the default. */
export const themeBootScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

/**
 * Sets data-intro='on' before first paint when the first-visit intro will play, so the CSS cover (html[data-intro='on']::after
 * in globals.css) hides the page until <Intro> mounts. Same conditions as Intro.tsx: the session flag is not set, motion is not
 * reduced, there is no #hash or ?project=, and no webdriver, unless ?intro forces it (?intro=<seconds> at 4.2 or more is the
 * finished site: no intro). Runs after the motion script, which sets data-motion. Failsafe: if Intro has not mounted after 6 s
 * the attribute is removed, which also releases the hero's hold.
 */
export const introBootScript = `try{var d=document.documentElement,q=location.search,f=/[?&]intro(=|&|$)/.test(q),n=parseFloat((q.match(/[?&]intro=([^&]*)/)||[])[1]);if(d.dataset.motion!=='reduced'&&!location.hash&&q.indexOf('project=')<0&&!(n>=4.2)&&(f||(sessionStorage.getItem('tm-intro')!=='1'&&!navigator.webdriver))){d.dataset.intro='on';setTimeout(function(){if(d.dataset.intro==='on'&&!document.querySelector('.intro-overlay'))delete d.dataset.intro},6000)}}catch(e){}`;
