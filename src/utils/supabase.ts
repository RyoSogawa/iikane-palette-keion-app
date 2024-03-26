import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createBrowserClient } from '@supabase/ssr';

import { env } from '@/env';

import type { cookies } from 'next/headers';

export const createSupabaseServerClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};

export const createSupabaseBrowserClient = () =>
  createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_ANON_KEY);
