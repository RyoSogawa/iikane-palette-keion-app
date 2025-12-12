import React from 'react';

import { api } from '@/trpc/server';
import EditorViewer from '@/ui/components/input/EditorViewer';

export const revalidate = 3600;

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

export default async function MemberProfilePage({ params }: Props) {
  const { userId } = await params;
  const trpc = await api();
  const [user] = await Promise.all([
    trpc.user.findById({
      id: userId,
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
