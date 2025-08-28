// Consolidated Types for Watch App
// This file contains all types used across the application

// Base ID Types
export interface TraktIds {
  trakt: number;
  slug: string;
  imdb: string;
  tmdb: number;
  tvdb?: number;
  tvrage?: number | null;
}

// Core Entity Types
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

export interface Season {
  number: number;
  ids?: TraktIds;
}

export interface Episode {
  season: number;
  number: number;
  title: string;
  ids: TraktIds;
}

// User Types
export interface UserProfile {
  username: string;
  private: boolean;
  deleted?: boolean;
  name: string;
  vip?: boolean;
  vip_ep?: boolean;
  director?: boolean;
  description?: string;
  age?: number;
  gender?: string;
  biography?: string;
  location?: string;
  website?: string;
  about?: string;
  joined_at: string;
  avatar?: {
    full: string;
  };
  cover_image?: string;
  ids: {
    slug: string;
  };
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
  seasons?: {
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

// History Types
export interface HistoryItem {
  id: number;
  watched_at: string;
  action: string;
  type: 'movie' | 'episode' | string;
  movie?: Movie;
  show?: Show;
  season?: Season;
  episode?: Episode;
}

// Watched Types
export interface WatchedMovie {
  plays: number;
  last_watched_at: string;
  last_updated_at: string;
  movie: Movie;
}

export interface WatchedShowSeason {
  number: number;
  episodes: {
    number: number;
    plays: number;
    last_watched_at: string;
  }[];
}

export interface WatchedShow {
  plays: number;
  last_watched_at: string;
  last_updated_at: string;
  reset_at?: string | null;
  show: Show;
  seasons: WatchedShowSeason[];
}

// Watchlist Types
export interface WatchlistItem {
  rank: number;
  id: number;
  listed_at: string;
  notes?: string | null;
  type: 'movie' | 'show' | string;
  movie?: Movie;
  show?: Show;
}

// List Types
export interface UserList {
  name: string;
  description: string;
  privacy: 'private' | 'public' | 'friends' | string;
  share_link?: string;
  type?: string;
  display_numbers: boolean;
  allow_comments: boolean;
  sort_by: string;
  sort_how: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  comment_count: number;
  likes?: number;
  like_count?: number;
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
  type: 'movie' | 'show' | string;
  movie?: Movie;
  show?: Show;
}

// Comment Types
export interface Comment {
  id: number;
  comment: string;
  spoiler: boolean;
  review: boolean;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  replies: number;
  likes: number;
  user_rating?: number | null;
  language?: string;
  user_stats?: {
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

// Search Types
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

// API Response Types
export interface ApiMetadata {
  fetched_at: string;
  source: string;
  username: string;
  endpoint: string;
  count: number;
}

export interface ApiResponse<T> {
  metadata: ApiMetadata;
  data: T;
}

// Media Index Types
export interface MediaIndex {
  last_updated: string;
  movies: {
    posters: string[];
  };
  shows: {
    posters: string[];
  };
}

// Type Aliases for Compatibility
export type TraktUser = UserProfile;
export type TraktUserStats = ApiResponse<UserStats>;
export type TraktUserProfile = ApiResponse<UserProfile>;
export type TraktMovie = Movie;
export type TraktShow = Show;
export type TraktEpisode = Episode;
export type TraktSeason = Season;
export type TraktHistoryItem = HistoryItem;
export type TraktWatchedMovie = WatchedMovie;
export type TraktWatchedShow = WatchedShow;
export type TraktWatchlistItem = WatchlistItem;
export type TraktComment = Comment;
export type TraktList = UserList;
export type TraktMetadata = ApiMetadata;
export type TraktResponse<T> = ApiResponse<T>;

// Specific Response Types
export type TraktUserHistory = ApiResponse<HistoryItem[]>;
export type TraktUserWatchedMovies = ApiResponse<WatchedMovie[]>;
export type TraktUserWatchedShows = ApiResponse<WatchedShow[]>;
export type TraktUserWatchlist = ApiResponse<WatchlistItem[]>;
export type TraktUserComments = ApiResponse<Comment[]>;
export type TraktUserLists = ApiResponse<UserList[]>;

// For backwards compatibility
export type MovieWatchHistoryItem = HistoryItem;

// Watching/Scrobble Types
export interface WatchingProgress {
  started_at: string;
  expires_at: string;
  percentage?: number;
}

export interface WatchingContent {
  type: 'movie' | 'episode';
  title: string;
  subtitle?: string;
  year: number;
  progress?: WatchingProgress;
  images: {
    backdrop?: string;
    backdrop_medium?: string;
    backdrop_small?: string;
  };
  ids: {
    trakt: number;
    tmdb: number;
    imdb: string;
  };
}

export interface WatchingData {
  isWatching: boolean;
  content?: WatchingContent;
}
