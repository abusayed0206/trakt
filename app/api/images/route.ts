import { NextRequest, NextResponse } from 'next/server';
import { getImageUrl } from '@/lib/imageIndex';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'movies' or 'shows'
    const category = searchParams.get('category'); // 'posters' or 'backdrops'
    const tmdbId = searchParams.get('tmdb_id');
    const season = searchParams.get('season');

    if (!type || !category || !tmdbId) {
      return NextResponse.json({
        error: 'Missing required parameters: type, category, and tmdb_id are required'
      }, { status: 400 });
    }

    if (type !== 'movies' && type !== 'shows') {
      return NextResponse.json({
        error: 'Invalid type. Must be "movies" or "shows"'
      }, { status: 400 });
    }

    if (category !== 'posters' && category !== 'backdrops') {
      return NextResponse.json({
        error: 'Invalid category. Must be "posters" or "backdrops"'
      }, { status: 400 });
    }

    const wsrvUrl = getImageUrl(type, category, tmdbId, { season: season ?? undefined });

    if (!wsrvUrl) {
      return NextResponse.json({
        error: 'No images found for the specified parameters'
      }, { status: 404 });
    }

    // Redirect to wsrv.nl
    return NextResponse.redirect(wsrvUrl, 302);

  } catch (error) {
    console.error('Error in images API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
