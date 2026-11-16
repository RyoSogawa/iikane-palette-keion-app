import { expect, test } from '@playwright/test';

import { LONG_INTRO_FIRST, PROFILE_SONGS, SHORT_INTRO } from './fixtures/profile-view';
import { PROFILE_EMPTY_USER, PROFILE_FULL_USER, PROFILE_SHORT_USER } from './fixtures/test-users';

test.describe('プロフィールの閲覧', () => {
  test('タブも Profile の見出しも無く、プロフィール文と My Best Songs が同じページに出る', async ({
    page,
  }) => {
    await page.goto(`/members/${PROFILE_FULL_USER.id}/profile`);

    await expect(page.getByRole('heading', { name: PROFILE_FULL_USER.name })).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Profile' })).toHaveCount(0);
    await expect(page.getByText(LONG_INTRO_FIRST)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'My Best Songs' })).toBeVisible();

    await page.getByLabel('リスト').click();
    // リストは react-virtuoso で画面に入った行しか描画せず、描画範囲はスクロールイベントで決め直すので、実際にスクロールして下端まで見せる
    await page.mouse.wheel(0, 2000);
    for (const song of PROFILE_SONGS) {
      await expect(page.getByText(song.name)).toBeVisible();
    }
  });

  test('長いプロフィール文は「続きを読む」で開き、「閉じる」で畳める', async ({ page }) => {
    await page.goto(`/members/${PROFILE_FULL_USER.id}/profile`);
    await expect(page.getByText(LONG_INTRO_FIRST)).toBeVisible();

    await page.getByRole('button', { name: '続きを読む' }).click();
    await expect(page.getByRole('button', { name: '閉じる' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await page.getByRole('button', { name: '閉じる' }).click();
    await expect(page.getByRole('button', { name: '続きを読む' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  test('短いプロフィール文には「続きを読む」が出ず、My Best Songs が無ければ見出しも出ない', async ({
    page,
  }) => {
    await page.goto(`/members/${PROFILE_SHORT_USER.id}/profile`);

    await expect(page.getByText(SHORT_INTRO)).toBeVisible();
    // 「無いこと」の確認は表示途中でも通ってしまうので、My Best Songs の読み込みが終わるまで待つ
    await expect(page.getByLabel('My Best Songs を読み込み中')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '続きを読む' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'My Best Songs' })).toHaveCount(0);
  });

  test('プロフィール文も My Best Songs も無ければ、どちらの見出しも出ない', async ({ page }) => {
    await page.goto(`/members/${PROFILE_EMPTY_USER.id}/profile`);

    await expect(page.getByRole('heading', { name: PROFILE_EMPTY_USER.name })).toBeVisible();
    await expect(page.getByLabel('My Best Songs を読み込み中')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Profile' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'My Best Songs' })).toHaveCount(0);
  });

  test('以前の My Best Songs の URL はプロフィールページに転送される', async ({ page }) => {
    await page.goto(`/members/${PROFILE_FULL_USER.id}/my-best-songs`);

    await expect(page).toHaveURL(`/members/${PROFILE_FULL_USER.id}/profile`);
    await expect(page.getByRole('heading', { name: 'My Best Songs' })).toBeVisible();
  });
});
