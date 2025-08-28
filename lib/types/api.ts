// Trakt API Types
export interface TraktIds {
  trakt: number;
  slug: string;
  imdb: string;
  tmdb: number;
  tvdb?: number;
  tvrage?: number | null;
}

export interface Movie {
  title: string;
  year: number;
  ids: TraktIds;
}

export interface Show {
  title: string;
  year: number;
  ids: TraktIds;
  aired_episodes?: number;
}

export interface Episode {
  season: number;
  number: number;
  title: string;
  ids: TraktIds;
}

export interface UserProfile {
  username: string;
  private: boolean;
  deleted: boolean;
  name: string;
  vip: boolean;
  vip_ep: boolean;
  director: boolean;
  ids: {
    slug: string;
  };
  joined_at: string;
  location?: string;
  about?: string;
}

export interface UserStats {
  movies: {
    plays: number;
    watched: number;
    minutes: number;
    collected: number;
    ratings: number;
    comments: number;
  };
  shows: {
    watched: number;
    collected: number;
    ratings: number;
    comments: number;
  };
  episodes: {
    plays: number;
    watched: number;
    minutes: number;
    collected: number;
    ratings: number;
    comments: number;
  };
  network: {
    friends: number;
    followers: number;
    following: number;
  };
  ratings: {
    total: number;
    distribution: {
      [key: string]: number;
    };
  };
}

export interface HistoryItem {
  id: number;
  watched_at: string;
  action: string;
  type: string;
  movie?: Movie;
  show?: Show;
  episode?: Episode;
}

export interface WatchedMovie {
  plays: number;
  last_watched_at: string;
  last_updated_at: string;
  movie: Movie;
}

export interface WatchedShow {
  plays: number;
  last_watched_at: string;
  last_updated_at: string;
  reset_at?: string | null;
  show: Show;
  seasons: Array<{
    number: number;
    episodes: Array<{
      number: number;
      plays: number;
      last_watched_at: string;
    }>;
  }>;
}

export interface WatchlistItem {
  rank: number;
  id: number;
  listed_at: string;
  notes?: string | null;
  type: string;
  movie?: Movie;
  show?: Show;
}

export interface UserList {
  name: string;
  description: string;
  privacy: string;
  share_link: string;
  type: string;
  display_numbers: boolean;
  allow_comments: boolean;
  sort_by: string;
  sort_how: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  comment_count: number;
  likes: number;
  ids: {
    trakt: number;
    slug: string;
  };
  user: UserProfile;
}

export interface ListItem {
  rank: number;
  id: number;
  listed_at: string;
  notes?: string | null;
  type: string;
  movie?: Movie;
  show?: Show;
}

export interface Comment {
  id: number;
  comment: string;
  spoiler: boolean;
  review: boolean;
  parent_id: number;
  created_at: string;
  updated_at: string;
  replies: number;
  likes: number;
  user_rating?: number | null;
  language: string;
  user_stats: {
    rating?: number | null;
    play_count: number;
    completed_count: number;
  };
  user: UserProfile;
}

export interface CommentItem {
  type: string;
  movie?: Movie;
  show?: Show;
  episode?: Episode;
  comment: Comment;
}

export interface SearchResult {
  query: string;
  type: string;
  results: {
    movies?: Array<{
      movie: Movie;
      plays?: number;
      last_watched_at?: string;
      source: string;
    }>;
    shows?: Array<{
      show: Show;
      plays?: number;
      last_watched_at?: string;
      source: string;
    }>;
  };
}

export interface ApiResponse<T> {
  metadata: {
    fetched_at: string;
    source: string;
    username: string;
    endpoint: string;
    count: number;
  };
  data: T;
}

// Image utilities
export interface MediaIndex {
  last_updated: string;
  movies: {
    posters: string[];
  };
  shows: {
    posters: string[];
  };
}
