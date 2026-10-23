import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateUserAvatar } from './actions';

const mocks = vi.hoisted(() => ({
  getServerAuthSession: vi.fn(),
  createSupabaseClientForUser: vi.fn(() => ({})),
  save: vi.fn(),
  trpcUpdate: vi.fn(),
}));

vi.mock('@/server/auth', () => ({ getServerAuthSession: mocks.getServerAuthSession }));
vi.mock('@/trpc/server', () => ({
  api: vi.fn().mockResolvedValue({ user: { update: mocks.trpcUpdate } }),
}));
vi.mock('@/utils/supabase', () => ({
  createSupabaseClientForUser: mocks.createSupabaseClientForUser,
}));
vi.mock('@/server/applications/services/avatar-storage.service', () => ({
  AvatarStorageService: class {
    save = mocks.save;
  },
}));

const IMAGE_PATH = 'http://supabase.test/storage/v1/object/public/profiles/me/avatar1.png';

const createFormData = (fields: Record<string, string> = {}) => {
  const formData = new FormData();
  formData.append('file', new File([new Uint8Array([1, 2, 3])], 'avatar.png'));
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  return formData;
};

describe('updateUserAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.save.mockResolvedValue(IMAGE_PATH);
    mocks.trpcUpdate.mockResolvedValue(undefined);
  });

  it('ログイン中のユーザーのフォルダに保存し、そのユーザーの image を更新する', async () => {
    const user = { id: 'me', email: 'me@example.com' };
    mocks.getServerAuthSession.mockResolvedValue({ user });

    const result = await updateUserAvatar(createFormData());

    expect(mocks.createSupabaseClientForUser).toHaveBeenCalledWith(user);
    expect(mocks.save).toHaveBeenCalledWith('me', expect.any(ArrayBuffer));
    expect(mocks.trpcUpdate).toHaveBeenCalledWith({ id: 'me', image: IMAGE_PATH });
    expect(result).toBe(IMAGE_PATH);
  });

  it('フォームに他人の userId が入っていても、ログイン中のユーザーのフォルダに保存する', async () => {
    mocks.getServerAuthSession.mockResolvedValue({ user: { id: 'me' } });

    await updateUserAvatar(createFormData({ userId: 'someone-else' }));

    expect(mocks.save).toHaveBeenCalledWith('me', expect.any(ArrayBuffer));
    expect(mocks.trpcUpdate).toHaveBeenCalledWith({ id: 'me', image: IMAGE_PATH });
  });

  it('ログインしていなければ保存せずにエラーを投げる', async () => {
    mocks.getServerAuthSession.mockResolvedValue(null);

    await expect(updateUserAvatar(createFormData())).rejects.toThrow();
    expect(mocks.createSupabaseClientForUser).not.toHaveBeenCalled();
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.trpcUpdate).not.toHaveBeenCalled();
  });
});
