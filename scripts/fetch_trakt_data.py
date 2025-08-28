#!/usr/bin/env python3
"""
Trakt User Data Fetcher

This script fetches user-specific data from the Trakt API that's publicly available.
It retrieves data for a specific user including:
- User profile and statistics
- Public collection and watchlist
- Public lists and comments
- Basic trending data for context
"""

import os
import json
import requests
import time
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
import logging

# Load environment variables
load_dotenv('../.env.local')  # Look in project root folder

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TraktUserDataClient:
    def __init__(self):
        self.api_key = os.getenv('TRAKT_API_KEY')
        self.username = os.getenv('TRAKT_USERNAME', 'lrs')  # Default to 'lrs'
        
        if not self.api_key:
            raise ValueError("TRAKT_API_KEY environment variable is required")
        
        logger.info(f"Fetching data for Trakt user: {self.username}")
        
        self.base_url = 'https://api.trakt.tv'
        self.headers = {
            'Content-Type': 'application/json',
            'trakt-api-version': '2',
            'trakt-api-key': self.api_key
        }
        
        # Create output directories
        self.data_dir = Path('public/data/json')
        self.create_directory_structure()
    
    def create_directory_structure(self):
        """Create organized directory structure for JSON data"""
        directories = [
            'user',
            'user/stats',
            'user/profile',
            'user/history',
            'user/watched',
            'user/watchlist',
            'user/lists',
            'user/comments'
        ]
        
        for directory in directories:
            (self.data_dir / directory).mkdir(parents=True, exist_ok=True)
        
        # Create imgs directory for profile pictures
        imgs_dir = Path('public/data/imgs')
        imgs_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Created directory structure in {self.data_dir}")
        logger.info(f"Created imgs directory in {imgs_dir}")
    
    def make_request(self, endpoint, params=None):
        """Make request to Trakt API with rate limiting"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 60))
                logger.warning(f"Rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                return self.make_request(endpoint, params)
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {endpoint}: {e}")
            return None
    
    def save_json(self, data, filepath):
        """Save data to JSON file with metadata"""
        full_path = self.data_dir / filepath
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Add metadata
        output = {
            'metadata': {
                'fetched_at': datetime.now(timezone.utc).isoformat(),
                'source': 'trakt_api_user_data',
                'username': self.username,
                'endpoint': filepath,
                'count': len(data) if isinstance(data, list) else 1
            },
            'data': data
        }
        
        with open(full_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(data) if isinstance(data, list) else 1} items to {full_path}")
    
    def download_profile_picture(self, profile_data):
        """Download and save user's profile picture"""
        if not profile_data or 'images' not in profile_data:
            logger.info("No profile image data found")
            return
        
        images = profile_data.get('images', {})
        avatar = images.get('avatar', {})
        
        # Try different sizes, prefer larger ones
        image_url = None
        for size in ['full', 'medium', 'thumb']:
            if avatar.get(size):
                image_url = avatar[size]
                break
        
        if not image_url:
            logger.info("No profile picture URL found")
            return
        
        try:
            logger.info(f"Downloading profile picture from: {image_url}")
            response = requests.get(image_url, stream=True)
            response.raise_for_status()
            
            # Get file extension from URL or content type
            extension = 'jpg'  # default
            if '.' in image_url:
                url_ext = image_url.split('.')[-1].lower()
                if url_ext in ['jpg', 'jpeg', 'png', 'webp', 'gif']:
                    extension = url_ext
            
            # Save to imgs folder
            imgs_dir = Path('public/data/imgs')
            filename = f"dp.{extension}"
            filepath = imgs_dir / filename
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Profile picture saved to {filepath}")
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error downloading profile picture: {e}")
        except Exception as e:
            logger.error(f"Error saving profile picture: {e}")
    
    def fetch_user_profile(self):
        """Fetch user profile (public data)"""
        logger.info(f"Fetching profile for user: {self.username}")
        
        profile = self.make_request(f'/users/{self.username}?extended=full')
        if profile:
            self.save_json(profile, 'user/profile/basic.json')
            # Download profile picture if available
            self.download_profile_picture(profile)
        
        # User stats (public)
        stats = self.make_request(f'/users/{self.username}/stats')
        if stats:
            self.save_json(stats, 'user/stats/overview.json')
    
    def fetch_user_history(self):
        """Fetch user's watch history (public if user has public profile)"""
        logger.info(f"Fetching watch history for user: {self.username}")
        
        # Movie history
        movie_history = self.make_request(f'/users/{self.username}/history/movies')
        if movie_history:
            self.save_json(movie_history, 'user/history/movies.json')
        
        # Show history
        show_history = self.make_request(f'/users/{self.username}/history/shows')
        if show_history:
            self.save_json(show_history, 'user/history/shows.json')
    
    def fetch_user_watched(self):
        """Fetch user's watched movies and shows (public if user has public profile)"""
        logger.info(f"Fetching watched content for user: {self.username}")
        
        # Watched movies
        watched_movies = self.make_request(f'/users/{self.username}/watched/movies')
        if watched_movies:
            self.save_json(watched_movies, 'user/watched/movies.json')
        
        # Watched shows
        watched_shows = self.make_request(f'/users/{self.username}/watched/shows')
        if watched_shows:
            self.save_json(watched_shows, 'user/watched/shows.json')
    
    def fetch_user_watchlist(self):
        """Fetch user's watchlist (public if user has public profile)"""
        logger.info(f"Fetching watchlist for user: {self.username}")
        
        watchlist = self.make_request(f'/users/{self.username}/watchlist')
        if watchlist:
            self.save_json(watchlist, 'user/watchlist/all.json')
        
        # Watchlist by type
        for content_type in ['movies', 'shows']:
            type_watchlist = self.make_request(f'/users/{self.username}/watchlist/{content_type}')
            if type_watchlist:
                self.save_json(type_watchlist, f'user/watchlist/{content_type}.json')
    
    def fetch_user_lists(self):
        """Fetch user's public lists"""
        logger.info(f"Fetching lists for user: {self.username}")
        
        # User's lists
        lists = self.make_request(f'/users/{self.username}/lists')
        if lists:
            self.save_json(lists, 'user/lists/user_lists.json')
            
            # Fetch items from each public list
            for list_item in lists:
                list_slug = list_item.get('ids', {}).get('slug')
                if list_slug:
                    list_items = self.make_request(f'/users/{self.username}/lists/{list_slug}/items')
                    if list_items:
                        self.save_json(list_items, f'user/lists/{list_slug}_items.json')
    
    def fetch_user_comments(self):
        """Fetch user's comments"""
        logger.info(f"Fetching comments for user: {self.username}")
        
        comments = self.make_request(f'/users/{self.username}/comments')
        if comments:
            self.save_json(comments, 'user/comments/all.json')
    
    def fetch_metadata(self):
        """Fetch basic metadata needed for media downloads"""
        logger.info("Fetching basic metadata...")
        
    def fetch_all_user_data(self):
        """Fetch all available user data from Trakt API"""
        logger.info(f"Starting personal Trakt data fetch for user: {self.username}")
        
        try:
            # User-specific data only
            self.fetch_user_profile()
            self.fetch_user_history()
            self.fetch_user_watched()
            self.fetch_user_watchlist()
            self.fetch_user_lists()
            self.fetch_user_comments()
            
            # Basic metadata only (needed for media downloads)
            self.fetch_metadata()
            
            # Create index file
            index = {
                'last_updated': datetime.now(timezone.utc).isoformat(),
                'data_type': 'personal_user_data',
                'username': self.username,
                'authentication': 'api_key_only',
                'data_structure': {
                    'user': {
                        'profile': ['basic.json'],
                        'stats': ['overview.json'],
                        'history': ['movies.json', 'shows.json'],
                        'watched': ['movies.json', 'shows.json'],
                        'watchlist': ['all.json', 'movies.json', 'shows.json'],
                        'lists': ['user_lists.json', '[list_slug]_items.json'],
                        'comments': ['all.json']
                    }
                }
            }
            
            self.save_json(index, 'index.json')
            logger.info(f"Personal Trakt data fetch completed successfully for user: {self.username}!")
            
        except Exception as e:
            logger.error(f"Error during data fetch: {e}")
            raise

def main():
    """Main function"""
    try:
        client = TraktUserDataClient()
        client.fetch_all_user_data()
        
    except Exception as e:
        logger.error(f"Script failed: {e}")
        exit(1)

if __name__ == '__main__':
    main()
