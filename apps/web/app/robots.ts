import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/resume/', '/jobs/', '/tracker/', '/referrals/', '/outreach/', '/interviews/', '/linkedin/', '/settings/', '/upgrade/', '/admin/'],
      },
    ],
    sitemap: 'https://placeai.in/sitemap.xml',
  };
}
