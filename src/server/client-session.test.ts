import { describe, expect, it } from 'vitest';

import { toClientSession } from './client-session';

const user = {
  id: 'user-1',
  name: 'sogawa',
  email: 'user-1@example.com',
  emailVerified: null,
  image: 'http://supabase.test/storage/v1/object/public/profiles/user-1/avatar1.png',
  isAdmin: false,
};
const expires = new Date('2026-11-22T00:00:00.000Z');

describe('toClientSession', () => {
  it('DB のセッションの行（sessionToken など）を含めない', () => {
    const session = {
      sessionToken: 'secret-token',
      userId: 'user-1',
      id: 'session-1',
      expires,
      user,
    };

    const result = toClientSession({ session, user });

    expect(result).not.toHaveProperty('sessionToken');
    expect(result).not.toHaveProperty('userId');
    expect(result).not.toHaveProperty('id');
    expect(JSON.stringify(result)).not.toContain('secret-token');
  });

  it('ユーザー情報と有効期限を返す', () => {
    const session = { sessionToken: 'secret-token', userId: 'user-1', expires, user };

    const result = toClientSession({ session, user });

    expect(result).toEqual({
      expires: expires.toISOString(),
      user: { ...user, id: 'user-1' },
    });
  });

  it('管理者フラグは session.user ではなく DB の User 行から取る', () => {
    const session = {
      sessionToken: 'secret-token',
      userId: 'user-1',
      expires,
      user: { ...user, isAdmin: false },
    };

    const result = toClientSession({ session, user: { ...user, isAdmin: true } });

    expect(result.user.isAdmin).toBe(true);
  });
});
