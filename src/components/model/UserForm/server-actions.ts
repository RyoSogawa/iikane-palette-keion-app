'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sharp from 'sharp';

import { STORAGE_PATH } from '@/constants/supabase';
import { type UserUpdateProfileInput } from '@/server/api/routers/user/update';
import { api } from '@/trpc/server';
import { createSupabaseServerClient } from '@/utils/supabase';

export const updateUserProfile = async (input: UserUpdateProfileInput) => {
  return api.user.updateProfile.mutate(input).then(() => {
    revalidatePath(`/members/${input.id}`);
    redirect(`/members/${input.id}`);
  });
};

export const updateUserAvatar = async (formData: FormData) => {
  const userId = formData.get('userId') as string;
  const file = formData.get('file') as File;

  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const filename = `${userId}/avatar.webp`;

  const compressedFile = await sharp(await file.arrayBuffer())
    .webp({ quality: 90, nearLossless: true })
    .resize({
      width: 600,
      height: 600,
      fit: 'cover',
    })
    .toBuffer();

  const { data, error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(filename, compressedFile, {
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }
  if (!data) {
    throw new Error('Failed to upload image.');
  }

  const imagePath = `${STORAGE_PATH}/profiles/${data.path}`;

  await api.user.updateAvatar.mutate({
    id: userId,
    image: imagePath,
  });

  revalidatePath(`/members/${userId}`);

  return imagePath;
};
