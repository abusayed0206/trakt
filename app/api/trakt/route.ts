import { NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';

export const runtime = 'edge';

const dataService = TraktDataService.getInstance();

export async function GET() {
  try {
    const index = dataService.getIndex();
    
    if (!index) {
      return NextResponse.json(
        { error: 'Index data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(index);
  } catch (error) {
    console.error('Error fetching index data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Clear cache to refresh data
    dataService.clearCache();
    
    return NextResponse.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
