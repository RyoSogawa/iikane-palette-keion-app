import { createServerClient, type CookieOptions } from '@supabase/ssr';

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
