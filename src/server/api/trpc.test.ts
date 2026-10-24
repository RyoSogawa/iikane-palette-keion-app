import { describe, expect, it, vi } from 'vitest';

import { adminProcedure, createCallerFactory, createTRPCRouter } from './trpc';

import type { Session } from 'next-auth';

vi.mock('@/server/auth', () => ({ getServerAuthSession: vi.fn() }));
vi.mock('@/server/db', () => ({ db: {} }));

const router = createTRPCRouter({
  ping: adminProcedure.query(() => 'pong'),
});
const createCaller = createCallerFactory(router);

const sessionOf = (isAdmin: boolean): Session => ({
  expires: '2099-12-31T00:00:00.000Z',
  user: { id: 'user-1', isAdmin },
});

const callWith = (session: Session | null) =>
  createCaller({ db: {} as never, session, headers: new Headers() }).ping();

describe('adminProcedure', () => {
  it('未ログインは UNAUTHORIZED', async () => {
    await expect(callWith(null)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('管理者でないユーザーは FORBIDDEN', async () => {
    await expect(callWith(sessionOf(false))).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('管理者は呼べる', async () => {
    await expect(callWith(sessionOf(true))).resolves.toBe('pong');
  });
});
