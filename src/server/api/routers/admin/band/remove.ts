import { z } from 'zod';

import { adminProcedure } from '@/server/api/trpc';
import {
  EventImageStorageService,
  runCleanupQuietly,
} from '@/server/applications/services/event-image-storage.service';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';
import { createSupabaseClientForAdmin } from '@/utils/supabase';

/**
 * バンドを削除する。メンバーは DB の Cascade で一緒に消える。
 * 画像は public のバケットに残ると URL を知る人に見え続けるので、バンドの画像も消す。
 */
export const remove = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const band = await ctx.db.band.delete({
      where: { id: input.id },
      select: { photo: true, image: true, typoImage: true },
    });
    const storage = new EventImageStorageService(createSupabaseClientForAdmin(ctx.session.user));
    await Promise.all(
      [band.photo, band.image, band.typoImage].map((url) =>
        runCleanupQuietly(() => storage.removeByUrl(url)),
      ),
    );
    revalidateEventPages();
  });
