'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import sharp from 'sharp';

import { STORAGE_PATH } from '@/constants/supabase';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import { type RouterInputs } from '@/trpc/shared';
import { createSupabaseServerClient } from '@/utils/supabase';

// HACK: client側でリダイレクトさせるとrevalidateがされない？ので、サーバー側でリダイレクトさせる
export const updateUserProfile = async (input: RouterInputs['user']['update']) => {
  return api.user.update.mutate(input).then(() => {
    redirect(`/members/${input.id}`);
  });
};

export const updateUserAvatar = async (formData: FormData) => {
  const userId = formData.get('userId') as string;
  const file = formData.get('file') as File;

  const cookieStore = cookies();
  const session = await getServerAuthSession();
  const supabase = createSupabaseServerClient(cookieStore, session?.supabaseAccessToken);

  const { data: existingData } = await supabase.storage.from('profiles').list(userId, {
    search: 'avatar',
  });
  if (existingData) {
    const filePaths = existingData.map((existingFile) => `${userId}/${existingFile.name}`);
    await supabase.storage.from('profiles').remove(filePaths);
  }
  const compressedFile = await sharp(await file.arrayBuffer())
    .webp({ quality: 90, nearLossless: true })
    .resize({
      width: 600,
      height: 600,
      fit: 'cover',
    })
    .toBuffer();

  const newFilename = `${userId}/avatar${new Date().getTime()}.webp`;
  const { data, error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(newFilename, compressedFile, {
      upsert: true,
      contentType: 'image/webp',
    });

  if (uploadError) {
    console.error('Failed to upload image with error:');
    throw uploadError;
  }
  if (!data) {
    throw new Error('Failed to upload image.');
  }

  const imagePath = `${STORAGE_PATH}/profiles/${data.path}`;

  await api.user.update.mutate({
    id: userId,
    image: imagePath,
  });

  return imagePath;
};
