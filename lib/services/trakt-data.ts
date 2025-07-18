import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  TraktResponse,
  TraktUserProfile,
  TraktUserStats,
  TraktUserHistory,
  TraktUserWatchedMovies,
  TraktUserWatchedShows,
  TraktUserWatchlist,
  TraktUserComments,
  TraktUserLists,
  TraktWatchedMovie,
  TraktWatchedShow,
} from '@/lib/types';

// Additional types for search results
export interface SearchResult {
  source: 'watched' | 'watchlist' | 'history';
}

export interface MovieSearchResult extends SearchResult {
  movie: TraktWatchedMovie['movie'];
  plays?: number;
  last_watched_at?: string;
  rank?: number;
  listed_at?: string;
  watched_at?: string;
}

export interface ShowSearchResult extends SearchResult {
  show: TraktWatchedShow['show'];
  plays?: number;
  last_watched_at?: string;
  rank?: number;
  listed_at?: string;
  watched_at?: string;
}

export interface ActivityItem {
  id: number;
  watched_at: string;
  action: string;
  type: 'movie' | 'show' | 'episode';
  movie?: TraktWatchedMovie['movie'];
  show?: TraktWatchedShow['show'];
  season?: {
    number: number;
    ids: {
      trakt: number;
      slug: string;
    };
  };
  episode?: {
    season: number;
    number: number;
    title: string;
    ids: {
      trakt: number;
      slug: string;
    };
  };
}

export interface StatsSummary {
  profile_stats: TraktUserStats['data'] | null;
  counts: {
    watched_movies: number;
    watched_shows: number;
    watchlist_movies: number;
    watchlist_shows: number;
  };
  last_updated: string | null;
}

export class TraktDataService {
  private static instance: TraktDataService;
  private cache = new Map<string, unknown>();
  private readonly dataPath = join(process.cwd(), 'public', 'data', 'json');

  private constructor() {}

  public static getInstance(): TraktDataService {
    if (!TraktDataService.instance) {
      TraktDataService.instance = new TraktDataService();
    }
    return TraktDataService.instance;
  }

  private loadJsonFile<T>(filePath: string): T | null {
    const fullPath = join(this.dataPath, filePath);
    
    if (!existsSync(fullPath)) {
      return null;
    }

    // Check cache first
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath) as T;
    }

    try {
      const fileContents = readFileSync(fullPath, 'utf8');
      const data = JSON.parse(fileContents) as T;
      
      // Cache the data
      this.cache.set(filePath, data);
      
      return data;
    } catch (error) {
      console.error(`Error loading JSON file ${filePath}:`, error);
      return null;
    }
  }

  // Clear cache for fresh data
  public clearCache(): void {
    this.cache.clear();
  }

  // Get index data
  public getIndex(): TraktResponse<unknown> | null {
    return this.loadJsonFile<TraktResponse<unknown>>('index.json');
  }

  // User Profile
  public getUserProfile(): TraktUserProfile | null {
    return this.loadJsonFile<TraktUserProfile>('user/profile/basic.json');
  }

  // User Stats
  public getUserStats(): TraktUserStats | null {
    return this.loadJsonFile<TraktUserStats>('user/stats/overview.json');
  }

  // History
  public getUserHistoryMovies(): TraktUserHistory | null {
    return this.loadJsonFile<TraktUserHistory>('user/history/movies.json');
  }

  public getUserHistoryShows(): TraktUserHistory | null {
    return this.loadJsonFile<TraktUserHistory>('user/history/shows.json');
  }

  public getUserHistoryAll(): { movies: TraktUserHistory | null; shows: TraktUserHistory | null } {
    return {
      movies: this.getUserHistoryMovies(),
      shows: this.getUserHistoryShows()
    };
  }

  // Watched
  public getUserWatchedMovies(): TraktUserWatchedMovies | null {
    return this.loadJsonFile<TraktUserWatchedMovies>('user/watched/movies.json');
  }

  public getUserWatchedShows(): TraktUserWatchedShows | null {
    return this.loadJsonFile<TraktUserWatchedShows>('user/watched/shows.json');
  }

  public getUserWatchedAll(): { movies: TraktUserWatchedMovies | null; shows: TraktUserWatchedShows | null } {
    return {
      movies: this.getUserWatchedMovies(),
      shows: this.getUserWatchedShows()
    };
  }

  // Watchlist
  public getUserWatchlistMovies(): TraktUserWatchlist | null {
    return this.loadJsonFile<TraktUserWatchlist>('user/watchlist/movies.json');
  }

  public getUserWatchlistShows(): TraktUserWatchlist | null {
    // Shows watchlist is combined in all.json, filter shows from there
    const allWatchlist = this.loadJsonFile<TraktUserWatchlist>('user/watchlist/all.json');
    if (!allWatchlist?.data) return null;
    
    const showsData = allWatchlist.data.filter(item => item.type === 'show');
    return {
      ...allWatchlist,
      data: showsData,
      metadata: {
        ...allWatchlist.metadata,
        count: showsData.length
      }
    };
  }

  public getUserWatchlistAll(): { movies: TraktUserWatchlist | null; shows: TraktUserWatchlist | null } {
    return {
      movies: this.getUserWatchlistMovies(),
      shows: this.getUserWatchlistShows()
    };
  }

  // Comments
  public getUserComments(): TraktUserComments | null {
    return this.loadJsonFile<TraktUserComments>('user/comments/all.json');
  }

  // Lists
  public getUserLists(): TraktUserLists | null {
    return this.loadJsonFile<TraktUserLists>('user/lists/user_lists.json');
  }

  // Get specific list items by slug
  public getListItems(slug: string): TraktResponse<unknown> | null {
    return this.loadJsonFile<TraktResponse<unknown>>(`user/lists/${slug}_items.json`);
  }

  // Get all available list items
  public getAllListItems(): { [slug: string]: TraktResponse<unknown> | null } {
    const lists = this.getUserLists();
    if (!lists?.data) return {};
    
    const listItems: { [slug: string]: TraktResponse<unknown> | null } = {};    lists.data.forEach(list => {
      const slug = list.ids.slug;
      listItems[slug] = this.getListItems(slug);
    });

    return listItems;
  }


  // Utility methods for filtering and searching
  public searchMoviesByTitle(title: string): MovieSearchResult[] {
    const watched = this.getUserWatchedMovies();
    const watchlist = this.getUserWatchlistMovies();
    const history = this.getUserHistoryMovies();

    const results: MovieSearchResult[] = [];
    const titleLower = title.toLowerCase();

    // Search in watched movies
    if (watched?.data) {
      const watchedMatches = watched.data.filter(item => 
        item.movie.title.toLowerCase().includes(titleLower)
      );
      results.push(...watchedMatches.map(item => ({ 
        movie: item.movie,
        plays: item.plays,
        last_watched_at: item.last_watched_at,
        source: 'watched' as const
      })));
    }

    // Search in watchlist
    if (watchlist?.data) {
      const watchlistMatches = watchlist.data.filter(item => 
        item.movie?.title.toLowerCase().includes(titleLower)
      );
      results.push(...watchlistMatches.map(item => ({ 
        movie: item.movie!,
        rank: item.rank,
        listed_at: item.listed_at,
        source: 'watchlist' as const
      })));
    }

    // Search in history
    if (history?.data) {
      const historyMatches = history.data.filter(item => 
        item.movie?.title.toLowerCase().includes(titleLower)
      );
      results.push(...historyMatches.map(item => ({ 
        movie: item.movie!,
        watched_at: item.watched_at,
        source: 'history' as const
      })));
    }

    return results;
  }

  public searchShowsByTitle(title: string): ShowSearchResult[] {
    const watched = this.getUserWatchedShows();
    const watchlist = this.getUserWatchlistShows();
    const history = this.getUserHistoryShows();

    const results: ShowSearchResult[] = [];
    const titleLower = title.toLowerCase();

    // Search in watched shows
    if (watched?.data) {
      const watchedMatches = watched.data.filter(item => 
        item.show.title.toLowerCase().includes(titleLower)
      );
      results.push(...watchedMatches.map(item => ({ 
        show: item.show,
        plays: item.plays,
        last_watched_at: item.last_watched_at,
        source: 'watched' as const
      })));
    }

    // Search in watchlist
    if (watchlist?.data) {
      const watchlistMatches = watchlist.data.filter(item => 
        item.show?.title.toLowerCase().includes(titleLower)
      );
      results.push(...watchlistMatches.map(item => ({ 
        show: item.show!,
        rank: item.rank,
        listed_at: item.listed_at,
        source: 'watchlist' as const
      })));
    }

    // Search in history
    if (history?.data) {
      const historyMatches = history.data.filter(item => 
        item.show?.title.toLowerCase().includes(titleLower)
      );
      results.push(...historyMatches.map(item => ({ 
        show: item.show!,
        watched_at: item.watched_at,
        source: 'history' as const
      })));
    }

    return results;
  }


}
