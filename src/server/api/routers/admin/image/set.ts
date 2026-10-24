import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { eventImageTargetSchema } from '@/server/api/routers/admin/schemas';
import { adminProcedure } from '@/server/api/trpc';
import {
  EVENT_IMAGE_URL_PREFIX,
  type EventImageTarget,
} from '@/server/applications/services/event-image-storage.service';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';

import type { PrismaClient } from '@prisma/client';

const BAND_COLUMN = {
  bandPhoto: 'photo',
  bandImage: 'image',
  bandTypoImage: 'typoImage',
} as const;

const notFound = () => new TRPCError({ code: 'NOT_FOUND' });

const findCurrentUrl = async (db: PrismaClient, target: EventImageTarget) => {
  if (target.kind === 'event') {
    const event = await db.event.findUnique({
      where: { id: target.eventId },
      select: { image: true },
    });
    if (!event) throw notFound();
    return event.image;
  }

  const band = await db.band.findFirst({
    where: { id: target.bandId, eventId: target.eventId },
    select: { photo: true, image: true, typoImage: true },
  });
  if (!band) throw notFound();
  return band[BAND_COLUMN[target.kind]];
};

const saveUrl = async (db: PrismaClient, target: EventImageTarget, url: string | null) => {
  if (target.kind === 'event') {
    await db.event.update({ where: { id: target.eventId }, data: { image: url } });
    return;
  }
  await db.band.update({
    where: { id: target.bandId },
    data: { [BAND_COLUMN[target.kind]]: url },
  });
};

/**
 * イベント・バンドの画像の URL を差し替え、差し替え前の URL を返す。
 * ファイルの保存と削除はアップロード用の Server Action が受け持ち、ここは DB と公開ページの再検証だけを行う。
 * 公開ページの img にそのまま入るので、URL は events バケットのものに限る。
 */
export const set = adminProcedure
  .input(
    z.object({
      target: eventImageTargetSchema,
      url: z.string().startsWith(EVENT_IMAGE_URL_PREFIX).nullable(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const previousUrl = await findCurrentUrl(ctx.db, input.target);
    await saveUrl(ctx.db, input.target, input.url);
    revalidateEventPages();
    return previousUrl;
  });
