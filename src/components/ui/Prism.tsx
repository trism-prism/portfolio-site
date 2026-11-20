// The prism character: a rounded triangular prism with a face, named after the trism-prism handle.
// Drawn in SVG so every pose is geometry, not a sprite sheet.

export type PrismPose = 'idle' | 'wink' | 'crouch' | 'jump' | 'land' | 'wave' | 'sit' | 'sleep' | 'cheer';

const BODY = 'M24 6.5 C25.4 6.5 26.2 7.3 27 8.6 L41.6 35 C42.8 37.3 41.6 39.6 39 39.6 L9 39.6 C6.4 39.6 5.2 37.3 6.4 35 L21 8.6 C21.8 7.3 22.6 6.5 24 6.5Z';

export function PrismMark({ size = 40, animated = false, title }: { size?: number; animated?: boolean; title?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={animated ? 'mark' : undefined}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <PrismBody />
      <g className={animated ? 'mark-eyes' : undefined}>
        <ellipse cx="19" cy="28" rx="2.3" ry="3" fill="var(--sc-ink)" />
        <ellipse className="eye-r" cx="29" cy="28" rx="2.3" ry="3" fill="var(--sc-ink)" />
      </g>
      {animated && <path className="wink" d="M26.6 28.4 Q29 26.2 31.4 28.4" stroke="var(--sc-ink)" strokeWidth="1.8" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

function PrismBody() {
  return (
    <>
      <path d={BODY} fill="var(--accent)" />
      <path d="M24 6.5 C22.6 6.5 21.8 7.3 21 8.6 L6.4 35 C5.2 37.3 6.4 39.6 9 39.6 L20 39.6 Z" fill="var(--accent-pale)" opacity=".55" />
      <path d="M41 30 L47 28.5 M41.6 32.6 L47.5 33 M40.6 35.4 L46 37.4" strokeWidth="1.8" strokeLinecap="round" stroke="var(--violet)" />
      <path d="M41 30 L47 28.5" strokeWidth="1.8" strokeLinecap="round" stroke="var(--accent-soft)" />
      <path d="M40.6 35.4 L46 37.4" strokeWidth="1.8" strokeLinecap="round" stroke="var(--amber)" />
    </>
  );
}

/** Full character with limbs, for the roaming mascot and footer scenes. viewBox 0 0 48 64. */
export function PrismCharacter({ pose = 'idle', size = 46, flip = false }: { pose?: PrismPose; size?: number; flip?: boolean }) {
  const sitting = pose === 'sit' || pose === 'sleep';
  const squash =
    pose === 'crouch' ? 'translate(24 46) scale(1.12 .86) translate(-24 -46)' :
    pose === 'land' ? 'translate(24 46) scale(1.14 .84) translate(-24 -46)' :
    pose === 'jump' ? 'translate(24 46) scale(.92 1.1) translate(-24 -46)' : undefined;
  const eyesClosed = pose === 'sleep';
  const wink = pose === 'wink';
  return (
    <svg width={size} height={(size * 64) / 48} viewBox="0 0 48 64" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      {/* legs */}
      <g stroke="var(--fg-2)" strokeWidth="2.6" strokeLinecap="round" fill="none">
        {sitting ? (
          <>
            <path d="M18 46 L16 52 L10 54" />
            <path d="M30 46 L32 52 L38 54" />
          </>
        ) : pose === 'jump' ? (
          <>
            <path d="M19 46 L15 54" />
            <path d="M29 46 L33 54" />
          </>
        ) : (
          <>
            <path d={pose === 'crouch' || pose === 'land' ? 'M19 46 L15 52 L18 58' : 'M19 46 L18 58'} />
            <path d={pose === 'crouch' || pose === 'land' ? 'M29 46 L33 52 L30 58' : 'M29 46 L30 58'} />
          </>
        )}
      </g>
      <g transform={squash}>
        <g transform="translate(0 7)">
          <PrismBody />
          {eyesClosed ? (
            <g stroke="var(--sc-ink)" strokeWidth="1.8" strokeLinecap="round" fill="none">
              <path d="M16.6 28.6 Q19 30.4 21.4 28.6" />
              <path d="M26.6 28.6 Q29 30.4 31.4 28.6" />
            </g>
          ) : (
            <>
              <ellipse cx="19" cy="28" rx="2.3" ry="3" fill="var(--sc-ink)" />
              {wink ? (
                <path d="M26.6 28.4 Q29 26.2 31.4 28.4" stroke="var(--sc-ink)" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              ) : (
                <ellipse cx="29" cy="28" rx="2.3" ry="3" fill="var(--sc-ink)" />
              )}
            </>
          )}
          {(pose === 'cheer' || pose === 'wave') && <path d="M21 33 Q24 35.5 27 33" stroke="var(--sc-ink)" strokeWidth="1.6" fill="none" strokeLinecap="round" />}
        </g>
        {/* arms */}
        <g stroke="var(--fg-2)" strokeWidth="2.4" strokeLinecap="round" fill="none">
          {pose === 'cheer' ? (
            <>
              <path d="M12 34 L6 24" />
              <path d="M36 34 L42 24" />
            </>
          ) : pose === 'wave' ? (
            <>
              <path d="M12 36 L7 42" />
              <path d="M36 34 L42 24" className="wave-arm" />
            </>
          ) : sitting ? (
            <>
              <path d="M12 37 L8 44" />
              <path d="M36 37 L40 44" />
            </>
          ) : (
            <>
              <path d="M12 36 L7 43" />
              <path d="M36 36 L41 43" />
            </>
          )}
        </g>
      </g>
    </svg>
  );
}
