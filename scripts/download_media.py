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
    
    def get_show_details(self, tmdb_id):
        """Get TV show details including season information"""
        show_data = self.make_tmdb_request(f'/tv/{tmdb_id}')
        if not show_data:
            return None
        
        return {
            'seasons': show_data.get('seasons', []),
            'number_of_seasons': show_data.get('number_of_seasons', 0)
        }
    
    def get_season_images(self, tmdb_id, season_number):
        """Get season images from TMDB"""
        images_data = self.make_tmdb_request(f'/tv/{tmdb_id}/season/{season_number}/images')
        if not images_data:
            return None
        
        return {
            'posters': images_data.get('posters', [])
        }
    
    def download_movie_images(self, movie_data):
        """Download images for a movie"""
        tmdb_id = None
        
        # Extract TMDB ID from different possible structures
        if isinstance(movie_data, dict):
            if 'ids' in movie_data:
                tmdb_id = movie_data['ids'].get('tmdb')
            elif 'movie' in movie_data and 'ids' in movie_data['movie']:
                tmdb_id = movie_data['movie']['ids'].get('tmdb')
            elif 'tmdb' in movie_data:
                tmdb_id = movie_data['tmdb']
        
        if not tmdb_id:
            logger.warning(f"No TMDB ID found for movie: {movie_data}")
            return
        
        logger.info(f"Downloading images for movie TMDB ID: {tmdb_id}")
        
        images = self.get_movie_images(tmdb_id)
        if not images:
            return
        
        # Download posters
        for i, poster in enumerate(images['posters'][:1]):  # Limit to 1 poster
            if poster.get('file_path'):
                image_url = f"{self.tmdb_image_base_url}/{self.image_sizes['poster']}{poster['file_path']}"
                filename = f"{tmdb_id}_poster.jpg"
                filepath = self.images_dir / 'movies' / 'posters' / filename
                self.download_image(image_url, filepath)
        
        # Download backdrops
        for i, backdrop in enumerate(images['backdrops'][:1]):  # Limit to 1 backdrop
            if backdrop.get('file_path'):
                image_url = f"{self.tmdb_image_base_url}/{self.image_sizes['backdrop']}{backdrop['file_path']}"
                filename = f"{tmdb_id}_backdrop.jpg"
                filepath = self.images_dir / 'movies' / 'backdrops' / filename
                self.download_image(image_url, filepath)
    
    def download_show_images(self, show_data):
        """Download images for a TV show including season posters"""
        tmdb_id = None
        
        # Extract TMDB ID from different possible structures
        if isinstance(show_data, dict):
            if 'ids' in show_data:
                tmdb_id = show_data['ids'].get('tmdb')
            elif 'show' in show_data and 'ids' in show_data['show']:
                tmdb_id = show_data['show']['ids'].get('tmdb')
            elif 'tmdb' in show_data:
                tmdb_id = show_data['tmdb']
        
        if not tmdb_id:
            logger.warning(f"No TMDB ID found for show: {show_data}")
            return
        
        logger.info(f"Downloading images for show TMDB ID: {tmdb_id}")
        
        # Download main show images
        images = self.get_show_images(tmdb_id)
        if images:
            # Download main show poster
            for i, poster in enumerate(images['posters'][:1]):  # Limit to 1 poster
                if poster.get('file_path'):
                    image_url = f"{self.tmdb_image_base_url}/{self.image_sizes['poster']}{poster['file_path']}"
                    filename = f"{tmdb_id}_poster.jpg"
                    filepath = self.images_dir / 'shows' / 'posters' / filename
                    self.download_image(image_url, filepath)
            
            # Download backdrops
            for i, backdrop in enumerate(images['backdrops'][:1]):  # Limit to 1 backdrop
                if backdrop.get('file_path'):
                    image_url = f"{self.tmdb_image_base_url}/{self.image_sizes['backdrop']}{backdrop['file_path']}"
                    filename = f"{tmdb_id}_backdrop.jpg"
                    filepath = self.images_dir / 'shows' / 'backdrops' / filename
                    self.download_image(image_url, filepath)
        
        # Get show details to find seasons
        show_details = self.get_show_details(tmdb_id)
        if show_details and show_details['seasons']:
            logger.info(f"Found {len(show_details['seasons'])} seasons for show {tmdb_id}")
            
            for season in show_details['seasons']:
                season_number = season.get('season_number')
                if season_number is None:
                    continue
                
                # Create dynamic folder structure: shows/posters/[id]/[season]/
                season_dir = self.images_dir / 'shows' / 'posters' / str(tmdb_id) / str(season_number)
                season_dir.mkdir(parents=True, exist_ok=True)
                
                # Download season poster
                season_images = self.get_season_images(tmdb_id, season_number)
                if season_images and season_images['posters']:
                    for i, poster in enumerate(season_images['posters'][:1]):  # Limit to 1 poster per season
                        if poster.get('file_path'):
                            image_url = f"{self.tmdb_image_base_url}/{self.image_sizes['poster']}{poster['file_path']}"
                            filename = f"season_{season_number}_poster.jpg"
                            filepath = season_dir / filename
                            
                            # Check if file already exists to avoid duplicates
                            if not filepath.exists():
                                self.download_image(image_url, filepath)
                            else:
                                logger.debug(f"Season poster already exists: {filepath}")
                else:
                    logger.debug(f"No season poster found for show {tmdb_id}, season {season_number}")
    
    def process_json_file(self, json_file_path):
        """Process a JSON file and download images for items in it"""
        try:
            with open(json_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Extract actual data (handle metadata wrapper)
            if isinstance(data, dict) and 'data' in data:
                items = data['data']
            else:
                items = data
            
            if not isinstance(items, list):
                items = [items]
            
            for item in items:
                if isinstance(item, dict):
                    # Check if it's a movie
                    if 'movie' in item or (item.get('type') == 'movie'):
                        self.download_movie_images(item)
                    # Check if it's a show
                    elif 'show' in item or (item.get('type') == 'show'):
                        self.download_show_images(item)
                    # Check if it has direct movie/show data
                    elif 'ids' in item:
                        # Try to determine type from context or filename
                        if 'movie' in str(json_file_path).lower():
                            self.download_movie_images(item)
                        elif 'show' in str(json_file_path).lower():
                            self.download_show_images(item)
        
        except Exception as e:
            logger.error(f"Error processing {json_file_path}: {e}")
    
    def download_all_media(self):
        """Download all media files based on JSON data"""
        logger.info("Starting media download process...")
        
        # Check if JSON data exists
        if not self.data_dir.exists():
            logger.error(f"JSON data directory not found: {self.data_dir}")
            return
        
        # Process different types of JSON files
        json_files_to_process = [
            'user/watchlist/movies.json',
            'user/watchlist/all.json',
            'user/history/movies.json',
            'user/history/shows.json',
            'user/watched/movies.json',
            'user/watched/shows.json'
        ]
        
        for json_file in json_files_to_process:
            json_path = self.data_dir / json_file
            if json_path.exists():
                logger.info(f"Processing: {json_file}")
                self.process_json_file(json_path)
            else:
                logger.warning(f"JSON file not found: {json_path}")
        
        # Process list items
        lists_dir = self.data_dir / 'user' / 'lists'
        if lists_dir.exists():
            for list_file in lists_dir.glob('*_items.json'):
                logger.info(f"Processing list: {list_file.name}")
                self.process_json_file(list_file)
        
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
                                for poster in season_dir.glob('*.jpg'):
                                    season_posters.append(poster.name)
                                
                                if season_posters:
                                    media_index['shows']['season_posters'][show_id][season_number] = season_posters
            
            # Show backdrops
            for backdrop in (shows_dir / 'backdrops').glob('*.jpg'):
                media_index['shows']['backdrops'].append(backdrop.name)
        
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
