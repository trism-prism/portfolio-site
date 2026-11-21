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
        <svg width="96" height="96" viewBox="0 0 32 32">
          <path d="M15 17 C10 19 7 24 9 27.5 C12 29.5 15 25 15.5 20Z" fill="#272650" stroke="#cfc9f5" strokeWidth=".7" />
          <path d="M15.5 13 C11.5 7 5 3.5 2.6 6.6 C1.2 10.6 6 16.6 15.5 17.6Z" fill="#272650" stroke="#cfc9f5" strokeWidth=".7" />
          <circle cx="8" cy="9.6" r="1.4" fill="#f5c45e" />
          <path d="M17 17 C22 19 25 24 23 27.5 C20 29.5 17 25 16.5 20Z" fill="#272650" stroke="#cfc9f5" strokeWidth=".7" />
          <path d="M16.5 13 C20.5 7 27 3.5 29.4 6.6 C30.8 10.6 26 16.6 16.5 17.6Z" fill="#272650" stroke="#cfc9f5" strokeWidth=".7" />
          <circle cx="24" cy="9.6" r="1.4" fill="#60a5fa" />
          <ellipse cx="16" cy="19" rx="2.2" ry="6.5" fill="#e9e4f5" />
          <circle cx="16" cy="11" r="3" fill="#f3f0fb" />
          <circle cx="14.9" cy="11.2" r=".9" fill="#16152c" />
          <circle cx="17.1" cy="11.2" r=".9" fill="#16152c" />
        </svg>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -3, marginTop: 32 }}>{personal.name}</div>
        <div style={{ fontSize: 40, marginTop: 16, color: '#5eead4' }}>I build software you can inspect.</div>
        <div style={{ fontSize: 26, marginTop: 28, color: '#a6b6b6' }}>Full stack · AI engineering · Systems</div>
      </div>
    ),
    size,
  );
}
