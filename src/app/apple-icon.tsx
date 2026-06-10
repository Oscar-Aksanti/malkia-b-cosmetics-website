import { ImageResponse } from 'next/og';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const size        = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  const logoData   = await readFile(join(process.cwd(), 'public/images/logos/logo-simplified.png'));
  const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFDF8',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '6px solid #C9A84C',
            display: 'flex',
            zIndex: 2,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoBase64}
          alt="Malkia B Cosmetics"
          style={{ width: '82%', height: '82%', objectFit: 'contain', zIndex: 1 }}
        />
      </div>
    ),
    { ...size },
  );
}
