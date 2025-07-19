import { NextResponse } from 'next/server';

interface TraktWatchingResponse {
  expires_at: string;
  started_at: string;
  action: string;
  type: 'movie' | 'episode';
  movie?: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      imdb: string;
      tmdb: number;
      tvdb?: number;
    };
  };
  episode?: {
    season: number;
    number: number;
    title: string;
    ids: {
      trakt: number;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
  };
  show?: {
    title: string;
    year: number;
    ids: {
      trakt: number;
      slug: string;
      tvdb: number;
      imdb: string;
      tmdb: number;
    };
  };
}

interface TMDBMovieImages {
  backdrops: Array<{
    file_path: string;
    width: number;
    height: number;
  }>;
}

interface TMDBTVImages {
  backdrops: Array<{
    file_path: string;
    width: number;
    height: number;
  }>;
}

interface WatchingData {
  isWatching: boolean;
  content?: {
    type: 'movie' | 'episode';
    title: string;
    subtitle?: string;
    year: number;
    progress?: {
      started_at: string;
      expires_at: string;
      percentage?: number;
    };
    images: {
      backdrop?: string;
      backdrop_medium?: string;
      backdrop_small?: string;
    };
    ids: {
      trakt: number;
      tmdb: number;
      imdb: string;
    };
  };
}

async function fetchTraktWatching(): Promise<TraktWatchingResponse | null> {
  const traktApiKey = process.env.TRAKT_API_KEY;
  const traktUsername = process.env.TRAKT_USERNAME || 'lrs';

  if (!traktApiKey) {
    console.warn('TRAKT_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.trakt.tv/users/${traktUsername}/watching`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': traktApiKey,
      },
    });

    if (response.status === 204) {
      // No content - user is not watching anything
      return null;
    }

    if (!response.ok) {
      console.error(`Trakt API error: ${response.status} ${response.statusText}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Trakt watching data:', error);
    return null;
  }
}

async function fetchTMDBImages(tmdbId: number, type: 'movie' | 'tv'): Promise<string[]> {
  const tmdbApiKey = process.env.TMDB_API_KEY;

  if (!tmdbApiKey) {
    console.warn('TMDB_API_KEY not configured');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}/images?api_key=${tmdbApiKey}`
    );

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: TMDBMovieImages | TMDBTVImages = await response.json();
    
    // Get the best quality backdrops
    const backdrops = data.backdrops
      .sort((a, b) => b.width - a.width) // Sort by width descending
      .slice(0, 3) // Take top 3
      .map(backdrop => {
        const tmdbUrl = `https://image.tmdb.org/t/p/w1280${backdrop.file_path}`;
        // Add wsrv proxy with 24 day cache (24 * 24 * 3600 = 2,073,600 seconds)
        return `https://wsrv.nl/?url=${encodeURIComponent(tmdbUrl)}&maxage=14d`;
      });

    return backdrops;
  } catch (error) {
    console.error('Error fetching TMDB images:', error);
    return [];
  }
}

export async function GET(): Promise<NextResponse<WatchingData>> {
  try {
    const watchingData = await fetchTraktWatching();

    if (!watchingData) {
      return NextResponse.json({
        isWatching: false,
      });
    }

    // Determine content type and get appropriate TMDB images
    let tmdbId: number;
    let contentType: 'movie' | 'tv';
    let title: string;
    let subtitle: string | undefined;
    let year: number;
    let traktId: number;
    let imdbId: string;

    if (watchingData.type === 'movie' && watchingData.movie) {
      tmdbId = watchingData.movie.ids.tmdb;
      contentType = 'movie';
      title = watchingData.movie.title;
      year = watchingData.movie.year;
      traktId = watchingData.movie.ids.trakt;
      imdbId = watchingData.movie.ids.imdb;
    } else if (watchingData.type === 'episode' && watchingData.show && watchingData.episode) {
      tmdbId = watchingData.show.ids.tmdb;
      contentType = 'tv';
      title = watchingData.show.title;
      subtitle = `S${watchingData.episode.season}E${watchingData.episode.number} - ${watchingData.episode.title}`;
      year = watchingData.show.year;
      traktId = watchingData.show.ids.trakt;
      imdbId = watchingData.show.ids.imdb;
    } else {
      return NextResponse.json({
        isWatching: false,
      });
    }

    // Fetch images from TMDB
    const backdrops = await fetchTMDBImages(tmdbId, contentType);

    // Calculate progress percentage if possible
    let progressPercentage: number | undefined;
    if (watchingData.started_at && watchingData.expires_at) {
      const startTime = new Date(watchingData.started_at).getTime();
      const endTime = new Date(watchingData.expires_at).getTime();
      const currentTime = Date.now();
      
      if (currentTime >= startTime && currentTime <= endTime) {
        const totalDuration = endTime - startTime;
        const elapsed = currentTime - startTime;
        progressPercentage = Math.round((elapsed / totalDuration) * 100);
      }
    }

    const result: WatchingData = {
      isWatching: true,
      content: {
        type: watchingData.type,
        title,
        subtitle,
        year,
        progress: {
          started_at: watchingData.started_at,
          expires_at: watchingData.expires_at,
          percentage: progressPercentage,
        },
        images: {
          backdrop: backdrops[0] || undefined,
          backdrop_medium: backdrops[1] || undefined,
          backdrop_small: backdrops[2] || undefined,
        },
        ids: {
          trakt: traktId,
          tmdb: tmdbId,
          imdb: imdbId,
        },
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in watching API:', error);
    return NextResponse.json(
      {
        isWatching: false,
      },
      { status: 500 }
    );
  }
}
