import type { Session } from 'next-auth';
import type { AdapterSession, AdapterUser } from 'next-auth/adapters';

/**
 * NextAuth の session コールバックで、ブラウザに返すセッションを組み立てる。
 * データベースセッションでは DB の行（sessionToken を含む）が渡ってくるので、
 * スプレッドせずに必要な項目だけを返す。sessionToken は httpOnly の Cookie と同じ値で、
 * /api/auth/session に出すと JS から読めてしまう。
 */
export const toClientSession = ({
  session,
  user,
}: {
  session: Pick<AdapterSession, 'expires'> & { user: AdapterUser };
  user: AdapterUser;
}): Session => ({
  expires: new Date(session.expires).toISOString(),
  user: {
    ...session.user,
    id: user.id,
  },
});
