'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { type UserUpdateProfileInput } from '@/server/api/routers/user/update';
import { type UserUpdateAvatarInput } from '@/server/api/routers/user/update-avatar';
import { api } from '@/trpc/server';

export const updateUserProfile = async (input: UserUpdateProfileInput) => {
  return api.user.updateProfile.mutate(input).then(() => {
    revalidatePath(`/members/${input.id}`);
    redirect(`/members/${input.id}`);
  });
};

export const updateUserAvatar = async (input: UserUpdateAvatarInput) => {
  return api.user.updateAvatar.mutate(input).then(() => {
    revalidatePath(`/members/${input.id}`);
  });
};
