'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { type UserUpdateProfileInput } from '@/server/api/routers/user/update';
import { api } from '@/trpc/server';

export const updateUserProfile = async (input: UserUpdateProfileInput) => {
  return api.user.updateProfile.mutate(input).then(() => {
    revalidatePath(`/members/${input.id}`);
    redirect(`/members/${input.id}`);
  });
};
