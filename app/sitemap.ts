import { MetadataRoute } from 'next';

// Only the dashboard and docs: movie/tv detail pages are noindex (personal watch log)
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trakt.sayed.app';
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/docs`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}
