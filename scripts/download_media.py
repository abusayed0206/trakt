#!/usr/bin/env python3
"""
Media Downloader for Trakt Data

This script downloads media files (posters, backdrops, fanart) for movies and shows
from the JSON data fetched by the Trakt API script. It uses TMDB API for high-quality images.
"""

import os
import json
import requests
import time
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
import logging
from urllib.parse import urlparse
import hashlib

# Load environment variables
load_dotenv('../.env.local')  # Look in project root folder

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class MediaDownloader:
    def __init__(self, cdn_repo_path=None):
        self.tmdb_api_key = os.getenv('TMDB_API_KEY')
        
        if not self.tmdb_api_key:
            raise ValueError("TMDB_API_KEY environment variable is required for downloading images")
        
        self.tmdb_base_url = 'https://api.themoviedb.org/3'
        self.tmdb_image_base_url = 'https://image.tmdb.org/t/p'
        
        # Image sizes for different types
        self.image_sizes = {
            'poster': 'w780',      # poster sizes: w92, w154, w185, w342, w500, w780, original
            'backdrop': 'w1280',   # backdrop sizes: w300, w780, w1280, original
        }
        
        # Create output directories
        self.data_dir = Path('public/data/json')
        
        # Use CDN repo path if provided, otherwise fallback to local
        if cdn_repo_path:
            self.images_dir = Path(cdn_repo_path) / 'watch'
            self.media_index_path = Path('public/data/media_index.json').resolve()  # Save index to main repo
        else:
            self.images_dir = Path('public/data/imgs')
            self.media_index_path = self.images_dir / 'media_index.json'  # Save index to images dir
        
        self.create_directory_structure()
        
        # Rate limiting
        self.request_delay = 0.25  # 4 requests per second (TMDB limit is 40/10s)
    
    def create_directory_structure(self):
        """Create organized directory structure for images"""
        directories = [
            'movies/posters',
            'movies/backdrops',
            'shows/posters', 
            'shows/backdrops'
        ]
        
        for directory in directories:
            (self.images_dir / directory).mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Created image directory structure in {self.images_dir}")
    
    def make_tmdb_request(self, endpoint, params=None):
        """Make request to TMDB API with rate limiting"""
        if params is None:
            params = {}
        
        params['api_key'] = self.tmdb_api_key
        url = f"{self.tmdb_base_url}{endpoint}"
        
        try:
            time.sleep(self.request_delay)  # Rate limiting
            response = requests.get(url, params=params)
            
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 10))
                logger.warning(f"TMDB rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                return self.make_tmdb_request(endpoint, params)
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching TMDB {endpoint}: {e}")
            return None
    
    def download_image(self, image_url, filepath):
        """Download image from URL"""
        try:
            # Check if file already exists
            if filepath.exists():
                logger.debug(f"Image already exists: {filepath}")
                return True
            
            time.sleep(self.request_delay)  # Rate limiting
            response = requests.get(image_url, stream=True)
            response.raise_for_status()
            
            # Create directory if it doesn't exist
            filepath.parent.mkdir(parents=True, exist_ok=True)
            
            # Download image
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Downloaded: {filepath}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error downloading {image_url}: {e}")
            return False
    
    def get_movie_images(self, tmdb_id):
        """Get movie images from TMDB"""
        images_data = self.make_tmdb_request(f'/movie/{tmdb_id}/images')
        if not images_data:
            return None
        
        return {
            'posters': images_data.get('posters', []),
            'backdrops': images_data.get('backdrops', [])
        }
    
    def get_show_images(self, tmdb_id):
        """Get TV show images from TMDB"""
        images_data = self.make_tmdb_request(f'/tv/{tmdb_id}/images')
        if not images_data:
            return None
        
        return {
            'posters': images_data.get('posters', []),
            'backdrops': images_data.get('backdrops', [])
        }
    
    def download_first(self, images, size_key, filepath):
        """Download the best image of a TMDB image list: English or text-free first, else whatever is listed first"""
        best = next((i for i in images if i.get('iso_639_1') in ('en', None)), images[0] if images else None)
        if best and best.get('file_path'):
            self.download_image(f"{self.tmdb_image_base_url}/{self.image_sizes[size_key]}{best['file_path']}", filepath)

    def download_movie_images(self, tmdb_id):
        """Download poster and backdrop for a movie, skipping TMDB entirely when both exist"""
        poster = self.images_dir / 'movies' / 'posters' / f"{tmdb_id}_poster.jpg"
        backdrop = self.images_dir / 'movies' / 'backdrops' / f"{tmdb_id}_backdrop.jpg"
        if poster.exists() and backdrop.exists():
            return

        logger.info(f"Downloading images for movie TMDB ID: {tmdb_id}")
        images = self.get_movie_images(tmdb_id)
        if images:
            self.download_first(images['posters'], 'poster', poster)
            self.download_first(images['backdrops'], 'backdrop', backdrop)

    def download_show_images(self, tmdb_id):
        """Download poster, backdrop and any season posters not on disk yet"""
        poster = self.images_dir / 'shows' / 'posters' / f"{tmdb_id}_poster.jpg"
        backdrop = self.images_dir / 'shows' / 'backdrops' / f"{tmdb_id}_backdrop.jpg"
        if not (poster.exists() and backdrop.exists()):
            logger.info(f"Downloading images for show TMDB ID: {tmdb_id}")
            images = self.get_show_images(tmdb_id)
            if images:
                self.download_first(images['posters'], 'poster', poster)
                self.download_first(images['backdrops'], 'backdrop', backdrop)

        # One details call per show: it lists every season's poster, so new seasons are picked up
        # without a /season/{n}/images call per season
        show_details = self.make_tmdb_request(f'/tv/{tmdb_id}')
        for season in (show_details or {}).get('seasons', []):
            season_number = season.get('season_number')
            if season_number is None or not season.get('poster_path'):
                continue
            filepath = (self.images_dir / 'shows' / 'posters' / str(tmdb_id) / str(season_number)
                        / f"season_{season_number}_poster.jpg")
            if not filepath.exists():
                self.download_image(f"{self.tmdb_image_base_url}/{self.image_sizes['poster']}{season['poster_path']}", filepath)

    def collect_tmdb_ids(self, json_paths):
        """Unique TMDB ids of the movies and shows referenced by the given Trakt JSON files"""
        movies, shows = set(), set()
        for json_path in json_paths:
            if not json_path.exists():
                logger.warning(f"JSON file not found: {json_path}")
                continue
            try:
                data = json.loads(json_path.read_text(encoding='utf-8'))
            except Exception as e:
                logger.error(f"Error processing {json_path}: {e}")
                continue
            items = data['data'] if isinstance(data, dict) and 'data' in data else data
            for item in items if isinstance(items, list) else [items]:
                if not isinstance(item, dict):
                    continue
                # Episode and season list items carry their show under 'show'
                for key, ids in (('movie', movies), ('show', shows)):
                    tmdb_id = (item.get(key) or {}).get('ids', {}).get('tmdb')
                    if tmdb_id:
                        ids.add(tmdb_id)
                        break
        return sorted(movies), sorted(shows)

    def download_all_media(self):
        """Download media files that aren't on disk yet for every item in the JSON data"""
        logger.info("Starting media download process...")

        # Check if JSON data exists
        if not self.data_dir.exists():
            logger.error(f"JSON data directory not found: {self.data_dir}")
            return

        json_paths = [self.data_dir / f for f in (
            'user/watchlist/movies.json',
            'user/watchlist/all.json',
            'user/history/movies.json',
            'user/history/shows.json',
            'user/watched/movies.json',
            'user/watched/shows.json'
        )] + sorted((self.data_dir / 'user' / 'lists').glob('*_items.json'))

        movies, shows = self.collect_tmdb_ids(json_paths)
        logger.info(f"Checking {len(movies)} movies and {len(shows)} shows")
        for tmdb_id in movies:
            self.download_movie_images(tmdb_id)
        for tmdb_id in shows:
            self.download_show_images(tmdb_id)

        # Create media index
        self.create_media_index()

        logger.info("Media download process completed!")
    
    def create_media_index(self):
        """Create an index of all downloaded media files"""
        media_index = {
            'last_updated': datetime.now().isoformat(),
            'movies': {
                'posters': [],
                'backdrops': []
            },
            'shows': {
                'posters': [],
                'backdrops': [],
                'season_posters': {}
            }
        }
        
        # Index movie images
        movies_dir = self.images_dir / 'movies'
        if movies_dir.exists():
            for poster in (movies_dir / 'posters').glob('*.jpg'):
                media_index['movies']['posters'].append(poster.name)
            for backdrop in (movies_dir / 'backdrops').glob('*.jpg'):
                media_index['movies']['backdrops'].append(backdrop.name)
        
        # Index show images
        shows_dir = self.images_dir / 'shows'
        if shows_dir.exists():
            # Main show posters (direct files in shows/posters/)
            for poster in (shows_dir / 'posters').glob('*.jpg'):
                media_index['shows']['posters'].append(poster.name)
            
            # Season posters (in subdirectories shows/posters/[id]/[season]/)
            posters_dir = shows_dir / 'posters'
            if posters_dir.exists():
                for show_id_dir in posters_dir.iterdir():
                    if show_id_dir.is_dir() and show_id_dir.name.isdigit():
                        show_id = show_id_dir.name
                        media_index['shows']['season_posters'][show_id] = {}
                        
                        for season_dir in show_id_dir.iterdir():
                            if season_dir.is_dir():
                                season_number = season_dir.name
                                season_posters = []
                                for poster in sorted(season_dir.glob('*.jpg')):
                                    season_posters.append(poster.name)
                                
                                if season_posters:
                                    media_index['shows']['season_posters'][show_id][season_number] = season_posters
            
            # Show backdrops
            for backdrop in (shows_dir / 'backdrops').glob('*.jpg'):
                media_index['shows']['backdrops'].append(backdrop.name)
        
        for group in (media_index['movies'], media_index['shows']):
            for key in ('posters', 'backdrops'):
                group[key].sort()

        # Keep the old file (and its last_updated) when nothing changed, so no commit or redeploy happens
        if self.media_index_path.exists():
            try:
                previous = json.loads(self.media_index_path.read_text(encoding='utf-8'))
                previous.pop('last_updated', None)
                if previous == {k: v for k, v in media_index.items() if k != 'last_updated'}:
                    logger.info("Media index unchanged")
                    return
            except ValueError:
                pass

        # Save index
        # Ensure the directory exists for media_index.json
        self.media_index_path.parent.mkdir(parents=True, exist_ok=True)

        with open(self.media_index_path, 'w', encoding='utf-8') as f:
            json.dump(media_index, f, indent=2)
        
        logger.info(f"Created media index: {self.media_index_path}")
        logger.info(f"Indexed {len(media_index['movies']['posters'])} movie posters, "
                   f"{len(media_index['shows']['posters'])} show posters, "
                   f"{len(media_index['shows']['season_posters'])} shows with season posters")

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Download media files for Trakt data')
    parser.add_argument('--cdn-repo-path', 
                       help='Path to the CDN repository where images will be stored')
    
    args = parser.parse_args()
    
    try:
        downloader = MediaDownloader(cdn_repo_path=args.cdn_repo_path)
        downloader.download_all_media()
        
    except Exception as e:
        logger.error(f"Script failed: {e}")
        exit(1)

if __name__ == '__main__':
    main()
