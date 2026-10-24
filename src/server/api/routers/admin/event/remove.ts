import { z } from 'zod';

import { adminProcedure } from '@/server/api/trpc';
import {
  EventImageStorageService,
  runCleanupQuietly,
} from '@/server/applications/services/event-image-storage.service';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';
import { createSupabaseClientForAdmin } from '@/utils/supabase';

/**
 * イベントを削除する。バンド・メンバー・レク王は DB の Cascade で一緒に消える。
 * 画像は public のバケットに残ると URL を知る人に見え続けるので、イベントのフォルダごと消す。
 */
export const remove = adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.db.event.delete({ where: { id: input.id } });
    const storage = new EventImageStorageService(createSupabaseClientForAdmin(ctx.session.user));
    await runCleanupQuietly(() => storage.removeEventFolder(input.id));
    revalidateEventPages();
  });
