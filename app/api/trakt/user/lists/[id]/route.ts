import { NextRequest, NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';
import { getImageUrl } from '@/lib/imageIndex';
import type { ListItem } from '@/lib/types';

const dataService = TraktDataService.getInstance();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    const listItems = dataService.getListItems(id);
    
    if (!listItems) {
      return NextResponse.json(
        { error: `List items not found for ID: ${id}` },
        { status: 404 }
      );
    }

    // Resolve poster URLs here so clients don't need one /api/images call per item
    const data = (listItems.data as ListItem[]).map((item) => {
      const media = item.movie ?? item.show;
      return {
        ...item,
        poster: media ? getImageUrl(item.movie ? 'movies' : 'shows', 'posters', media.ids.tmdb) : null,
      };
    });

    return NextResponse.json({ ...listItems, data });
  } catch (error) {
    console.error('Error fetching list items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
