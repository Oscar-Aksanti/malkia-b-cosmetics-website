import { ImageResponse } from 'next/og';

export const size        = { width: 512, height: 512 };
export const contentType = 'image/png';

/**
 * Favicon — Malkia B Cosmetics
 * Round dark badge with gold crown, fuchsia "M", gold "B"
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
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
            border: '14px solid #C9A84C',
            display: 'flex',
          }}
        />

        {/* Inner subtle ring */}
        <div
          style={{
            position: 'absolute',
            inset: 20,
            borderRadius: '50%',
            border: '2px solid rgba(201,168,76,0.25)',
            display: 'flex',
          }}
        />

        {/* Crown + letters container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
            marginTop: -10,
          }}
        >
          {/* Crown SVG */}
          <svg
            width="210"
            height="100"
            viewBox="0 0 210 100"
            style={{ display: 'block', marginBottom: -4 }}
          >
            {/* Crown shape */}
            <path
              d="M10 95 L10 60 L52 10 L78 45 L105 2 L132 45 L158 10 L200 60 L200 95 Z"
              fill="#C9A84C"
            />
            {/* Crown base band */}
            <rect x="10" y="82" width="190" height="18" rx="6" fill="#b8973d" />
            {/* Crown jewel dots */}
            <circle cx="52"  cy="10" r="9" fill="#C9A84C" />
            <circle cx="105" cy="2"  r="11" fill="#E91E8C" />
            <circle cx="158" cy="10" r="9" fill="#C9A84C" />
            {/* Gem shine */}
            <circle cx="105" cy="2"  r="5"  fill="#ff79c6" opacity="0.6" />
          </svg>

          {/* Letters: M + B */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              lineHeight: 1,
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 230,
                fontWeight: 700,
                color: '#E91E8C',
                lineHeight: 0.85,
                letterSpacing: '-4px',
                textShadow: '0 4px 24px rgba(233,30,140,0.4)',
              }}
            >
              M
            </span>
            <span
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: 110,
                fontWeight: 700,
                color: '#C9A84C',
                lineHeight: 1,
                paddingBottom: 18,
                letterSpacing: '-2px',
              }}
            >
              B
            </span>
          </div>
        </div>

        {/* Bottom subtle glow */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '20%',
            right: '20%',
            height: 80,
            background: 'radial-gradient(ellipse, rgba(201,168,76,0.15) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
      </div>
    ),
    { ...size },
  );
}
