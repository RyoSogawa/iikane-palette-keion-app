import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';

import { ADMIN_STORAGE_STATE, ADMIN_USER, LOGIN_USER } from './fixtures/test-users';

const NOT_FOUND_TEXT = 'This page could not be found.';

test.describe('管理画面のアクセス制限', () => {
  test('管理者でないユーザーには 404 を返す', async ({ page }) => {
    await page.goto('/admin/events');

    await expect(page.getByText(NOT_FOUND_TEXT)).toBeVisible();
  });

  test('未ログインには 404 を返す', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/admin/events');

    await expect(page.getByText(NOT_FOUND_TEXT)).toBeVisible();
    await context.close();
  });
});

test.describe('管理者によるイベント作成と公開', () => {
  test.use({ storageState: ADMIN_STORAGE_STATE });
  // 作成したイベントを次のテストで使うので順番に流す
  test.describe.configure({ mode: 'serial' });

  const eventName = `E2E イベント ${Date.now()}`;
  let eventId = '';
  let bandPath = '';

  test.afterAll(async () => {
    if (!eventId) return;
    const db = new PrismaClient();
    try {
      await db.event.deleteMany({ where: { id: eventId } });
    } finally {
      await db.$disconnect();
    }
  });

  test('作成したイベントは下書きになり、公開ページには出ない', async ({ page }) => {
    await page.goto('/admin/events/new');
    await page.getByRole('textbox', { name: 'イベント名' }).fill(eventName);
    await page.getByLabel('開始日時').fill('2026-11-01T10:00');
    await page.getByLabel('終了日時').fill('2026-11-01T18:00');
    await page.getByRole('button', { name: '下書きを作成' }).click();

    // 作成前の /admin/events/new 自体にマッチしないよう、new 以外への遷移を待つ
    await page.waitForURL((url) => /^\/admin\/events\/(?!new$)[^/]+$/.test(url.pathname));
    eventId = page.url().split('/').pop() ?? '';
    await expect(page.getByRole('heading', { name: eventName })).toBeVisible();
    await expect(page.getByText('下書き', { exact: true })).toBeVisible();

    await page.goto('/admin/events');
    const row = page.getByRole('row').filter({ hasText: eventName });
    await expect(row.getByRole('link', { name: eventName })).toBeVisible();
    await expect(row.getByText('下書き', { exact: true })).toBeVisible();

    await page.goto('/events');
    await expect(page.getByText(eventName)).toHaveCount(0);

    await page.goto(`/events/${eventId}`);
    await expect(page.getByText(NOT_FOUND_TEXT)).toBeVisible();
  });

  test('バンドを追加し、プレビューで公開ページと同じ内容を確認できる', async ({ page }) => {
    await page.goto(`/admin/events/${eventId}`);
    await page.getByRole('textbox', { name: 'バンドを追加' }).fill('E2E バンド');
    await page.getByRole('button', { name: '追加' }).click();

    await page.waitForURL(new RegExp(`/admin/events/${eventId}/bands/[^/]+$`));
    bandPath = new URL(page.url()).pathname;
    await expect(page.getByRole('heading', { name: 'No.1 E2E バンド' })).toBeVisible();

    await page.goto(`/admin/events/${eventId}/preview`);
    // ストリーミング中は非表示の同じ要素が DOM に残るので、非表示を除外する getByRole で引く
    await expect(
      page.getByRole('alert').filter({ hasText: 'プレビュー（下書き・非公開）' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: eventName })).toBeVisible();
    await expect(page.getByRole('heading', { name: '出演バンド' })).toBeVisible();
  });

  test('バンドメンバーは行ごとにエラーを出し、選んだユーザーはほかの行で選べず、未登録の人は表示名だけで入れられる', async ({
    page,
  }) => {
    // 行の id は useFieldArray が乱数で振るので、サーバーとブラウザで描画がずれていないか見る
    const hydrationErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error' && /hydrat/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    await page.goto(bandPath);
    const userSelects = page.getByLabel('ユーザー（任意）', { exact: true });
    const nameInputs = page.getByLabel('表示名（任意）', { exact: true });
    const addButton = page.getByRole('button', { name: 'メンバーを追加' });
    const saveButton = page.getByRole('button', { name: 'メンバーを保存' });

    await addButton.click();
    await saveButton.click();
    await expect(page.getByText('ユーザーを選ぶか、表示名を入力してください')).toBeVisible();

    await userSelects.nth(0).click();
    await page.getByRole('option', { name: ADMIN_USER.name }).click();
    await expect(page.getByText('ユーザーを選ぶか、表示名を入力してください')).toHaveCount(0);
    await page.getByLabel('パート', { exact: true }).nth(0).fill('Vo');

    await addButton.click();
    await userSelects.nth(1).click();
    await expect(page.getByRole('option', { name: ADMIN_USER.name })).toHaveAttribute(
      'data-combobox-disabled',
      'true',
    );
    await page.getByRole('option', { name: LOGIN_USER.name }).click();

    // Discord 未登録の人はユーザーを選ばず表示名だけで入れる
    await addButton.click();
    await nameInputs.nth(2).fill('未登録の人');

    await saveButton.click();
    await expect(page.getByText('メンバーを保存しました')).toBeVisible();
    expect(hydrationErrors).toEqual([]);

    const db = new PrismaClient();
    try {
      const members = await db.userOnBand.findMany({
        where: { bandId: bandPath.split('/').pop() },
        orderBy: { order: 'asc' },
        select: { userId: true, userName: true, part: true },
      });
      expect(members).toEqual([
        { userId: ADMIN_USER.id, userName: null, part: 'Vo' },
        { userId: LOGIN_USER.id, userName: null, part: null },
        { userId: null, userName: '未登録の人', part: null },
      ]);
    } finally {
      await db.$disconnect();
    }

    await page.goto(`/admin/events/${eventId}/preview/bands/${bandPath.split('/').pop()}`);
    await expect(
      page.getByText('未登録の人', { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: ADMIN_USER.name })).toBeVisible();
  });

  test('イベント画像をアップロードすると events バケットに保存される', async ({ page }) => {
    const image = await sharp({
      create: { width: 64, height: 64, channels: 3, background: '#0066ff' },
    })
      .png()
      .toBuffer();

    await page.goto(`/admin/events/${eventId}`);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'アップロード' }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({ name: 'event.png', mimeType: 'image/png', buffer: image });

    await expect(page.getByText('イベント画像を更新しました')).toBeVisible();

    const db = new PrismaClient();
    try {
      const event = await db.event.findUniqueOrThrow({ where: { id: eventId } });
      expect(event.image).toMatch(
        new RegExp(`/storage/v1/object/public/events/${eventId}/event-\\d+\\.webp$`),
      );
      const response = await page.request.get(event.image ?? '');
      expect(response.ok()).toBe(true);
    } finally {
      await db.$disconnect();
    }
  });

  test('未保存の変更があるまま別ページへ移ろうとすると確認する', async ({ page }) => {
    await page.goto(`/admin/events/${eventId}`);
    const leaveLink = page.getByRole('link', { name: 'イベント管理', exact: true });
    const dialog = page.getByRole('dialog', { name: '保存していない変更があります' });

    // 変更がなければ確認せずに移動する
    await leaveLink.click();
    await page.waitForURL('**/admin/events');
    await page.goto(`/admin/events/${eventId}`);

    await page.getByRole('textbox', { name: '説明' }).fill('編集中の説明');
    await leaveLink.click();
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: '編集を続ける' }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`/admin/events/${eventId}$`));
    await expect(page.getByRole('textbox', { name: '説明' })).toHaveValue('編集中の説明');

    await leaveLink.click();
    await dialog.getByRole('button', { name: '破棄して移動' }).click();
    await page.waitForURL('**/admin/events');
  });

  test('保存すると確認せずに別ページへ移れる', async ({ page }) => {
    await page.goto(`/admin/events/${eventId}`);
    const eventForm = page
      .locator('form')
      .filter({ has: page.getByRole('textbox', { name: '説明' }) });
    await eventForm.getByRole('textbox', { name: '説明' }).fill('保存した説明');
    await eventForm.getByRole('button', { name: '保存', exact: true }).click();
    await expect(page.getByText('保存しました')).toBeVisible();

    await page.getByRole('link', { name: 'イベント管理', exact: true }).click();
    await page.waitForURL('**/admin/events');
  });

  test('公開するとイベント一覧に出る', async ({ page }) => {
    await page.goto(`/admin/events/${eventId}`);
    await page.getByRole('button', { name: '公開する' }).click();
    await page.getByRole('dialog').getByRole('button', { name: '公開する' }).click();

    await expect(page.getByText('公開中', { exact: true })).toBeVisible();

    await page.goto('/events');
    await expect(page.getByRole('link', { name: eventName })).toBeVisible();
  });
});
