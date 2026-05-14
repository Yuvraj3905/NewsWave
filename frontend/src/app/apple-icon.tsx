import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#091a3a',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#ffffff' }}>N</span>
          <span style={{ color: '#dc2640' }}>W</span>
        </div>
        <div
          style={{
            marginTop: 8,
            color: '#aebed8',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          NewsWave
        </div>
      </div>
    ),
    size,
  );
}
