import { ImageResponse } from 'next/og';

import { SITE_NAME } from '@/constants/site-info';

export const runtime = 'edge';

export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

type Props = {
  params: {
    userId: string;
  };
};

export default async function Image({ params }: Props) {
  const input = {
    '0': {
      json: {
        userId: params.userId,
      },
    },
  };
  const jsonStr = JSON.stringify(input);
  const encodedStr = encodeURIComponent(jsonStr);
  const url = `https://iikane-palette-keion-app.vercel.app/api/trpc/myBestSongs.findByUserId?batch=1&input=${encodedStr}`;
  const data = (await fetch(url).then((res) => res.json())) as { name: string }[];

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          color: 'black',
          background: 'white',
          width: '100%',
          height: '100%',
          padding: '50px 200px',
          textAlign: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      >
        👋 {data[0]?.name}
      </div>
    ),
    {
      ...size,
    },
  );
}
