import { type MetadataRoute } from 'next';

import { SITE_NAME } from '@/constants/site-info';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: 'ぱおん',
    description: 'いいかねパレット軽音部のポータルサイトです。',
    start_url: '/',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/favicon/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#242424',
    background_color: '#242424',
    display: 'standalone',
  };
}
