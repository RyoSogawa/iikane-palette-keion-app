import { TRPCError } from '@trpc/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { removeEventImage, uploadEventImage } from './event-image';

import type * as StorageService from '@/server/applications/services/event-image-storage.service';

const mocks = vi.hoisted(() => ({
  getServerAuthSession: vi.fn(),
  createSupabaseClientForAdmin: vi.fn(() => ({})),
  save: vi.fn(),
  removeByUrl: vi.fn(),
  setImage: vi.fn(),
}));

vi.mock('@/server/auth', () => ({ getServerAuthSession: mocks.getServerAuthSession }));
vi.mock('@/trpc/server', () => ({
  api: () => Promise.resolve({ admin: { image: { set: mocks.setImage } } }),
}));
vi.mock('@/utils/supabase', () => ({
  createSupabaseClientForAdmin: mocks.createSupabaseClientForAdmin,
}));
vi.mock('@/server/applications/services/event-image-storage.service', async (importOriginal) => ({
  ...(await importOriginal<typeof StorageService>()),
  EventImageStorageService: class {
    save = mocks.save;
    removeByUrl = mocks.removeByUrl;
  },
}));

const OLD_URL = 'http://supabase.test/storage/v1/object/public/events/event-1/event-1.webp';
const NEW_URL = 'http://supabase.test/storage/v1/object/public/events/event-1/event-2.webp';

const adminSession = { user: { id: 'admin-1', email: 'a@example.com', isAdmin: true } };

const createFormData = (fields: Record<string, string>, file: File | null = null) => {
  const formData = new FormData();
  if (file) formData.append('file', file);
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  return formData;
};

const imageFile = () => new File([new Uint8Array([1, 2, 3])], 'image.webp', { type: 'image/webp' });

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getServerAuthSession.mockResolvedValue(adminSession);
  mocks.save.mockResolvedValue(NEW_URL);
  mocks.removeByUrl.mockResolvedValue(undefined);
  mocks.setImage.mockResolvedValue(OLD_URL);
});

describe('uploadEventImage', () => {
  it.each([null, { user: { id: 'user-1', isAdmin: false } }])(
    '管理者でなければ何もせずに投げる（session: %o）',
    async (session) => {
      mocks.getServerAuthSession.mockResolvedValue(session);

      await expect(
        uploadEventImage(createFormData({ kind: 'event', eventId: 'event-1' }, imageFile())),
      ).rejects.toThrow('Forbidden');
      expect(mocks.createSupabaseClientForAdmin).not.toHaveBeenCalled();
      expect(mocks.save).not.toHaveBeenCalled();
    },
  );

  it('画像を保存して URL を差し替え、古い画像を消す', async () => {
    const url = await uploadEventImage(
      createFormData({ kind: 'bandPhoto', eventId: 'event-1', bandId: 'band-1' }, imageFile()),
    );

    const target = { kind: 'bandPhoto', eventId: 'event-1', bandId: 'band-1' };
    expect(url).toBe(NEW_URL);
    expect(mocks.createSupabaseClientForAdmin).toHaveBeenCalledWith(adminSession.user);
    expect(mocks.save).toHaveBeenCalledWith(target, expect.any(ArrayBuffer));
    expect(mocks.setImage).toHaveBeenCalledWith({ target, url: NEW_URL });
    expect(mocks.removeByUrl).toHaveBeenCalledWith(OLD_URL);
  });

  it('URL を差し替えられなければ、上げた画像を消して投げる', async () => {
    mocks.setImage.mockRejectedValue(new TRPCError({ code: 'NOT_FOUND' }));

    await expect(
      uploadEventImage(
        createFormData({ kind: 'bandPhoto', eventId: 'event-1', bandId: 'other' }, imageFile()),
      ),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(mocks.removeByUrl).toHaveBeenCalledWith(NEW_URL);
    expect(mocks.removeByUrl).not.toHaveBeenCalledWith(OLD_URL);
  });

  it('画像以外のファイルは受け付けない', async () => {
    const text = new File(['hello'], 'a.txt', { type: 'text/plain' });

    await expect(
      uploadEventImage(createFormData({ kind: 'event', eventId: 'event-1' }, text)),
    ).rejects.toThrow();
    expect(mocks.save).not.toHaveBeenCalled();
  });

  it('古い画像を消せなくても、差し替え自体は成功させる', async () => {
    mocks.removeByUrl.mockRejectedValue(new Error('storage down'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(
      uploadEventImage(createFormData({ kind: 'event', eventId: 'event-1' }, imageFile())),
    ).resolves.toBe(NEW_URL);
  });
});

describe('removeEventImage', () => {
  it('画像を外して古いファイルを消す', async () => {
    await removeEventImage(createFormData({ kind: 'event', eventId: 'event-1' }));

    expect(mocks.setImage).toHaveBeenCalledWith({
      target: { kind: 'event', eventId: 'event-1' },
      url: null,
    });
    expect(mocks.removeByUrl).toHaveBeenCalledWith(OLD_URL);
  });

  it('管理者でなければ投げる', async () => {
    mocks.getServerAuthSession.mockResolvedValue(null);

    await expect(
      removeEventImage(createFormData({ kind: 'event', eventId: 'event-1' })),
    ).rejects.toThrow('Forbidden');
    expect(mocks.setImage).not.toHaveBeenCalled();
  });
});
