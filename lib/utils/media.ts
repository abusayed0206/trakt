const CDN_BASE_URL = 'https://cfcdn.sayed.app/watch/';

// wsrv.nl image optimization service
const WSRV_BASE = 'https://wsrv.nl';

export const getMoviePosterUrl = (tmdbId: number | string, width?: number): string => {
  const originalUrl = `${CDN_BASE_URL}movies/posters/${tmdbId}_poster.jpg`;
  const w = width || 300;
  return `${WSRV_BASE}/?url=${encodeURIComponent(originalUrl)}&w=${w}&output=webp&q=85&maxage=7d`;
};

export const getShowPosterUrl = (tmdbId: number | string, width?: number): string => {
  const originalUrl = `${CDN_BASE_URL}shows/posters/${tmdbId}_poster.jpg`;
  const w = width || 300;
  return `${WSRV_BASE}/?url=${encodeURIComponent(originalUrl)}&w=${w}&output=webp&q=85&maxage=7d`;
};

export const getShowSeasonPosterUrl = (tmdbId: number | string, season: number, width?: number): string => {
  const originalUrl = `${CDN_BASE_URL}shows/posters/${tmdbId}/${season}/season_${season}_poster.jpg`;
  const w = width || 300;
  return `${WSRV_BASE}/?url=${encodeURIComponent(originalUrl)}&w=${w}&output=webp&q=85&maxage=7d`;
};

export const getThumbnailUrl = (tmdbId: number | string, width?: number): string => {
  const originalUrl = `${CDN_BASE_URL}thumbnails/thumb_${tmdbId}_poster.jpg`;
  const w = width || 150;
  return `${WSRV_BASE}/?url=${encodeURIComponent(originalUrl)}&w=${w}&output=webp&q=60&maxage=7d`;
};

// For profile picture (local file)
export const getProfilePictureUrl = (width?: number): string => {
  const originalUrl = `${window.location.origin}/data/imgs/dp.jpg`;
  const w = width || 100;
  return `${WSRV_BASE}/?url=${encodeURIComponent(originalUrl)}&w=${w}&maxage=1y&output=webp&q=85`;
};

export const getLetterboxdUrl = (imdbId: string): string => {
  return `https://letterboxd.com/imdb/${imdbId}`;
};

export const getTraktUrl = (traktId: number, type: 'movie' | 'show'): string => {
  const baseUrl = type === 'movie' ? 'https://trakt.tv/movies/' : 'https://trakt.tv/shows/';
  return `${baseUrl}${traktId}`;
};

export const getImdbUrl = (imdbId: string): string => {
  return `https://www.imdb.com/title/${imdbId}`;
};

export const getTmdbUrl = (tmdbId: number, type: 'movie' | 'tv'): string => {
  const baseUrl = type === 'movie' ? 'https://www.themoviedb.org/movie/' : 'https://www.themoviedb.org/tv/';
  return `${baseUrl}${tmdbId}`;
};

export const formatWatchTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return formatDate(dateString);
  }
};
