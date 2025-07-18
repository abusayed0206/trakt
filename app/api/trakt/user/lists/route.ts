import { NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';

const dataService = TraktDataService.getInstance();

export async function GET() {
  try {
    const lists = dataService.getUserLists();
    
    if (!lists) {
      return NextResponse.json(
        { error: 'User lists not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching user lists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
