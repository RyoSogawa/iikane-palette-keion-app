'use server';

import { revalidatePath } from 'next/cache';

import { api } from '@/trpc/server';

export const deleteAccount = async (userId: string) => {
  await api.user.deleteMe.mutate();
  revalidatePath('/');
  revalidatePath(`/members/${userId}`);
};
