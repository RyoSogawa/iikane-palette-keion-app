import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

import { env } from '@/env';

import type { cookies } from 'next/headers';

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieSetArgs = Parameters<CookieStore['set']>;

export const createSupabaseServerClient = (
  cookieStore: CookieStore,
  supabaseAccessToken?: string,
) => {
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(...([{ name, value, ...options }] as CookieSetArgs));
          });
        } catch {
          // supabase.auth を使わず NextAuth の JWT を Authorization ヘッダーで渡しているため、
          // setAll は auth のセッション更新時にしか呼ばれず、失敗しても影響しない。
        }
      },
    },
  });
};

type SupabaseUser = { id: string; email?: string | null };

/**
 * Supabase の RLS で authenticated ロールとして扱われる JWT を、NextAuth のユーザーに対して発行する。
 * supabase.auth は使っていないので、Supabase 側にこのユーザーのアカウントは無い。
 */
export const signSupabaseAccessToken = (user: SupabaseUser, expires: Date) => {
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(expires.getTime() / 1000),
    sub: user.id,
    email: user.email,
    role: 'authenticated',
  };
  return jwt.sign(payload, env.SUPABASE_JWT_SECRET);
};

const SHORT_LIVED_TOKEN_MS = 5 * 60 * 1000;

/**
 * リクエストの Cookie もセッションも無いところ（サインアップ時のイベントや移行スクリプト）から、
 * 指定したユーザーとして Storage を操作するためのクライアント。トークンは 5 分で切れる。
 */
export const createSupabaseClientForUser = (user: SupabaseUser) => {
  const accessToken = signSupabaseAccessToken(user, new Date(Date.now() + SHORT_LIVED_TOKEN_MS));
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
