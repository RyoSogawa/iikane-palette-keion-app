'use server';

import { cookies } from 'next/headers';
import sharp from 'sharp';

import { STORAGE_PATH } from '@/constants/supabase';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import { createSupabaseServerClient } from '@/utils/supabase';

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
    .png({
      quality: 90,
      compressionLevel: 9,
      adaptiveFiltering: true,
      progressive: true,
    })
    .resize({
      width: 600,
      height: 600,
      fit: 'cover',
    })
    .toBuffer();

  const newFilename = `${userId}/avatar${new Date().getTime()}.png`;
  const { data, error: uploadError } = await supabase.storage
    .from('profiles')
    .upload(newFilename, compressedFile, {
      upsert: true,
      contentType: 'image/png',
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
