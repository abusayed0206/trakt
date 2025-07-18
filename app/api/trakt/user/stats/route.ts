import { NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';

const dataService = TraktDataService.getInstance();

export async function GET() {
  try {
    const stats = dataService.getUserStats();
    
    if (!stats) {
      return NextResponse.json(
        { error: 'User stats not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
