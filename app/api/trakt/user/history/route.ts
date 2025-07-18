import { NextRequest, NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';

export const runtime = 'edge';

const dataService = TraktDataService.getInstance();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'movies', 'shows', or 'all'

    if (type === 'movies') {
      const data = dataService.getUserHistoryMovies();
      if (!data) {
        return NextResponse.json(
          { error: 'Movie history not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(data);
    }

    if (type === 'shows') {
      const data = dataService.getUserHistoryShows();
      if (!data) {
        return NextResponse.json(
          { error: 'Show history not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(data);
    }

    // Default: return all history
    const data = dataService.getUserHistoryAll();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
