import { NextRequest, NextResponse } from 'next/server';
import ImageIndexManager from '@/lib/imageIndex';

const CDN_BASE_URL = 'https://cfcdn.sayed.app/watch/';
const WSRV_BASE = 'https://wsrv.nl';

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

    const imageManager = ImageIndexManager.getInstance();
    const result = imageManager.findImages(type, category, tmdbId, season || undefined);

    if (result.files.length === 0) {
      return NextResponse.json({ 
        error: 'No images found for the specified parameters' 
      }, { status: 404 });
    }

    // Build CDN URL
    const filename = result.files[0]; // Use first file if multiple
    const cdnUrl = `${CDN_BASE_URL}${result.basePath}/${filename}`;
    
    // Build wsrv.nl URL with optimizations
    const wsrvUrl = `${WSRV_BASE}/?url=${encodeURIComponent(cdnUrl)}&w=400&output=webp&q=90&maxage=31d`;
    
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
