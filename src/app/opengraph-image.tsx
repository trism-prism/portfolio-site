import { ImageResponse } from 'next/og';
import { personal } from '@/data/personal';

export const dynamic = 'force-static';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${personal.name}: software engineer`;

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 96, background: '#0a1113', color: '#eef5f4' }}>
        <svg width="96" height="96" viewBox="0 0 48 48">
          <path d="M24 6.5c1.4 0 2.2.8 3 2.1L41.6 35c1.2 2.3 0 4.6-2.6 4.6H9c-2.6 0-3.8-2.3-2.6-4.6L21 8.6c.8-1.3 1.6-2.1 3-2.1z" fill="#2dd4bf" />
          <ellipse cx="19" cy="28" rx="2.3" ry="3" fill="#0a1113" />
          <ellipse cx="29" cy="28" rx="2.3" ry="3" fill="#0a1113" />
        </svg>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3, marginTop: 32 }}>{personal.name}</div>
        <div style={{ fontSize: 40, marginTop: 16, color: '#5eead4' }}>I build software you can inspect.</div>
        <div style={{ fontSize: 26, marginTop: 28, color: '#a6b6b6' }}>Full stack · AI engineering · Systems</div>
      </div>
    ),
    size,
  );
}
