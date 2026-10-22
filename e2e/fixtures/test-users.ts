export const STORAGE_STATE = 'e2e/.auth/user.json';

/** ログイン済みとして扱う E2E 用ユーザー。Session を DB に直接作ってログインを再現する */
export const LOGIN_USER = {
  id: 'e2e-login-user',
  name: 'E2E ログインユーザー',
  email: 'e2e-login-user@example.com',
  sessionToken: 'e2e-login-user-session-token',
} as const;

/** 他人のプロフィール編集を拒否できるかを確かめるための、ログインしないユーザー */
export const OTHER_USER = {
  id: 'e2e-other-user',
  name: 'E2E 別ユーザー',
  email: 'e2e-other-user@example.com',
} as const;
