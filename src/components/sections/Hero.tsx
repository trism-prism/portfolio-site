'use client';

import { latest, personal } from '@/data/personal';
import { emit, goTo } from '@/lib/nav';
import { Icon } from '@/components/ui/Icon';
import { PrismMark } from '@/components/ui/Prism';
import { ProximityText } from '@/components/ui/ProximityText';

export function Hero() {
  const h = personal.headline;
  return (
    <section id="hero" className="relative z-[2] flex min-h-[100svh] flex-col items-center justify-center px-4 pb-24 pt-28 text-center" aria-labelledby="hero-title">
      <div className="hero-in" style={{ animationDelay: '.05s' }}>
        <PrismMark size={64} animated title="Prism mark" />
      </div>
      <p className="hero-in mt-6 inline-flex items-center gap-2 rounded-full border border-line-2 bg-panel/70 px-3.5 py-1.5 text-[13px] text-fg-2" style={{ animationDelay: '.12s' }}>
        <span className="relative inline-flex h-2 w-2">
          <span className="absolute inset-0 rounded-full bg-green" style={{ animation: 'ping 2s ease-out infinite' }} />
          <span className="relative h-2 w-2 rounded-full bg-green" />
        </span>
        {personal.status}
      </p>
      <h1 id="hero-title" className="display mt-10 text-[44px] leading-[1.02] text-fg sm:text-[64px] lg:text-[76px]" data-annotate="headline">
        <span className="hero-in block" style={{ animationDelay: '.2s' }}>
          Hi, I&apos;m{' '}
          <span className="relative inline-block font-sig text-[1.08em] font-normal tracking-normal" style={{ background: 'linear-gradient(90deg, var(--accent-soft), var(--violet))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingInline: '.08em' }}>
            Tristan Morton
          </span>
          <span className="text-accent">.</span>
        </span>
        <span className="hero-in mt-1 block text-[0.62em] text-fg-2" style={{ animationDelay: '.3s' }}>
          <ProximityText text={h.lead} /> <span className="serif-accent text-[1.12em]">{h.accent}</span>
          {h.tail}
        </span>
      </h1>
      <p className="hero-in mx-auto mt-7 max-w-[620px] text-[17px] leading-relaxed text-fg-2 md:text-[18.5px]" style={{ animationDelay: '.4s' }}>
        {personal.intro}
      </p>
      <p className="hero-in mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[14px]" style={{ animationDelay: '.46s' }}>
        <span className="label">Latest</span>
        {latest.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="link-u text-fg-2 hover:text-fg">
            {l.label}
          </a>
        ))}
      </p>
      <div className="hero-in mt-9 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '.54s' }}>
        <a
          href="#projects"
          onClick={(e) => {
            e.preventDefault();
            goTo('projects');
          }}
          className="btn btn-primary px-7"
        >
          See projects <Icon name="arrowDownRight" size={16} />
        </a>
        <button type="button" className="btn" onClick={() => emit({ type: 'cv', doc: 'cv' })}>
          <Icon name="file" size={16} /> Read CV
        </button>
        <a href={personal.links.resume} download className="btn btn-ghost">
          <Icon name="download" size={16} /> Résumé PDF
        </a>
      </div>
      <div className="hero-in mt-7 flex gap-3" style={{ animationDelay: '.62s' }}>
        <a className="icon-btn" href={personal.links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)">
          <Icon name="linkedin" />
        </a>
        <a className="icon-btn" href={personal.links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub (opens in a new tab)">
          <Icon name="github" />
        </a>
        <a className="icon-btn" href={`mailto:${personal.email}`} aria-label={`Email ${personal.email}`}>
          <Icon name="mail" />
        </a>
      </div>
      <a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          goTo('about');
        }}
        className="label absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1 hover:text-fg"
      >
        Scroll
        <span className="scroll-cue">
          <Icon name="chevronDown" size={16} />
        </span>
      </a>
      <style>{`
        .hero-in { animation: hero-in .9s cubic-bezier(.16,1,.3,1) both; }
        @keyframes hero-in { from { opacity: 0; transform: translateY(16px); filter: blur(4px); } }
        .scroll-cue { animation: cue 1.8s ease-in-out infinite; }
        @keyframes cue { 50% { transform: translateY(5px); } }
        [data-motion='reduced'] .hero-in, [data-motion='reduced'] .scroll-cue { animation: none; }
      `}</style>
    </section>
  );
}
