import { ImageResponse } from 'next/og';

export const alt = 'NewsWave — Regional & National News';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #091a3a 0%, #152549 60%, #2c4880 100%)',
          fontFamily: 'system-ui, sans-serif',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            <span style={{ color: '#ffffff' }}>News</span>
            <span style={{ color: '#dc2640' }}>Wave</span>
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(220, 38, 64, 0.18)',
              color: '#fbc8cc',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: 'uppercase',
            }}
          >
            Live Newsroom
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Regional and national news, in the language you read.
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#aebed8',
              fontWeight: 500,
              maxWidth: 900,
            }}
          >
            English, Hindi, Punjabi. Fast, mobile-first, mobile-now.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            color: '#7e93bd',
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          <span>Politics · Business · Sports · Health · Entertainment</span>
          <span style={{ color: '#dc2640', fontWeight: 800 }}>newswave</span>
        </div>
      </div>
    ),
    size,
  );
}
