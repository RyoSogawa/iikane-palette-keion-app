import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { PrismaClient } from '@prisma/client';

import { LOGIN_USER, OTHER_USER, STORAGE_STATE } from './fixtures/test-users';

import type { FullConfig } from '@playwright/test';

const LOCAL_HOSTS = ['localhost', '127.0.0.1'];

/**
 * Discord の OAuth は自動化できないので、テスト用ユーザーと Session を DB に直接作り、
 * その sessionToken を Cookie に入れた storageState を書き出してログイン状態を再現する。
 * DB に書き込むため、DATABASE_URL がローカルを向いていないときは止める。
 */
export default async function globalSetup(config: FullConfig) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !LOCAL_HOSTS.includes(new URL(databaseUrl).hostname)) {
    throw new Error('E2E はローカルの DB でしか動かせません。DATABASE_URL を確認してください');
  }

  const db = new PrismaClient();
  try {
    const userFields = {
      image: null,
      nickname: '',
      residence: '',
      introduction: '',
      twitterUsername: '',
      instagramUsername: '',
      musicLink: '',
      podcastLink: '',
      websiteLink: '',
    };
    await db.user.upsert({
      where: { id: LOGIN_USER.id },
      create: { id: LOGIN_USER.id, name: LOGIN_USER.name, email: LOGIN_USER.email, ...userFields },
      update: { name: LOGIN_USER.name, ...userFields },
    });
    await db.user.upsert({
      where: { id: OTHER_USER.id },
      create: { id: OTHER_USER.id, name: OTHER_USER.name, email: OTHER_USER.email, ...userFields },
      update: { name: OTHER_USER.name, ...userFields },
    });

    const expires = new Date('2099-12-31T00:00:00Z');
    await db.session.upsert({
      where: { sessionToken: LOGIN_USER.sessionToken },
      create: { sessionToken: LOGIN_USER.sessionToken, userId: LOGIN_USER.id, expires },
      update: { userId: LOGIN_USER.id, expires },
    });
  } finally {
    await db.$disconnect();
  }

  const baseURL = config.projects[0]?.use.baseURL;
  if (!baseURL) {
    throw new Error('playwright.config.ts に baseURL がありません');
  }
  const storageState = {
    cookies: [
      {
        // http の localhost では __Secure- の付かない名前になる
        name: 'authjs.session-token',
        value: LOGIN_USER.sessionToken,
        domain: new URL(baseURL).hostname,
        path: '/',
        expires: -1,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax' as const,
      },
    ],
    origins: [],
  };
  mkdirSync(dirname(STORAGE_STATE), { recursive: true });
  writeFileSync(STORAGE_STATE, JSON.stringify(storageState, null, 2));
}
