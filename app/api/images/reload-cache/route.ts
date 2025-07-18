import { NextResponse } from 'next/server';
import ImageIndexManager from '@/lib/imageIndex';

export const runtime = 'edge';

export async function POST() {
  try {
    const imageManager = ImageIndexManager.getInstance();
    const newIndex = imageManager.reloadIndex();
    
    return NextResponse.json({
      success: true,
      message: 'Image index reloaded successfully',
      stats: {
        moviePosters: Object.keys(newIndex.movies.posters).length,
        movieBackdrops: Object.keys(newIndex.movies.backdrops).length,
        showPosters: Object.keys(newIndex.shows.posters).length,
        showBackdrops: Object.keys(newIndex.shows.backdrops).length,
        seasonPosters: Object.keys(newIndex.shows.season_posters).length,
        thumbnailPosters: Object.keys(newIndex.thumbnails.posters || {}).length,
        thumbnailBackdrops: Object.keys(newIndex.thumbnails.backdrops || {}).length
      }
    });
  } catch (error) {
    console.error('Error reloading image index:', error);
    return NextResponse.json(
      { error: 'Failed to reload image index' },
      { status: 500 }
    );
  }
}
