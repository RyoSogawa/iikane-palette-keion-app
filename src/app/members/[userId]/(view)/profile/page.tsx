import React from 'react';

import { api } from '@/trpc/server';
import EditorViewer from '@/ui/components/input/EditorViewer';

export const revalidate = 3600;

type Props = {
  params: {
    userId: string;
  };
};

export default async function MemberProfilePage({ params }: Props) {
  const [user] = await Promise.all([
    api.user.findById.query({
      id: params.userId,
    }),
  ]);

  if (!user) {
    throw new Error('メンバーが見つかりませんでした');
  }

  if (!user.introduction) {
    return null;
  }

  return <EditorViewer value={user.introduction} mx={{ base: 0, sm: 32 }} />;
}
