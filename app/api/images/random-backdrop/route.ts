import { NextResponse } from 'next/server';
import ImageIndexManager from '@/lib/imageIndex';

const CDN_BASE_URL = 'https://cfcdn.sayed.app/watch/';
const WSRV_BASE = 'https://wsrv.nl';

export async function GET() {
  try {
    const imageManager = ImageIndexManager.getInstance();
    const index = imageManager.loadImageIndex();
    
    // Get all backdrop collections (movies and shows)
    const movieBackdrops = Object.keys(index.movies.backdrops);
    const showBackdrops = Object.keys(index.shows.backdrops);
    
    // Combine all available TMDb IDs that have backdrops
    const allBackdropIds = [...movieBackdrops, ...showBackdrops];
    
    if (allBackdropIds.length === 0) {
      return NextResponse.json({ 
        error: 'No backdrop images found' 
      }, { status: 404 });
    }
    
    // Pick a random TMDb ID
    const randomId = allBackdropIds[Math.floor(Math.random() * allBackdropIds.length)];
    
    // Determine if it's a movie or show
    const isMovie = movieBackdrops.includes(randomId);
    const type = isMovie ? 'movies' : 'shows';
    
    // Get the backdrop files for this ID
    const backdropFiles = index[type].backdrops[randomId];
    
    if (!backdropFiles || backdropFiles.length === 0) {
      return NextResponse.json({ 
        error: 'No backdrop files found for selected ID' 
      }, { status: 404 });
    }
    
    // Pick a random backdrop file
    const randomFile = backdropFiles[Math.floor(Math.random() * backdropFiles.length)];
    
    // Build CDN URL
    const cdnUrl = `${CDN_BASE_URL}${type}/backdrops/${randomFile}`;
    
    // Build wsrv.nl URL with optimizations for fullscreen background
    const wsrvUrl = `${WSRV_BASE}/?url=${encodeURIComponent(cdnUrl)}&w=1920&h=1080&fit=cover&output=webp&q=85&maxage=14d`;
    
    // Return the URL instead of redirecting so we can use it in background-image
    return NextResponse.json({
      url: wsrvUrl,
      tmdbId: randomId,
      type,
      filename: randomFile
    });

  } catch (error) {
    console.error('Error in random backdrop API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
