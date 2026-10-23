'use server';

import { z } from 'zod';

import {
  EventImageStorageService,
  type EventImageTarget,
} from '@/server/applications/services/event-image-storage.service';
import { revalidateEventPages } from '@/server/applications/services/revalidate-event-pages';
import { getServerAuthSession } from '@/server/auth';
import { db } from '@/server/db';
import { createSupabaseClientForAdmin } from '@/utils/supabase';

const targetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('event'), eventId: z.string().min(1) }),
  z.object({
    kind: z.enum(['bandPhoto', 'bandImage', 'bandTypoImage']),
    eventId: z.string().min(1),
    bandId: z.string().min(1),
  }),
]);

const BAND_COLUMN = {
  bandPhoto: 'photo',
  bandImage: 'image',
  bandTypoImage: 'typoImage',
} as const;

// クライアントで縮小してから送るので、これを超えるのは縮小を通っていないリクエスト
const MAX_FILE_BYTES = 1024 * 1024;

const parseTarget = (formData: FormData): EventImageTarget =>
  targetSchema.parse({
    kind: formData.get('kind'),
    eventId: formData.get('eventId'),
    bandId: formData.get('bandId') ?? undefined,
  });

const parseImageFile = (formData: FormData) => {
  const file = formData.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/') || file.size > MAX_FILE_BYTES) {
    throw new Error('画像ファイルを選んでください');
  }
  return file;
};

// Server Action はどこからでも呼べるので、管理画面の layout とは別にここでも管理者か確かめる
const requireAdmin = async () => {
  const session = await getServerAuthSession();
  if (!session?.user.isAdmin) {
    throw new Error('Forbidden');
  }
  return session.user;
};

const findCurrentUrl = async (target: EventImageTarget) => {
  if (target.kind === 'event') {
    const event = await db.event.findUnique({
      where: { id: target.eventId },
      select: { image: true },
    });
    if (!event) throw new Error('イベントが見つかりませんでした');
    return event.image;
  }

  const band = await db.band.findFirst({
    where: { id: target.bandId, eventId: target.eventId },
    select: { photo: true, image: true, typoImage: true },
  });
  if (!band) throw new Error('バンドが見つかりませんでした');
  return band[BAND_COLUMN[target.kind]];
};

const saveUrl = async (target: EventImageTarget, url: string | null) => {
  if (target.kind === 'event') {
    await db.event.update({ where: { id: target.eventId }, data: { image: url } });
    return;
  }
  await db.band.update({
    where: { id: target.bandId },
    data: { [BAND_COLUMN[target.kind]]: url },
  });
};

const removeQuietly = async (storage: EventImageStorageService, url: string | null) => {
  try {
    await storage.removeByUrl(url);
  } catch (error) {
    // 古いファイルが残るだけなので、差し替え自体は失敗にしない
    console.error('Failed to remove the previous event image:', error);
  }
};

/** イベントまたはバンドの画像をアップロードして差し替え、新しい公開 URL を返す */
export const uploadEventImage = async (formData: FormData) => {
  const user = await requireAdmin();
  const target = parseTarget(formData);
  const file = parseImageFile(formData);
  const previousUrl = await findCurrentUrl(target);

  const storage = new EventImageStorageService(createSupabaseClientForAdmin(user));
  const url = await storage.save(target, await file.arrayBuffer());
  await saveUrl(target, url);
  await removeQuietly(storage, previousUrl);

  revalidateEventPages();
  return url;
};

/** イベントまたはバンドの画像を外す */
export const removeEventImage = async (formData: FormData) => {
  const user = await requireAdmin();
  const target = parseTarget(formData);
  const previousUrl = await findCurrentUrl(target);

  await saveUrl(target, null);
  await removeQuietly(
    new EventImageStorageService(createSupabaseClientForAdmin(user)),
    previousUrl,
  );

  revalidateEventPages();
};
