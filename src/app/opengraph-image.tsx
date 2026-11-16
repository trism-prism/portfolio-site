import { ImageResponse } from 'next/og';
import { wideScene } from '../scene/geometry';
import { sceneSvg } from '../scene/svgString';
import { site } from '../site';

export const dynamic = 'force-static';
export const alt = `${site.name}: software engineering student`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  // The wide scene fills the top of the card; the name is real text rendered by the generator.
  const svg = sceneSvg(wideScene, 1200, 372);
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#1c1626', color: '#e6dccb' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by the image generator, not the page */}
        <img src={src} width={1200} height={372} alt="" />
        <div style={{ display: 'flex', flexDirection: 'column', padding: '28px 64px 0', gap: 8 }}>
          <div style={{ fontSize: 84, lineHeight: 1.05, display: 'flex' }}>{site.name}</div>
          <div style={{ fontSize: 32, color: '#b5abc2', display: 'flex' }}>Software engineering student</div>
        </div>
      </div>
    ),
    size,
  );
}
