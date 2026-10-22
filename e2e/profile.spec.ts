import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

import { LOGIN_USER, OTHER_USER } from './fixtures/test-users';

test.describe('プロフィール編集', () => {
  test('ログイン中のユーザーは自分のプロフィール編集画面を開ける', async ({ page }) => {
    await page.goto(`/members/${LOGIN_USER.id}/edit/profile`);

    await expect(page.getByRole('heading', { name: 'プロフィール編集' })).toBeVisible();
    await expect(page.getByLabel('お名前')).toHaveValue(LOGIN_USER.name);
  });

  test('他人のプロフィール編集画面は開けない', async ({ page }) => {
    await page.goto(`/members/${OTHER_USER.id}/edit/profile`);

    await expect(page.getByRole('heading', { name: 'アクセス権がありません' })).toBeVisible();
  });

  test('未ログインではプロフィール編集画面を開けない', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto(`/members/${LOGIN_USER.id}/edit/profile`);

    await expect(page.getByRole('heading', { name: 'アクセス権がありません' })).toBeVisible();
    await context.close();
  });

  test('アバター画像をアップロードすると Supabase Storage に保存され、User.image が更新される', async ({
    page,
  }) => {
    const image = await sharp({
      create: { width: 64, height: 64, channels: 3, background: '#ff6600' },
    })
      .png()
      .toBuffer();

    await page.goto(`/members/${LOGIN_USER.id}/edit/profile`);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'アバターを変更する' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: image });

    await expect(page.getByText('アバターを更新しました')).toBeVisible();

    const db = new PrismaClient();
    try {
      const user = await db.user.findUniqueOrThrow({ where: { id: LOGIN_USER.id } });
      expect(user.image).toMatch(
        new RegExp(`/storage/v1/object/public/profiles/${LOGIN_USER.id}/avatar\\d+\\.png$`),
      );

      const response = await page.request.get(user.image ?? '');
      expect(response.ok()).toBe(true);
      expect(response.headers()['content-type']).toBe('image/png');
    } finally {
      await db.$disconnect();
    }
  });
});
