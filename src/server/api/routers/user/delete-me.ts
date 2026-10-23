import { revalidatePath } from 'next/cache';

import { protectedProcedure } from '@/server/api/trpc';
import { createSupabaseClientForUser } from '@/utils/supabase';

export const deleteMe = protectedProcedure.mutation(({ ctx }) => {
  return ctx.db.$transaction(async (tx) => {
    const userId = ctx.session.user.id;

    const supabase = createSupabaseClientForUser(ctx.session.user);

    const { data, error } = await supabase.storage.from('profiles').list(userId);
    if (error) {
      throw error;
    }
    const filePaths = data?.map((file) => `${userId}/${file.name}`);
    if (filePaths) {
      await supabase.storage.from('profiles').remove(filePaths);
    }

    await tx.user.delete({
      where: {
        id: userId,
      },
    });

    revalidatePath('/');
    revalidatePath(`/members/${userId}/profile`);
  });
});
