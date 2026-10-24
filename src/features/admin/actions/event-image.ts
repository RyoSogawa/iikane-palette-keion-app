'use server';

import { eventImageTargetSchema } from '@/server/api/routers/admin/schemas';
import {
  EventImageStorageService,
  type EventImageTarget,
  runCleanupQuietly,
} from '@/server/applications/services/event-image-storage.service';
import { getServerAuthSession } from '@/server/auth';
import { api } from '@/trpc/server';
import { createSupabaseClientForAdmin } from '@/utils/supabase';

// クライアントで縮小してから送るので、これを超えるのは縮小を通っていないリクエスト
const MAX_FILE_BYTES = 1024 * 1024;

const parseTarget = (formData: FormData): EventImageTarget =>
  eventImageTargetSchema.parse({
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

// Server Action はどこからでも呼べるので、Storage に書き込める JWT を作る前にここでも管理者か確かめる
const requireAdmin = async () => {
  const session = await getServerAuthSession();
  if (!session?.user.isAdmin) {
    throw new Error('Forbidden');
  }
  return session.user;
};

/**
 * イベントまたはバンドの画像をアップロードして差し替え、新しい公開 URL を返す。
 * ここが受け持つのはファイルの保存と削除で、URL の差し替えは admin.image.set に任せる。
 */
export const uploadEventImage = async (formData: FormData) => {
  const user = await requireAdmin();
  const target = parseTarget(formData);
  const file = parseImageFile(formData);

  const storage = new EventImageStorageService(createSupabaseClientForAdmin(user));
  const url = await storage.save(target, await file.arrayBuffer());
  const trpc = await api();
  const previousUrl = await trpc.admin.image.set({ target, url }).catch(async (error: unknown) => {
    // 差し替え先のイベントやバンドが見つからなければ、どこからも参照されないファイルを残さない
    await runCleanupQuietly(() => storage.removeByUrl(url));
    throw error;
  });
  await runCleanupQuietly(() => storage.removeByUrl(previousUrl));

  return url;
};

/** イベントまたはバンドの画像を外す */
export const removeEventImage = async (formData: FormData) => {
  const user = await requireAdmin();
  const target = parseTarget(formData);

  const trpc = await api();
  const previousUrl = await trpc.admin.image.set({ target, url: null });
  const storage = new EventImageStorageService(createSupabaseClientForAdmin(user));
  await runCleanupQuietly(() => storage.removeByUrl(previousUrl));
};
