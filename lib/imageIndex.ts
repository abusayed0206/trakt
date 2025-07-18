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
  thumbnails: string[];
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
  thumbnails: Record<string, Record<string, string[]>>; // { category: { tmdb_id: [files] } }
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
      const mediaIndexPath = join(process.cwd(), 'public', 'data', 'imgs', 'media_index.json');
      
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
        },
        thumbnails: this.buildThumbnailLookup(mediaIndexData.thumbnails)
      };

      this.imageIndex = lookup;
      this.lastUpdated = mediaIndexData.last_updated;
      
      console.log(`Image index loaded: ${Object.keys(lookup.movies.posters).length} movie posters, ${Object.keys(lookup.shows.posters).length} show posters, ${Object.keys(lookup.thumbnails.posters || {}).length + Object.keys(lookup.thumbnails.backdrops || {}).length} thumbnails`);
      
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

  private buildThumbnailLookup(thumbnails: string[]): Record<string, Record<string, string[]>> {
    const lookup: Record<string, Record<string, string[]>> = {
      posters: {},
      backdrops: {}
    };
    
    for (const file of thumbnails) {
      // Extract info from thumbnail filename (e.g., "thumb_27205_poster.jpg")
      const match = file.match(/^thumb_(\d+)_(poster|backdrop)\.jpg$/);
      if (match) {
        const tmdbId = match[1];
        const category = match[2] + 's'; // Convert to plural (poster -> posters)
        
        if (!lookup[category]) {
          lookup[category] = {};
        }
        if (!lookup[category][tmdbId]) {
          lookup[category][tmdbId] = [];
        }
        lookup[category][tmdbId].push(file);
      }
    }
    
    return lookup;
  }

  private getEmptyIndex(): ImageLookup {
    return {
      movies: { posters: {}, backdrops: {} },
      shows: { posters: {}, backdrops: {}, season_posters: {} },
      thumbnails: { posters: {}, backdrops: {} }
    };
  }

  reloadIndex(): ImageLookup {
    this.imageIndex = null;
    this.lastUpdated = null;
    return this.loadImageIndex();
  }

  findImages(type: 'movies' | 'shows', category: 'posters' | 'backdrops', tmdbId: string, season?: string): { files: string[], basePath: string } {
    const index = this.loadImageIndex();
    
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

  findThumbnails(category: 'posters' | 'backdrops', tmdbId: string): { files: string[], basePath: string } {
    const index = this.loadImageIndex();
    const files = index.thumbnails[category]?.[tmdbId] || [];
    
    return {
      files,
      basePath: 'thumbnails'
    };
  }
}

export default ImageIndexManager;
