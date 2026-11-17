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

    // 畳んだ本文は overflow: hidden で切っているだけで toBeVisible では見分けられないので、本文の直下にあるボタンの位置で本文の高さの変化を見る
    const more = page.getByRole('button', { name: '続きを読む' });
    const close = page.getByRole('button', { name: '閉じる' });
    const topOf = async (locator: typeof more) => (await locator.boundingBox())?.y ?? 0;
    const collapsedTop = await topOf(more);

    await more.click();
    await expect(close).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => topOf(close)).toBeGreaterThan(collapsedTop + 50);

    await close.click();
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => topOf(more)).toBe(collapsedTop);
  });

  test('短いプロフィール文には「続きを読む」が出ず、My Best Songs が無ければ見出しも出ない', async ({
    page,
  }) => {
    await page.goto(`/members/${PROFILE_SHORT_USER.id}/profile`);

    await expect(page.getByText(SHORT_INTRO)).toBeVisible();
    await expect(page.locator('.ProseMirror')).toHaveCount(1);
    // 「無いこと」の確認は表示途中でも通ってしまうので、My Best Songs の読み込みが終わるまで待つ
    await expect(page.getByLabel('My Best Songs を読み込み中')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '続きを読む' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'My Best Songs' })).toHaveCount(0);
  });

  test('プロフィール文も My Best Songs も無ければ、どちらも表示しない', async ({ page }) => {
    await page.goto(`/members/${PROFILE_EMPTY_USER.id}/profile`);

    await expect(page.getByRole('heading', { name: PROFILE_EMPTY_USER.name })).toBeVisible();
    await expect(page.getByLabel('My Best Songs を読み込み中')).toHaveCount(0);
    // 空の段落だけのプロフィール文でもエディタを描画しない。短文ユーザーでは 1 件あることを確かめているので、セレクタが外れれば気づける
    await expect(page.locator('.ProseMirror')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'My Best Songs' })).toHaveCount(0);
  });

  test('以前の My Best Songs の URL はプロフィールページに転送される', async ({ page }) => {
    await page.goto(`/members/${PROFILE_FULL_USER.id}/my-best-songs`);

    await expect(page).toHaveURL(`/members/${PROFILE_FULL_USER.id}/profile`);
    await expect(page.getByRole('heading', { name: 'My Best Songs' })).toBeVisible();
  });
});
