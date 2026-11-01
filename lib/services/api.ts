// Client-side fetchers for the interactive parts of the homepage; everything else is read on the server
import { ApiResponse, ListItem, SearchResult } from '../types';

const API_BASE = '/api/trakt';

export async function fetchListItems(listSlug: string): Promise<ListItem[]> {
  const response = await fetch(`${API_BASE}/user/lists/${listSlug}`);
  if (!response.ok) throw new Error(`Failed to fetch list items for ${listSlug}`);
  const data: ApiResponse<ListItem[]> = await response.json();
  return data.data;
}

export async function searchContent(query: string, type: 'movies' | 'shows' | 'all' = 'all'): Promise<SearchResult> {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}`);
  if (!response.ok) throw new Error('Failed to search content');
  return response.json();
}
