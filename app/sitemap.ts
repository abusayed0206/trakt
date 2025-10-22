import { MetadataRoute } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

interface WatchedMovie {
  movie: {
    ids: {
      tmdb: number;
    };
  };
  last_watched_at: string;
}

interface WatchedShow {
  show: {
    ids: {
      tmdb: number;
    };
  };
  last_watched_at: string;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://trakt.sayed.app';

  // Read watched movies data
  const moviesPath = join(process.cwd(), 'public/data/json/user/watched/movies.json');
  const moviesData = JSON.parse(readFileSync(moviesPath, 'utf-8'));
  const watchedMovies: WatchedMovie[] = moviesData.data || [];

  // Read watched shows data
  const showsPath = join(process.cwd(), 'public/data/json/user/watched/shows.json');
  const showsData = JSON.parse(readFileSync(showsPath, 'utf-8'));
  const watchedShows: WatchedShow[] = showsData.data || [];

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Add movie routes
  const movieRoutes = watchedMovies.map((item) => ({
    url: `${baseUrl}/movie/${item.movie.ids.tmdb}`,
    lastModified: new Date(item.last_watched_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add TV show routes
  const showRoutes = watchedShows.map((item) => ({
    url: `${baseUrl}/tv/${item.show.ids.tmdb}`,
    lastModified: new Date(item.last_watched_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...routes, ...movieRoutes, ...showRoutes];
}
