'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import { createSupabaseServerClient } from '@/utils/supabase';

export const deleteAccount = async (userId: string) => {
  const cookieStore = cookies();
  const session = await getServerAuthSession();
  const supabase = createSupabaseServerClient(cookieStore, session?.supabaseAccessToken);

  const { data, error } = await supabase.storage.from('profiles').list(userId);
  if (error) {
    throw error;
  }
  const filePaths = data?.map((file) => `${userId}/${file.name}`);
  if (filePaths) {
    await supabase.storage.from('profiles').remove(filePaths);
  }

  await api.user.deleteMe.mutate();
  revalidatePath('/');
  revalidatePath(`/members/${userId}`);
};
