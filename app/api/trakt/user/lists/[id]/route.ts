import { NextRequest, NextResponse } from 'next/server';
import { TraktDataService } from '@/lib/services/trakt-data';

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

    return NextResponse.json(listItems);
  } catch (error) {
    console.error('Error fetching list items:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
