import 'server-only';

import { cache } from 'react';

import { headers } from 'next/headers';

import { appRouter } from '@/server/api/root';
import { createCallerFactory, createTRPCContext } from '@/server/api/trpc';

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set('x-trpc-source', 'rsc');

  return createTRPCContext({
    headers: heads,
  });
});

const createCaller = createCallerFactory(appRouter);

export const api = cache(async () => {
  const ctx = await createContext();
  return createCaller(ctx);
});
