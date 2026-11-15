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
from collections import Counter
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path
import logging

# Load environment variables
load_dotenv('../.env.local')  # Look in project root folder

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def build_stats(watched_movies, watched_shows, ratings, collected_movies, collected_shows,
                comments, lists, friends, followers, following):
    """Build the /users/{id}/stats shape from public endpoints.

    /stats is VIP-only since Sep 2026; Trakt's advice is to compute it client-side (trakt/trakt-api#929).
    `progress` (started/finished/dropped) has no public source, so it is left out.
    """
    # shortcut: episode minutes use the show's average episode runtime, not each episode's own
    episodes = [(show['show'].get('runtime') or 0, episode['plays'])
                for show in watched_shows
                for season in show.get('seasons', [])
                for episode in season['episodes']]
    rated = Counter(r['type'] for r in ratings)
    commented = Counter(c.get('type') for c in comments)
    movies = {
        'plays': sum(m['plays'] for m in watched_movies),
        'watched': len(watched_movies),
        'minutes': sum(m['plays'] * (m['movie'].get('runtime') or 0) for m in watched_movies),
        'collected': len(collected_movies),
        'ratings': rated['movie'],
        'comments': commented['movie'],
    }
    episode_stats = {
        'plays': sum(plays for _, plays in episodes),
        'watched': len(episodes),
        'minutes': sum(runtime * plays for runtime, plays in episodes),
        'collected': sum(len(s.get('episodes', [])) for show in collected_shows for s in show.get('seasons', [])),
        'ratings': rated['episode'],
        'comments': commented['episode'],
    }
    distribution = Counter(r['rating'] for r in ratings)
    return {
        'movies': movies,
        'shows': {'watched': len(watched_shows), 'collected': len(collected_shows),
                  'ratings': rated['show'], 'comments': commented['show']},
        'seasons': {'ratings': rated['season'], 'comments': commented['season']},
        'episodes': episode_stats,
        'network': {'friends': len(friends), 'followers': len(followers), 'following': len(following)},
        'ratings': {'total': len(ratings), 'distribution': {str(n): distribution[n] for n in range(1, 11)}},
        'lists': len(lists),
        'list_comments': commented['list'],
        'total_minutes': movies['minutes'] + episode_stats['minutes'],
        'total_plays': movies['plays'] + episode_stats['plays'],
    }

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
        
        self.changed = False  # set by save_json when any file's data changed

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
    
    def _get(self, endpoint, params=None):
        """GET from Trakt API with rate limiting; returns the response or None"""
        url = f"{self.base_url}{endpoint}"

        try:
            response = requests.get(url, headers=self.headers, params=params)

            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 60))
                logger.warning(f"Rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                return self._get(endpoint, params)

            response.raise_for_status()
            # e.g. /users/{id}/stats is VIP-only and returns 204 for non-VIP users
            if response.status_code == 204:
                logger.warning(f"No content returned for {endpoint}")
                return None
            return response

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching {endpoint}: {e}")
            return None

    def make_request(self, endpoint, params=None, paginate=False):
        """Make request to Trakt API; paginate=True fetches every page.

        Trakt returns only the first 100 items when page/limit are omitted (watched endpoints since July 2026).
        """
        if not paginate:
            response = self._get(endpoint, params)
            return response.json() if response is not None else None

        items, page = [], 1
        while True:
            # Trakt lowers limit to the endpoint's max (e.g. 100 for extended=progress) and reports it in the headers
            response = self._get(endpoint, {**(params or {}), 'page': page, 'limit': 250})
            if response is None:
                return None  # don't save a partial list over good data
            items.extend(response.json())
            # Stop on Page-Count: out-of-range pages can repeat data instead of returning []
            if page >= int(response.headers.get('X-Pagination-Page-Count', 1)):
                return items
            page += 1
    
    def save_json(self, data, filepath):
        """Save data to JSON file with metadata"""
        full_path = self.data_dir / filepath
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # Leave unchanged files alone so the daily sync only commits (and redeploys) real changes
        if full_path.exists():
            try:
                if json.loads(full_path.read_text(encoding='utf-8')).get('data') == data:
                    logger.info(f"Unchanged: {full_path}")
                    return
            except ValueError:
                pass
        self.changed = True

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
        
        # User stats (VIP-only; for other users fetch_user_watched rebuilds them from watched data)
        self.stats = self.make_request(f'/users/{self.username}/stats')
        # Since Nov 2026 non-VIP users get 200 with all-zero stats instead of 204; treat that as unavailable
        if self.stats and not (self.stats.get('movies', {}).get('watched') or self.stats.get('episodes', {}).get('watched')):
            self.stats = None
        if self.stats:
            self.save_json(self.stats, 'user/stats/overview.json')
    
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
        
        # Watched movies (extended=full adds runtime, used for rebuilt stats)
        watched_movies = self.make_request(f'/users/{self.username}/watched/movies',
                                           {'extended': 'full'}, paginate=True)
        # Keep only the pre-July-2026 default fields + runtime, so the daily-committed file stays small
        for item in watched_movies or []:
            item['movie'] = {k: item['movie'].get(k) for k in ('title', 'year', 'ids', 'runtime')}
        if watched_movies:
            self.save_json(watched_movies, 'user/watched/movies.json')

        # Watched shows (progress restores the per-season episode data the app reads; full adds runtime)
        watched_shows = self.make_request(f'/users/{self.username}/watched/shows',
                                          {'extended': 'full,progress'}, paginate=True)
        for item in watched_shows or []:
            item['show'] = {k: item['show'].get(k) for k in ('title', 'year', 'ids', 'aired_episodes', 'runtime')}
        if watched_shows:
            self.save_json(watched_shows, 'user/watched/shows.json')
        self.watched_movies, self.watched_shows = watched_movies, watched_shows
    
    def fetch_user_watchlist(self):
        """Fetch user's watchlist (public if user has public profile)"""
        logger.info(f"Fetching watchlist for user: {self.username}")
        
        watchlist = self.make_request(f'/users/{self.username}/watchlist', paginate=True)
        if watchlist:
            self.save_json(watchlist, 'user/watchlist/all.json')

        # Watchlist by type
        for content_type in ['movies', 'shows']:
            type_watchlist = self.make_request(f'/users/{self.username}/watchlist/{content_type}', paginate=True)
            if type_watchlist:
                self.save_json(type_watchlist, f'user/watchlist/{content_type}.json')
    
    def fetch_user_lists(self):
        """Fetch user's public lists"""
        logger.info(f"Fetching lists for user: {self.username}")
        
        # User's lists
        lists = self.lists = self.make_request(f'/users/{self.username}/lists')
        if lists:
            self.save_json(lists, 'user/lists/user_lists.json')
            
            # Fetch items from each public list
            for list_item in lists:
                list_slug = list_item.get('ids', {}).get('slug')
                if list_slug:
                    list_items = self.make_request(f'/users/{self.username}/lists/{list_slug}/items', paginate=True)
                    if list_items:
                        self.save_json(list_items, f'user/lists/{list_slug}_items.json')
    
    def fetch_user_comments(self):
        """Fetch user's comments"""
        logger.info(f"Fetching comments for user: {self.username}")
        
        comments = self.comments = self.make_request(f'/users/{self.username}/comments', paginate=True)
        if comments:
            self.save_json(comments, 'user/comments/all.json')

    def fetch_user_stats(self):
        """Rebuild stats from public endpoints when /stats (VIP-only) gave nothing usable"""
        if self.stats:
            return  # VIP: precomputed stats already saved by fetch_user_profile
        user = f'/users/{self.username}'
        parts = {
            'watched_movies': self.watched_movies,
            'watched_shows': self.watched_shows,
            'ratings': self.make_request(f'{user}/ratings', paginate=True),
            'collected_movies': self.make_request(f'{user}/collection/movies', paginate=True),
            'collected_shows': self.make_request(f'{user}/collection/shows', paginate=True),
            'comments': self.comments,
            'lists': self.lists,
            'friends': self.make_request(f'{user}/friends', paginate=True),
            'followers': self.make_request(f'{user}/followers', paginate=True),
            'following': self.make_request(f'{user}/following', paginate=True),
        }
        failed = [name for name, value in parts.items() if value is None]
        if failed:
            logger.warning(f"Not rebuilding stats; failed to fetch: {', '.join(failed)}")
            return  # keep the last full stats rather than save partial numbers
        logger.info("Stats endpoint is VIP-only; rebuilding stats from public endpoints")
        self.save_json(build_stats(**parts), 'user/stats/overview.json')
    
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
            self.fetch_user_stats()

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
            
            # last_updated = last time any data changed
            if self.changed or not (self.data_dir / 'index.json').exists():
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
