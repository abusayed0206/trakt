import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import ImageIndexManager from '@/lib/imageIndex';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'movies' or 'shows'
    const category = searchParams.get('category'); // 'posters' or 'backdrops'
    const tmdbId = searchParams.get('tmdb_id');
    const season = searchParams.get('season');

    // Handle thumbnail requests
    if (category && tmdbId && !type) {
      return handleThumbnailRequest(category, tmdbId);
    }

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

    // If there's only one image, serve it directly as bytes
    if (result.files.length === 1) {
      return serveImageBytes(result.basePath, result.files[0]);
    }

    // If multiple images, return the first one by default
    // You could add an 'index' parameter to select which image
    return serveImageBytes(result.basePath, result.files[0]);

  } catch (error) {
    console.error('Error in images API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleThumbnailRequest(category: string, tmdbId: string) {
  if (category !== 'posters' && category !== 'backdrops') {
    return NextResponse.json({ 
      error: 'Invalid category. Must be "posters" or "backdrops"' 
    }, { status: 400 });
  }

  const imageManager = ImageIndexManager.getInstance();
  const result = imageManager.findThumbnails(category as 'posters' | 'backdrops', tmdbId);

  if (result.files.length === 0) {
    return NextResponse.json({ 
      error: 'No thumbnail found for the specified parameters' 
    }, { status: 404 });
  }

  return serveImageBytes(result.basePath, result.files[0]);
}

function serveImageBytes(basePath: string, filename: string) {
  try {
    const fullImagePath = join(process.cwd(), 'public', 'data', 'imgs', basePath, filename);
    
    if (!existsSync(fullImagePath)) {
      return NextResponse.json({ error: 'Image file not found' }, { status: 404 });
    }

    // Read the image file
    const imageBuffer = readFileSync(fullImagePath);
    
    // Determine content type based on file extension
    const extension = filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (extension) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        contentType = 'image/jpeg';
        break;
    }

    // Return the image with appropriate headers for caching
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'ETag': `"${basePath}/${filename}"`,
        'Last-Modified': new Date().toUTCString(),
      },
    });

  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
