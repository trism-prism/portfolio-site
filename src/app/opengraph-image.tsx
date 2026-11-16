import { ImageResponse } from 'next/og';
import { site } from '../site';

export const dynamic = 'force-static';
export const alt = `${site.name}: software engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 96px', background: '#0f172a', color: '#f8fafc' }}>
        <div style={{ display: 'flex', fontSize: 32, color: '#94a3b8' }}>Hello, I&apos;m</div>
        <div style={{ display: 'flex', fontSize: 120, fontWeight: 700, color: '#10b981', lineHeight: 1.1 }}>{site.name}</div>
        <div style={{ display: 'flex', width: 96, height: 6, background: '#10b981', margin: '28px 0' }} />
        <div style={{ display: 'flex', fontSize: 40, color: '#f8fafc' }}>Software Engineer</div>
      </div>
    ),
    size,
  );
}
