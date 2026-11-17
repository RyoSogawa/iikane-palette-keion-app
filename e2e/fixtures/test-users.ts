export const STORAGE_STATE = 'e2e/.auth/user.json';

/** ログイン済みとして扱う E2E 用ユーザー。Session を DB に直接作ってログインを再現する */
export const LOGIN_USER = {
  id: 'e2e-login-user',
  name: 'E2E ログインユーザー',
  email: 'e2e-login-user@example.com',
  sessionToken: 'e2e-login-user-session-token',
} as const;

export const OTHER_STORAGE_STATE = 'e2e/.auth/other.json';

/** 他人の画面・操作を確かめるためのユーザー。セッションページでは 2 人目のメンバーとしてログインする */
export const OTHER_USER = {
  id: 'e2e-other-user',
  name: 'E2E 別ユーザー',
  email: 'e2e-other-user@example.com',
  sessionToken: 'e2e-other-user-session-token',
} as const;

export const ADMIN_STORAGE_STATE = 'e2e/.auth/admin.json';

/** 管理画面を操作する E2E 用の管理者 */
export const ADMIN_USER = {
  id: 'e2e-admin-user',
  name: 'E2E 管理者',
  email: 'e2e-admin-user@example.com',
  sessionToken: 'e2e-admin-user-session-token',
} as const;

/** プロフィールの閲覧側を確かめるユーザー。長いプロフィール文と My Best Songs を持たせる。ログインはしない */
export const PROFILE_FULL_USER = {
  id: 'e2e-profile-full-user',
  name: 'E2E プロフィール長文ユーザー',
  email: 'e2e-profile-full-user@example.com',
} as const;

/** プロフィールの閲覧側を確かめるユーザー。短いプロフィール文だけで My Best Songs は持たない。ログインはしない */
export const PROFILE_SHORT_USER = {
  id: 'e2e-profile-short-user',
  name: 'E2E プロフィール短文ユーザー',
  email: 'e2e-profile-short-user@example.com',
} as const;

/** プロフィールの閲覧側を確かめるユーザー。エディタで入力して消したあとの空のプロフィール文だけを持つ。ログインはしない */
export const PROFILE_EMPTY_USER = {
  id: 'e2e-profile-empty-user',
  name: 'E2E プロフィール空ユーザー',
  email: 'e2e-profile-empty-user@example.com',
} as const;
