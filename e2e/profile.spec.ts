import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

import { LOGIN_USER, OTHER_USER } from './fixtures/test-users';

test.describe('プロフィール編集', () => {
  // どのテストも LOGIN_USER の同じ行を読み書きする。フォームは image も含めて丸ごと送るので、並列だとアバターの更新を古い値で上書きしうる
  test.describe.configure({ mode: 'default' });
  // ストリーミング中は非表示の同じフォームが一瞬 DOM に残る。getByLabel だとそれにもマッチして strict mode 違反になるので、非表示を除外する getByRole で引く

  test('ログイン中のユーザーは自分のプロフィール編集画面を開ける', async ({ page }) => {
    await page.goto(`/members/${LOGIN_USER.id}/edit/profile`);

    await expect(page.getByRole('heading', { name: 'プロフィール編集' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'お名前' })).toHaveValue(LOGIN_USER.name);
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

  test('基本情報とリンクを入力して保存すると DB に反映され、再読み込みしても残っている', async ({
    page,
  }) => {
    await page.goto(`/members/${LOGIN_USER.id}/edit/profile`);
    await page.getByRole('textbox', { name: 'ニックネーム' }).fill('いいかね');
    await page.getByRole('textbox', { name: 'お住まいの地域' }).fill('東京都');
    await page.getByRole('textbox', { name: 'X/Twitter' }).fill('iikane_e2e');
    await page.getByRole('textbox', { name: 'Webサイト' }).fill('https://example.com/e2e');
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByText('プロフィールを更新しました')).toBeVisible();

    const db = new PrismaClient();
    try {
      const user = await db.user.findUniqueOrThrow({ where: { id: LOGIN_USER.id } });
      expect(user).toMatchObject({
        name: LOGIN_USER.name,
        nickname: 'いいかね',
        residence: '東京都',
        twitterUsername: 'iikane_e2e',
        websiteLink: 'https://example.com/e2e',
      });
    } finally {
      await db.$disconnect();
    }

    await page.reload();
    await expect(page.getByRole('textbox', { name: 'ニックネーム' })).toHaveValue('いいかね');
    await expect(page.getByRole('textbox', { name: 'お住まいの地域' })).toHaveValue('東京都');
  });

  test('お名前を空にすると保存されない', async ({ page }) => {
    await page.goto(`/members/${LOGIN_USER.id}/edit/profile`);
    const nameInput = page.getByRole('textbox', { name: 'お名前' });
    await nameInput.fill('');
    await page.getByRole('button', { name: '保存' }).click();

    expect(await nameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await expect(page.getByText('プロフィールを更新しました')).toBeHidden();

    const db = new PrismaClient();
    try {
      const user = await db.user.findUniqueOrThrow({ where: { id: LOGIN_USER.id } });
      expect(user.name).toBe(LOGIN_USER.name);
    } finally {
      await db.$disconnect();
    }
  });
});
