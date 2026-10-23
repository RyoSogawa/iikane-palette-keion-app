import { describe, expect, it, vi } from 'vitest';

import { ImportDiscordAvatarService } from './import-discord-avatar.service';

import type { AvatarStorageService } from './avatar-storage.service';

const SUPABASE_URL = 'http://supabase.test/storage/v1/object/public/profiles/user-1/avatar1.png';

const createDeps = (copyFromDiscord = vi.fn().mockResolvedValue(SUPABASE_URL)) => {
  const avatarStorage = { copyFromDiscord } as unknown as AvatarStorageService;
  const updateUserImage = vi.fn().mockResolvedValue(undefined);
  return { avatarStorage, updateUserImage, copyFromDiscord };
};

describe('ImportDiscordAvatarService', () => {
  it('image が Discord の CDN なら Supabase にコピーし、User.image を Supabase の URL にする', async () => {
    const { avatarStorage, updateUserImage, copyFromDiscord } = createDeps();
    const service = new ImportDiscordAvatarService(avatarStorage, updateUserImage);

    const result = await service.invoke({
      id: 'user-1',
      image: 'https://cdn.discordapp.com/avatars/123/abc.png',
    });

    expect(copyFromDiscord).toHaveBeenCalledWith(
      'user-1',
      'https://cdn.discordapp.com/avatars/123/abc.png',
    );
    expect(updateUserImage).toHaveBeenCalledWith('user-1', SUPABASE_URL);
    expect(result).toBe(SUPABASE_URL);
  });

  it.each([
    ['image が無い', null],
    ['すでに Supabase の URL', SUPABASE_URL],
  ])('%s ときは何もしない', async (_, image) => {
    const { avatarStorage, updateUserImage, copyFromDiscord } = createDeps();
    const service = new ImportDiscordAvatarService(avatarStorage, updateUserImage);

    const result = await service.invoke({ id: 'user-1', image });

    expect(copyFromDiscord).not.toHaveBeenCalled();
    expect(updateUserImage).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('コピーに失敗したら User.image を変えずにエラーを投げる', async () => {
    const error = new Error('upload failed');
    const { avatarStorage, updateUserImage } = createDeps(vi.fn().mockRejectedValue(error));
    const service = new ImportDiscordAvatarService(avatarStorage, updateUserImage);

    await expect(
      service.invoke({ id: 'user-1', image: 'https://cdn.discordapp.com/avatars/123/abc.png' }),
    ).rejects.toBe(error);
    expect(updateUserImage).not.toHaveBeenCalled();
  });
});
