import { NextRequest, NextResponse } from 'next/server';
import { TraktDataService, MovieSearchResult, ShowSearchResult } from '@/lib/services/trakt-data';
import { getImageUrl } from '@/lib/imageIndex';

const dataService = TraktDataService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type'); // 'movies', 'shows', or 'all'

    if (!query) {
      return NextResponse.json(
        { error: 'Search query parameter "q" is required' },
        { status: 400 }
      );
    }

    const results: {
      movies?: MovieSearchResult[];
      shows?: ShowSearchResult[];
    } = {};

    if (type === 'movies' || type === 'all' || !type) {
      results.movies = dataService.searchMoviesByTitle(query)
        .map((r) => ({ ...r, poster: getImageUrl('movies', 'posters', r.movie.ids.tmdb) }));
    }

    if (type === 'shows' || type === 'all' || !type) {
      results.shows = dataService.searchShowsByTitle(query)
        .map((r) => ({ ...r, poster: getImageUrl('shows', 'posters', r.show.ids.tmdb) }));
    }

    return NextResponse.json({
      query,
      type: type || 'all',
      results
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
