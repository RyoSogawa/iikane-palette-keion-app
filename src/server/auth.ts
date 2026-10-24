import { PrismaAdapter } from '@auth/prisma-adapter';
import NextAuth, { type DefaultSession } from 'next-auth';
import Discord from 'next-auth/providers/discord';

import { IIKANE_GUILD_ID } from '@/constants/external-service';
import { env } from '@/env';
import { AvatarStorageService } from '@/server/applications/services/avatar-storage.service';
import { ImportDiscordAvatarService } from '@/server/applications/services/import-discord-avatar.service';
import { toClientSession } from '@/server/client-session';
import { db } from '@/server/db';
import { isJoiningGuild } from '@/utils/discord';
import { createSupabaseClientForUser } from '@/utils/supabase';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/adapters' {
  interface AdapterUser {
    isAdmin: boolean;
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
    session: async ({ session, user }) => toClientSession({ session, user }),
    signIn: async ({ account }) => {
      if (account?.access_token == null) return false;
      return isJoiningGuild(account.access_token, IIKANE_GUILD_ID);
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.id) return;
      const avatarStorage = new AvatarStorageService(
        createSupabaseClientForUser({ id: user.id, email: user.email }),
      );
      const importDiscordAvatar = new ImportDiscordAvatarService(avatarStorage, (id, image) =>
        db.user.update({ where: { id }, data: { image } }),
      );
      try {
        await importDiscordAvatar.invoke({ id: user.id, image: user.image ?? null });
      } catch (error) {
        // コピーに失敗しても Discord の URL のままサインアップは続ける。ここで投げるとログインできなくなる
        console.error('Failed to import Discord avatar on sign-up:', error);
      }
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    Discord({
      // Discord がコールバックに iss=https://discord.com を付けるようになった。
      // issuer を指定しないと Auth.js が仮の https://authjs.dev と比較して CallbackRouteError になる
      issuer: 'https://discord.com',
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
