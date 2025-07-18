import { MediaIndex } from '@/lib/types';

let mediaIndex: MediaIndex | null = null;

export const loadMediaIndex = async (): Promise<MediaIndex> => {
  if (mediaIndex) return mediaIndex;
  
  try {
    const response = await fetch('/data/media_index.json');
    mediaIndex = await response.json();
    return mediaIndex!;
  } catch (error) {
    console.error('Failed to load media index:', error);
    throw error;
  }
};

const CDN_BASE_URL = 'https://cfcdn.sayed.app/watch/';

export const getMoviePosterUrl = async (tmdbId: number | string): Promise<string> => {
  try {
    const index = await loadMediaIndex();
    const filename = `${tmdbId}_poster.jpg`;
    
    if (index.movies.posters.includes(filename)) {
      return `${CDN_BASE_URL}movies/posters/${filename}`;
    } else {
      // Fallback to a placeholder or default image
      console.warn(`Movie poster not found for TMDB ID: ${tmdbId}`);
      return '/data/imgs/placeholder.jpg'; // We'll need to add this
    }
  } catch (error) {
    console.error('Error getting movie poster URL:', error);
    return '/data/imgs/placeholder.jpg';
  }
};

export const getShowPosterUrl = async (tmdbId: number | string): Promise<string> => {
  try {
    const index = await loadMediaIndex();
    const filename = `${tmdbId}_poster.jpg`;
    
    if (index.shows.posters.includes(filename)) {
      return `${CDN_BASE_URL}shows/posters/${filename}`;
    } else {
      console.warn(`Show poster not found for TMDB ID: ${tmdbId}`);
      return '/data/imgs/placeholder.jpg';
    }
  } catch (error) {
    console.error('Error getting show poster URL:', error);
    return '/data/imgs/placeholder.jpg';
  }
};

export const getShowSeasonPosterUrl = (tmdbId: number | string, season: number): string => {
  return `${CDN_BASE_URL}shows/posters/${tmdbId}/${season}/season_${season}_poster.jpg`;
};

export const getThumbnailUrl = async (tmdbId: number | string): Promise<string> => {
  try {
    const index = await loadMediaIndex();
    const filename = `thumb_${tmdbId}_poster.jpg`;
    
    if (index.thumbnails.includes(filename)) {
      return `${CDN_BASE_URL}thumbnails/${filename}`;
    } else {
      // Return a simple base64 thumbnail as fallback
      return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7Dw==';
    }
  } catch (error) {
    console.error('Error getting thumbnail URL:', error);
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7Dw==';
  }
};
