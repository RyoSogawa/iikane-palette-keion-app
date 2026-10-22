'use server';

import { AvatarStorageService } from '@/server/applications/services/avatar-storage.service';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import { createSupabaseClientForUser } from '@/utils/supabase';

export const updateUserAvatar = async (formData: FormData) => {
  const file = formData.get('file') as File;

  const session = await getServerAuthSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  const userId = session.user.id;

  const supabase = createSupabaseClientForUser(session.user);
  const imagePath = await new AvatarStorageService(supabase).save(userId, await file.arrayBuffer());

  const trpc = await api();
  await trpc.user.update({
    id: userId,
    image: imagePath,
  });

  return imagePath;
};
