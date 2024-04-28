import { ImageResponse } from 'next/og';

import { SITE_NAME } from '@/constants/site-info';
import UserOgp from '@/features/user/components/UserOgp';
import { type RouterInputs, type RouterOutputs } from '@/trpc/shared';

export const runtime = 'edge';

export const alt = SITE_NAME;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

/**
 * trpcを直接使うとegde上でのエラーが発生するのでfetchを使う
 */
const fetchMyBestSongs = async (userId: string) => {
  const input: RouterInputs['myBestSongs']['findByUserId'] = {
    userId,
  };
  const jsonStr = JSON.stringify({
    '0': {
      json: input,
    },
  });
  const encodedStr = encodeURIComponent(jsonStr);
  const url = `${process.env.NEXTAUTH_URL}api/trpc/myBestSongs.findByUserId?batch=1&input=${encodedStr}`;
  const data = (await fetch(url).then((res) => res.json())) as [
    {
      result: {
        data: {
          json: RouterOutputs['myBestSongs']['findByUserId'];
        };
      };
    },
  ];
  return data[0].result.data.json;
};

const fetchUserProfile = async (userId: string) => {
  const input: RouterInputs['user']['findById'] = {
    id: userId,
  };
  const jsonStr = JSON.stringify({
    '0': {
      json: input,
    },
  });
  const encodedStr = encodeURIComponent(jsonStr);
  const url = `${process.env.NEXTAUTH_URL}api/trpc/user.findById?batch=1&input=${encodedStr}`;
  const data = (await fetch(url).then((res) => res.json())) as [
    {
      result: {
        data: {
          json: RouterOutputs['user']['findById'];
        };
      };
    },
  ];

  return data[0].result.data.json;
};

type Props = {
  params: {
    userId: string;
  };
};

export default async function Image({ params }: Props) {
  const [user, songs] = await Promise.all([
    fetchUserProfile(params.userId),
    fetchMyBestSongs(params.userId),
  ]);

  return new ImageResponse(<UserOgp user={user!} myBestSongs={songs} />, {
    ...size,
  });
}
