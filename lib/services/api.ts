import { ApiResponse, UserProfile, UserStats, HistoryItem, WatchedMovie, WatchedShow, WatchlistItem, UserList, ListItem, CommentItem, SearchResult, WatchingData } from '../types';

const API_BASE = '/api/trakt';

export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/user/profile`);
  if (!response.ok) throw new Error('Failed to fetch user profile');
  const data: ApiResponse<UserProfile> = await response.json();
  return data.data;
}

export async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch(`${API_BASE}/user/stats`);
  if (!response.ok) throw new Error('Failed to fetch user stats');
  const data: ApiResponse<UserStats> = await response.json();
  return data.data;
}

export async function fetchMovieHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE}/user/history?type=movies`);
  if (!response.ok) throw new Error('Failed to fetch movie history');
  const data: ApiResponse<HistoryItem[]> = await response.json();
  return data.data;
}

export async function fetchShowHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE}/user/history?type=shows`);
  if (!response.ok) throw new Error('Failed to fetch show history');
  const data: ApiResponse<HistoryItem[]> = await response.json();
  return data.data;
}

export async function fetchWatchedMovies(): Promise<WatchedMovie[]> {
  const response = await fetch(`${API_BASE}/user/watched?type=movies`);
  if (!response.ok) throw new Error('Failed to fetch watched movies');
  const data: ApiResponse<WatchedMovie[]> = await response.json();
  return data.data;
}

export async function fetchWatchedShows(): Promise<WatchedShow[]> {
  const response = await fetch(`${API_BASE}/user/watched?type=shows`);
  if (!response.ok) throw new Error('Failed to fetch watched shows');
  const data: ApiResponse<WatchedShow[]> = await response.json();
  return data.data;
}

export async function fetchMovieWatchlist(): Promise<WatchlistItem[]> {
  const response = await fetch(`${API_BASE}/user/watchlist?type=movies`);
  if (!response.ok) throw new Error('Failed to fetch movie watchlist');
  const data: ApiResponse<WatchlistItem[]> = await response.json();
  return data.data;
}

export async function fetchUserLists(): Promise<UserList[]> {
  const response = await fetch(`${API_BASE}/user/lists`);
  if (!response.ok) throw new Error('Failed to fetch user lists');
  const data: ApiResponse<UserList[]> = await response.json();
  return data.data;
}

export async function fetchListItems(listSlug: string): Promise<ListItem[]> {
  const response = await fetch(`${API_BASE}/user/lists/${listSlug}`);
  if (!response.ok) throw new Error(`Failed to fetch list items for ${listSlug}`);
  const data: ApiResponse<ListItem[]> = await response.json();
  return data.data;
}

export async function fetchUserComments(): Promise<CommentItem[]> {
  const response = await fetch(`${API_BASE}/user/comments`);
  if (!response.ok) throw new Error('Failed to fetch user comments');
  const data: ApiResponse<CommentItem[]> = await response.json();
  return data.data;
}

export async function searchContent(query: string, type: 'movies' | 'shows' | 'all' = 'all'): Promise<SearchResult> {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}`);
  if (!response.ok) throw new Error('Failed to search content');
  return response.json();
}

export async function fetchWatchingData(): Promise<WatchingData> {
  const response = await fetch('/api/watching');
  if (!response.ok) throw new Error('Failed to fetch watching data');
  return response.json();
}
