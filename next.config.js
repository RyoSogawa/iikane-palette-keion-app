/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  // プロフィールページのタブをやめて My Best Songs も /profile に出すようにしたので、共有済みの旧 URL を恒久的に転送する。
  // ページで redirect() すると layout の DB 取得が走ってから 307 になるので、ここで返す
  async redirects() {
    return [
      {
        source: '/members/:userId/my-best-songs',
        destination: '/members/:userId/profile',
        permanent: true,
      },
    ];
  },
};

export default config;
