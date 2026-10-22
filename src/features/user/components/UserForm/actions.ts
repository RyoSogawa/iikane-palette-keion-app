'use server';

import { cookies } from 'next/headers';

import { AvatarStorageService } from '@/server/applications/services/avatar-storage.service';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import { createSupabaseServerClient } from '@/utils/supabase';

export const updateUserAvatar = async (formData: FormData) => {
  const userId = formData.get('userId') as string;
  const file = formData.get('file') as File;

  const cookieStore = await cookies();
  const session = await getServerAuthSession();
  const supabase = createSupabaseServerClient(cookieStore, session?.supabaseAccessToken);

  const imagePath = await new AvatarStorageService(supabase).save(userId, await file.arrayBuffer());

  const trpc = await api();
  await trpc.user.update({
    id: userId,
    image: imagePath,
  });

  return imagePath;
};
