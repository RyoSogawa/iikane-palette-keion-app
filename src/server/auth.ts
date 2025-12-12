import { PrismaAdapter } from '@auth/prisma-adapter';
import { sign } from 'jsonwebtoken';
import NextAuth, { type DefaultSession } from 'next-auth';
import Discord from 'next-auth/providers/discord';

import { IIKANE_GUILD_ID } from '@/constants/external-service';
import { env } from '@/env';
import { db } from '@/server/db';
import { isJoiningGuild } from '@/utils/discord';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    supabaseAccessToken: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  theme: {
    colorScheme: 'dark',
  },
  callbacks: {
    redirect: () => {
      return '/members?login-callback=true';
    },
    session: async ({ session, user }) => {
      const payload = {
        aud: 'authenticated',
        exp: Math.floor(new Date(session.expires).getTime() / 1000),
        sub: user.id,
        email: user.email,
        role: 'authenticated',
      };
      const supabaseAccessToken = sign(payload, env.SUPABASE_JWT_SECRET);
      return {
        ...session,
        supabaseAccessToken,
        user: {
          ...session.user,
          id: user.id,
        },
      };
    },
    signIn: async ({ account }) => {
      if (account?.access_token == null) return false;
      return isJoiningGuild(account.access_token, IIKANE_GUILD_ID);
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    Discord({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify email guilds',
        },
      },
    }),
  ],
});

export const getServerAuthSession = () => auth();
