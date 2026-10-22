import { existsSync } from 'node:fs';

import { defineConfig, devices } from '@playwright/test';

import { STORAGE_STATE } from './e2e/fixtures/test-users';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

// 他の worktree で動いている 3000 番の dev サーバーを reuseExistingServer で拾わないように番号をずらす
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL,
    storageState: STORAGE_STATE,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // error.tsx が error.message を表示するのは dev だけなので、本番ビルドではなく dev で動かす
    command: `pnpm dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      NEXTAUTH_URL: baseURL,
    },
  },
});
