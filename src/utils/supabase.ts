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
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(...([{ name, value, ...options }] as CookieSetArgs));
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set(...([{ name, value: '', ...options }] as CookieSetArgs));
        } catch {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};
