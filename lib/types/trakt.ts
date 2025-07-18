// Trakt API Response Types

export interface TraktMetadata {
  fetched_at: string;
  source: string;
  username: string;
  endpoint: string;
  count: number;
}

export interface TraktResponse<T = unknown> {
  metadata: TraktMetadata;
  data: T;
}

// User Profile Types
export interface TraktUser {
  username: string;
  private: boolean;
  name: string;
  description?: string;
  age?: number;
  gender?: string;
  biography?: string;
  location?: string;
  website?: string;
  joined_at: string;
  avatar?: {
    full: string;
  };
  cover_image?: string;
  vip?: boolean;
  vip_ep?: boolean;
  ids: {
    slug: string;
  };
}

// Movie/Show Base Types
export interface TraktIds {
  trakt: number;
  slug: string;
  tvdb?: number;
  imdb?: string;
  tmdb?: number;
}

export interface TraktMovie {
  title: string;
  year: number;
  ids: TraktIds;
}

export interface TraktShow {
  title: string;
  year: number;
  ids: TraktIds;
}

export interface TraktSeason {
  number: number;
  ids: TraktIds;
}

export interface TraktEpisode {
  season: number;
  number: number;
  title: string;
  ids: TraktIds;
}

// History Types
export interface TraktHistoryItem {
  id: number;
  watched_at: string;
  action: string;
  type: 'movie' | 'episode';
  movie?: TraktMovie;
  show?: TraktShow;
  season?: TraktSeason;
  episode?: TraktEpisode;
}

// Watched Types
export interface TraktWatchedMovie {
  plays: number;
  last_watched_at: string;
  last_updated_at: string;
  movie: TraktMovie;
}

export interface TraktWatchedShowSeason {
  number: number;
  episodes: {
    number: number;
    plays: number;
    last_watched_at: string;
  }[];
}

export interface TraktWatchedShow {
  plays: number;
  reset_at?: string;
  last_watched_at: string;
  last_updated_at: string;
  show: TraktShow;
  seasons: TraktWatchedShowSeason[];
}

// Watchlist Types
export interface TraktWatchlistItem {
  rank: number;
  id: number;
  listed_at: string;
  notes?: string;
  type: 'movie' | 'show';
  movie?: TraktMovie;
  show?: TraktShow;
}

// Stats Types
export interface TraktStats {
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
  seasons: {
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
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
      '6': number;
      '7': number;
      '8': number;
      '9': number;
      '10': number;
    };
  };
}

// Comments Types
export interface TraktComment {
  id: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  comment: string;
  spoiler: boolean;
  review: boolean;
  replies: number;
  likes: number;
  user_rating?: number;
  user: {
    username: string;
    private: boolean;
    name: string;
    vip?: boolean;
    vip_ep?: boolean;
    ids: {
      slug: string;
    };
  };
}

// Lists Types
export interface TraktList {
  name: string;
  description: string;
  privacy: 'private' | 'public' | 'friends';
  display_numbers: boolean;
  allow_comments: boolean;
  sort_by: string;
  sort_how: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  comment_count: number;
  like_count: number;
  ids: {
    trakt: number;
    slug: string;
  };
  user: {
    username: string;
    private: boolean;
    name: string;
    vip?: boolean;
    vip_ep?: boolean;
    ids: {
      slug: string;
    };
  };
}

// API Response Types
export type TraktUserProfile = TraktResponse<TraktUser>;
export type TraktUserStats = TraktResponse<TraktStats>;
export type TraktUserHistory = TraktResponse<TraktHistoryItem[]>;
export type TraktUserWatchedMovies = TraktResponse<TraktWatchedMovie[]>;
export type TraktUserWatchedShows = TraktResponse<TraktWatchedShow[]>;
export type TraktUserWatchlist = TraktResponse<TraktWatchlistItem[]>;
export type TraktUserComments = TraktResponse<TraktComment[]>;
export type TraktUserLists = TraktResponse<TraktList[]>;
