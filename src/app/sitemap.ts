import type { MetadataRoute } from 'next';
import { APP_URL } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, freq: 'daily' },
    { path: '/about', priority: 0.8, freq: 'monthly' },
    { path: '/pbat', priority: 0.8, freq: 'weekly' },
    { path: '/blog', priority: 0.8, freq: 'daily' },
    { path: '/events', priority: 0.7, freq: 'weekly' },
    { path: '/fg-ministries', priority: 0.6, freq: 'monthly' },
    { path: '/faq', priority: 0.6, freq: 'monthly' },
    { path: '/contact', priority: 0.6, freq: 'yearly' },
    { path: '/register', priority: 0.9, freq: 'monthly' },
    { path: '/group-reg', priority: 0.7, freq: 'monthly' },
    { path: '/nationals', priority: 0.5, freq: 'monthly' },
    { path: '/sub-nationals', priority: 0.5, freq: 'monthly' },
    { path: '/region', priority: 0.5, freq: 'monthly' },
  ];

  return routes.map(({ path, priority, freq }) => ({
    url: `${APP_URL}${path}`,
    lastModified: now,
    changeFrequency: freq,
    priority,
  }));
}
