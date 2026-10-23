import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    env: {
      // src/env.js の検証はテストでは不要。STORAGE_PATH の組み立てに使う値だけ渡す
      SKIP_ENV_VALIDATION: '1',
      NEXT_PUBLIC_SUPABASE_URL: 'http://supabase.test',
    },
  },
});
