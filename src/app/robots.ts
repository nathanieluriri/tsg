import type { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/dashboard/',
        '/api/',
        '/login',
        '/secure-otp',
        '/new-password',
        '/forgot-password',
        '/verify-account',
        '/search',
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
    host: APP_URL,
  };
}
