import type { MetadataRoute } from 'next';
import { APP_NAME } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — Renewed Hope. Stronger Nigeria.`,
    short_name: 'TSG',
    description:
      'A nationwide movement standing with President Bola Ahmed Tinubu to advance the Renewed Hope agenda for a stronger Nigeria.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0a4d2e',
    categories: ['politics', 'social', 'news'],
    lang: 'en-NG',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
