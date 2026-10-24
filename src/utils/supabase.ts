import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

import { env } from '@/env';

type SupabaseUser = { id: string; email?: string | null };

const SHORT_LIVED_TOKEN_MS = 5 * 60 * 1000;

// supabase.auth は使っていないので、Supabase 側にこのユーザーのアカウントは無い。
// RLS で authenticated ロールとして扱われるよう、NextAuth のユーザーに対して JWT を自前で発行する。
const signSupabaseAccessToken = (
  user: SupabaseUser,
  expires: Date,
  extraClaims: Record<string, string> = {},
) => {
  const payload = {
    ...extraClaims,
    aud: 'authenticated',
    exp: Math.floor(expires.getTime() / 1000),
    sub: user.id,
    email: user.email,
    role: 'authenticated',
  };
  return jwt.sign(payload, env.SUPABASE_JWT_SECRET);
};

const createClientWithAccessToken = (accessToken: string) =>
  createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY, {
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

/**
 * 指定したユーザーとして Storage を操作するための、サーバー専用のクライアント。
 * RLS が JWT の sub でフォルダの持ち主を判定するので、ログイン中のユーザー本人を渡すこと。
 * トークンは 5 分で切れ、ブラウザには渡さない。
 */
export const createSupabaseClientForUser = (user: SupabaseUser) =>
  createClientWithAccessToken(
    signSupabaseAccessToken(user, new Date(Date.now() + SHORT_LIVED_TOKEN_MS)),
  );

/**
 * 管理者として Storage の events バケットに書き込むための、サーバー専用のクライアント。
 * RLS は JWT の app_role で管理者かを判定するので、必ず isAdmin を確かめてから作ること。
 */
export const createSupabaseClientForAdmin = (user: SupabaseUser) =>
  createClientWithAccessToken(
    signSupabaseAccessToken(user, new Date(Date.now() + SHORT_LIVED_TOKEN_MS), {
      app_role: 'admin',
    }),
  );
