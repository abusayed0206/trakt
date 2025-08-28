import { NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';

 

const dataService = TraktDataService.getInstance();

export async function GET() {
  try {
    const comments = dataService.getUserComments();
    
    if (!comments) {
      return NextResponse.json(
        { error: 'User comments not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching user comments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
