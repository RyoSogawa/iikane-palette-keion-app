import { expect, type Page, test } from '@playwright/test';
import { type JamSessionPart, PrismaClient } from '@prisma/client';

import {
  ADMIN_STORAGE_STATE,
  LOGIN_USER,
  OTHER_STORAGE_STATE,
  OTHER_USER,
} from './fixtures/test-users';

// ほかの人の操作は 5 秒おきのポーリングで届くので、既定の 5 秒より長く待つ
const POLLING_TIMEOUT = { timeout: 15_000 };

const db = new PrismaClient();

const joinByDb = (userId: string, parts: JamSessionPart[] = ['vocal']) =>
  db.jamSessionParticipant.upsert({
    where: { userId },
    create: { userId, parts, roots: [], joinedAt: new Date() },
    update: { parts, roots: [], joinedAt: new Date() },
  });

const createSongByDb = (
  name: string,
  proposerId: string,
  entries: Array<{ userId: string; part: JamSessionPart }>,
  createdAt = new Date(),
) =>
  db.jamSessionSong.create({
    data: { name, artist: 'E2E', proposerId, createdAt, entries: { create: entries } },
  });

const presenceGroup = (page: Page, label: string) =>
  page.getByRole('region', { name: 'いまここにいる人' }).getByRole('group', { name: label });

const songRow = (page: Page, title: string) =>
  page.getByRole('button', { name: new RegExp(`^${title}`) });

test.describe('セッションページ', () => {
  // ボードは部全体で 1 つなので、テストどうしが同じ表を読み書きする。順番に流し、毎回空にしてから始める
  test.describe.configure({ mode: 'serial' });
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async () => {
    await db.jamSessionSong.deleteMany();
    await db.jamSessionParticipant.deleteMany();
  });

  test.afterAll(async () => {
    await db.jamSessionSong.deleteMany();
    await db.jamSessionParticipant.deleteMany();
    await db.$disconnect();
  });

  test('未ログインではトップへ戻される', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();

    await page.goto('/jam-session');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('link', { name: 'セッション' })).toHaveCount(0);
    await context.close();
  });

  test('ログイン中はナビゲーションに「セッション」が出る', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'ナビメニュー' }).click();

    await page.getByRole('menuitem', { name: 'セッション' }).click();

    await expect(page).toHaveURL('/jam-session');
  });

  test('参加すると「いまここにいる人」に出て、退出すると消える', async ({ page }) => {
    await page.goto('/jam-session');
    await page.getByRole('button', { name: '参加する' }).click();
    const dialog = page.getByRole('dialog', { name: '自分のパートとルーツ' });
    await dialog.getByText('Gt', { exact: true }).click();
    await dialog.getByText('ロック', { exact: true }).click();
    await dialog.getByRole('button', { name: '保存して参加する' }).click();

    const me = presenceGroup(page, 'Gt').getByRole('button', { name: LOGIN_USER.name });
    await expect(me).toBeVisible();
    await page.getByText('ルーツ', { exact: true }).click();
    await expect(
      presenceGroup(page, 'ロック').getByRole('button', { name: LOGIN_USER.name }),
    ).toBeVisible();

    await page.getByRole('button', { name: '退出する' }).click();

    await expect(page.getByRole('button', { name: LOGIN_USER.name })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '参加する' })).toBeVisible();
  });

  test('ほかのメンバーを退出させると、その人の挙手が人数から外れる', async ({ page }) => {
    await joinByDb(LOGIN_USER.id, ['guitar']);
    await joinByDb(OTHER_USER.id, ['vocal']);
    await createSongByDb('退出テストの曲', LOGIN_USER.id, [
      { userId: LOGIN_USER.id, part: 'guitar' },
      { userId: OTHER_USER.id, part: 'vocal' },
    ]);

    await page.goto('/jam-session');
    await expect(songRow(page, '退出テストの曲')).toHaveAccessibleName(/2 人$/);
    await presenceGroup(page, 'Vo').getByRole('button', { name: OTHER_USER.name }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: `${OTHER_USER.name} を退出させる` }).click();
    await dialog.getByRole('button', { name: '退出させる', exact: true }).click();

    await expect(page.getByRole('button', { name: OTHER_USER.name })).toHaveCount(0);
    await expect(songRow(page, '退出テストの曲')).toHaveAccessibleName(/1 人$/);
  });

  test('アーティスト名だけで曲を挙げると「<アーティスト名> の曲なにか」と出る', async ({
    page,
  }) => {
    await joinByDb(LOGIN_USER.id, ['vocal']);

    await page.goto('/jam-session');
    await page.getByRole('button', { name: '曲を挙げる' }).click();
    const dialog = page.getByRole('dialog', { name: '曲を挙げる' });
    await dialog.getByText('自分で入力', { exact: true }).click();
    await dialog.getByRole('textbox', { name: 'アーティスト名' }).fill('Oasis');
    await dialog.getByRole('button', { name: 'この内容で挙げる' }).click();

    await expect(songRow(page, 'Oasis の曲なにか')).toBeVisible();
    await expect(songRow(page, 'Oasis の曲なにか')).toContainText(`Vo ${LOGIN_USER.name}`);
  });

  test('片方の操作が、もう片方の画面に再読み込みなしで出る', async ({ page, browser }) => {
    await joinByDb(LOGIN_USER.id, ['vocal']);
    const otherContext = await browser.newContext({ storageState: OTHER_STORAGE_STATE });
    const otherPage = await otherContext.newPage();
    await otherPage.goto('/jam-session');
    await page.goto('/jam-session');

    await otherPage.getByRole('button', { name: '参加する' }).click();
    const profile = otherPage.getByRole('dialog', { name: '自分のパートとルーツ' });
    await profile.getByText('Dr', { exact: true }).click();
    await profile.getByRole('button', { name: '保存して参加する' }).click();

    await expect(
      presenceGroup(page, 'Dr').getByRole('button', { name: OTHER_USER.name }),
    ).toBeVisible(POLLING_TIMEOUT);

    await page.getByRole('button', { name: '曲を挙げる' }).click();
    const dialog = page.getByRole('dialog', { name: '曲を挙げる' });
    await dialog.getByText('自分で入力', { exact: true }).click();
    await dialog.getByRole('textbox', { name: 'アーティスト名' }).fill('Oasis');
    await dialog.getByRole('textbox', { name: /曲名/ }).fill('Wonderwall');
    await dialog.getByRole('button', { name: 'この内容で挙げる' }).click();

    await expect(songRow(otherPage, 'Wonderwall')).toBeVisible(POLLING_TIMEOUT);
    await otherContext.close();
  });

  test('演奏済みにした曲は一覧の下に回る', async ({ page }) => {
    await joinByDb(LOGIN_USER.id, ['vocal']);
    await createSongByDb('人が多い曲', LOGIN_USER.id, [{ userId: LOGIN_USER.id, part: 'vocal' }]);
    await createSongByDb('誰もいない曲', LOGIN_USER.id, [], new Date(Date.now() - 60_000));

    await page.goto('/jam-session');
    const rows = page.getByTestId('jam-session-song');
    await expect(rows.first()).toHaveAccessibleName(/^人が多い曲/);

    await songRow(page, '人が多い曲').click();
    await page.getByRole('dialog').getByRole('button', { name: '演奏済みにする' }).click();

    await expect(rows.first()).toHaveAccessibleName(/^誰もいない曲/);
    await expect(rows.last()).toHaveAccessibleName(/^人が多い曲/);
    await expect(rows.last()).toContainText('演奏済み');
  });

  test('ほかの人の曲は消せず、管理者は消せる', async ({ page, browser }) => {
    await joinByDb(LOGIN_USER.id, ['vocal']);
    await createSongByDb('別ユーザーの曲', OTHER_USER.id, [
      { userId: OTHER_USER.id, part: 'vocal' },
    ]);

    await page.goto('/jam-session');
    await songRow(page, '別ユーザーの曲').click();
    await expect(
      page.getByRole('dialog').getByRole('button', { name: 'この曲を削除する' }),
    ).toHaveCount(0);

    const adminContext = await browser.newContext({ storageState: ADMIN_STORAGE_STATE });
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/jam-session');
    await songRow(adminPage, '別ユーザーの曲').click();
    const dialog = adminPage.getByRole('dialog');
    await dialog.getByRole('button', { name: 'この曲を削除する' }).click();
    await dialog.getByRole('button', { name: '消す' }).click();

    await expect(songRow(adminPage, '別ユーザーの曲')).toHaveCount(0);
    await adminContext.close();
  });
});
