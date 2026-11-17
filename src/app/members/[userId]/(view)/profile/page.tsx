import React, { Suspense } from 'react';

import { Flex, Loader, Stack } from '@mantine/core';
import { IconHeart } from '@tabler/icons-react';

import MyBestSongs from '@/features/my-best-songs/components/MyBestSongs';
import UserIntroduction from '@/features/user/components/UserIntroduction';
import UserProfileSection from '@/features/user/components/UserProfileSection';
import { api } from '@/trpc/server';

export const revalidate = 3600;

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

/** My Best Songs はジャケット画像を Spotify から取るので遅れることがある。Suspense で分けてプロフィール文を先に出す */
async function MyBestSongsSection({ userId }: { userId: string }) {
  const trpc = await api();
  const myBestSongs = await trpc.myBestSongs.findByUserId({ userId });

  if (!myBestSongs.length) return null;

  return (
    <UserProfileSection title="My Best Songs" icon={<IconHeart size={20} aria-hidden />}>
      <MyBestSongs data={myBestSongs} />
    </UserProfileSection>
  );
}

/** メンバーのプロフィールページ（閲覧側）。プロフィール文と My Best Songs をタブで分けずに 1 ページに並べる */
export default async function MemberProfilePage({ params }: Props) {
  const { userId } = await params;
  const trpc = await api();
  const user = await trpc.user.findById({
    id: userId,
  });

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  return (
    <Stack gap={48} mt="xl" mx={{ base: 0, sm: 32 }}>
      <UserIntroduction value={user.introduction} />
      <Suspense
        fallback={
          <Flex justify="center">
            <Loader aria-label="My Best Songs を読み込み中" />
          </Flex>
        }
      >
        <MyBestSongsSection userId={userId} />
      </Suspense>
    </Stack>
  );
}
