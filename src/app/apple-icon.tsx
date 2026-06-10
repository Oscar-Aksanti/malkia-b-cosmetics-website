import { ImageResponse } from 'next/og';

export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Apple touch icon (180×180) — same design as favicon */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #1a1408 0%, #0D0D0D 60%, #110d00 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gold outer ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '5px solid #C9A84C',
            display: 'flex',
          }}
        />

        {/* Crown + letters */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -4,
          }}
        >
          {/* Crown */}
          <svg width="74" height="34" viewBox="0 0 210 100" style={{ display: 'block', marginBottom: -2 }}>
            <path d="M10 95 L10 60 L52 10 L78 45 L105 2 L132 45 L158 10 L200 60 L200 95 Z" fill="#C9A84C" />
            <rect x="10" y="82" width="190" height="18" rx="6" fill="#b8973d" />
            <circle cx="52"  cy="10" r="9"  fill="#C9A84C" />
            <circle cx="105" cy="2"  r="11" fill="#E91E8C" />
            <circle cx="158" cy="10" r="9"  fill="#C9A84C" />
          </svg>

          {/* M B */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 80,
                fontWeight: 700,
                color: '#E91E8C',
                lineHeight: 0.85,
              }}
            >
              M
            </span>
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 38,
                fontWeight: 700,
                color: '#C9A84C',
                lineHeight: 1,
                paddingBottom: 6,
              }}
            >
              B
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
