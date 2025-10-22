import { TMDBMovie, TMDBShow } from '../types/tmdb';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// In-memory cache with expiration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<TMDBMovie | TMDBShow>>();
const CACHE_TTL = 3 * 7 * 24 * 60 * 60 * 1000; // 3 weeks in milliseconds

/**
 * Get data from cache if not expired
 */
function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Set data in cache
 */
function setCache(key: string, data: TMDBMovie | TMDBShow): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Fetch data from TMDB API
 */
async function fetchTMDB<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  
  const response = await fetch(url, {
    next: { revalidate: CACHE_TTL / 1000 }, // Next.js cache for 3 weeks
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch movie details from TMDB with caching
 */
export async function fetchTMDBMovie(tmdbId: string | number): Promise<TMDBMovie> {
  const cacheKey = `movie:${tmdbId}`;
  
  // Check cache first
  const cached = getCached<TMDBMovie>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API with additional data
  const movie = await fetchTMDB<TMDBMovie>(
    `/movie/${tmdbId}?append_to_response=credits,videos,images,external_ids,recommendations,similar`
  );

  // Store in cache
  setCache(cacheKey, movie);

  return movie;
}

/**
 * Fetch TV show details from TMDB with caching
 */
export async function fetchTMDBShow(tmdbId: string | number): Promise<TMDBShow> {
  const cacheKey = `show:${tmdbId}`;
  
  // Check cache first
  const cached = getCached<TMDBShow>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API with additional data
  const show = await fetchTMDB<TMDBShow>(
    `/tv/${tmdbId}?append_to_response=credits,videos,images,external_ids,recommendations,similar`
  );

  // Store in cache
  setCache(cacheKey, show);

  return show;
}
