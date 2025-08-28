import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface MediaIndex {
  last_updated: string;
  movies: {
    posters: string[];
    backdrops: string[];
  };
  shows: {
    posters: string[];
    backdrops: string[];
    season_posters: Record<string, Record<string, string[]>>;
  };
}

interface ImageLookup {
  movies: {
    posters: Record<string, string[]>;
    backdrops: Record<string, string[]>;
  };
  shows: {
    posters: Record<string, string[]>;
    backdrops: Record<string, string[]>;
    season_posters: Record<string, Record<string, string[]>>;
  };
}

class ImageIndexManager {
  private static instance: ImageIndexManager;
  private imageIndex: ImageLookup | null = null;
  private lastUpdated: string | null = null;

  private constructor() {}

  static getInstance(): ImageIndexManager {
    if (!ImageIndexManager.instance) {
      ImageIndexManager.instance = new ImageIndexManager();
    }
    return ImageIndexManager.instance;
  }

  loadImageIndex(): ImageLookup {
    try {
      const mediaIndexPath = join(process.cwd(), 'public', 'data', 'media_index.json');
      
      if (!existsSync(mediaIndexPath)) {
        console.warn('Media index file not found, returning empty index');
        return this.getEmptyIndex();
      }

      const mediaIndexData: MediaIndex = JSON.parse(readFileSync(mediaIndexPath, 'utf-8'));
      
      // Check if we need to reload
      if (this.imageIndex && this.lastUpdated === mediaIndexData.last_updated) {
        return this.imageIndex;
      }

      console.log('Loading image index into memory...');
      
      // Transform the media index into a fast lookup structure
      const lookup: ImageLookup = {
        movies: {
          posters: this.buildLookupMap(mediaIndexData.movies.posters),
          backdrops: this.buildLookupMap(mediaIndexData.movies.backdrops)
        },
        shows: {
          posters: this.buildLookupMap(mediaIndexData.shows.posters),
          backdrops: this.buildLookupMap(mediaIndexData.shows.backdrops),
          season_posters: mediaIndexData.shows.season_posters
        }
      };

      this.imageIndex = lookup;
      this.lastUpdated = mediaIndexData.last_updated;
      
      console.log(`Image index loaded: ${Object.keys(lookup.movies.posters).length} movie posters, ${Object.keys(lookup.shows.posters).length} show posters`);
      
      return lookup;
    } catch (error) {
      console.error('Error loading image index:', error);
      return this.getEmptyIndex();
    }
  }

  private buildLookupMap(files: string[]): Record<string, string[]> {
    const lookup: Record<string, string[]> = {};
    
    for (const file of files) {
      // Extract TMDB ID from filename (e.g., "27205_poster.jpg" -> "27205")
      const match = file.match(/^(\d+)_/);
      if (match) {
        const tmdbId = match[1];
        if (!lookup[tmdbId]) {
          lookup[tmdbId] = [];
        }
        lookup[tmdbId].push(file);
      }
    }
    
    return lookup;
  }

  private getEmptyIndex(): ImageLookup {
    return {
      movies: { posters: {}, backdrops: {} },
      shows: { posters: {}, backdrops: {}, season_posters: {} }
    };
  }

  reloadIndex(): ImageLookup {
    this.imageIndex = null;
    this.lastUpdated = null;
    return this.loadImageIndex();
  }

  findImages(type: 'movies' | 'shows', category: 'posters' | 'backdrops', tmdbId: string, season?: string): { files: string[], basePath: string } {
    const index = this.loadImageIndex();
    
    // Auto-reload if index is older than 24 hours
    this.checkForDailyReload();
    
    if (type === 'shows' && category === 'posters' && season) {
      // Season posters
      const seasonData = index.shows.season_posters[tmdbId]?.[season];
      if (seasonData) {
        return {
          files: seasonData,
          basePath: `shows/posters/${tmdbId}/${season}`
        };
      }
    } else {
      // Regular movie/show images
      const files = index[type][category][tmdbId] || [];
      return {
        files,
        basePath: `${type}/${category}`
      };
    }
    
    return { files: [], basePath: '' };
  }

  private checkForDailyReload(): void {
    if (!this.lastUpdated) return;
    
    const lastUpdate = new Date(this.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    // Reload if more than 24 hours old
    if (hoursSinceUpdate > 24) {
      console.log('🔄 Image index is older than 24 hours, reloading...');
      this.reloadIndex();
    }
  }
}

export default ImageIndexManager;
