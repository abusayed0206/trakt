import { NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';

const dataService = TraktDataService.getInstance();

export async function GET() {
  try {
    const profile = dataService.getUserProfile();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
