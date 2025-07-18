#!/usr/bin/env python3
"""
Trakt Data Management Utility

This script provides a unified interface for managing Trakt data fetching and media downloading.
It can be used to run both operations sequentially or individually.
"""

import os
import sys
import argparse
import logging
from datetime import datetime
from pathlib import Path

# Add scripts directory to path to import other modules
sys.path.append(str(Path(__file__).parent))

try:
    from fetch_trakt_data import TraktUserDataClient
    from download_media import MediaDownloader
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure all required files are in the scripts directory")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('trakt_data_management.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TraktDataManager:
    def __init__(self):
        self.start_time = datetime.now()
        logger.info("Initializing Trakt Data Manager...")
    
    def fetch_data_only(self):
        """Fetch Trakt data only"""
        logger.info("Starting Trakt data fetch...")
        try:
            client = TraktUserDataClient()
            client.fetch_all_user_data()
            logger.info("Trakt data fetch completed successfully!")
            return True
        except Exception as e:
            logger.error(f"Trakt data fetch failed: {e}")
            return False
    
    def download_media_only(self):
        """Download media files only"""
        logger.info("Starting media download...")
        try:
            downloader = MediaDownloader()
            downloader.download_all_media()
            logger.info("Media download completed successfully!")
            return True
        except Exception as e:
            logger.error(f"Media download failed: {e}")
            return False
    
    def full_update(self):
        """Perform full update: fetch data then download media"""
        logger.info("Starting full update process...")
        
        # Step 1: Fetch Trakt data
        if not self.fetch_data_only():
            logger.error("Full update failed at data fetch step")
            return False
        
        # Step 2: Download media
        if not self.download_media_only():
            logger.error("Full update failed at media download step")
            return False
        
        # Calculate total time
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        logger.info(f"Full update completed successfully in {duration}")
        return True
    
    def check_environment(self):
        """Check if all required environment variables are set"""
        required_vars = [
            'TRAKT_API_KEY',
            'TMDB_API_KEY'
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        if missing_vars:
            logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
            logger.error("Please set these variables in your .env.local file")
            return False
        
        logger.info("All required environment variables are set")
        logger.info("Note: Using public Trakt API endpoints (no authentication required)")
        return True
    
    def show_status(self):
        """Show status of data and media files"""
        logger.info("Checking data status...")
        
        data_dir = Path('public/data/json')
        images_dir = Path('public/data/imgs')
        
        if not data_dir.exists():
            logger.warning("JSON data directory doesn't exist")
        else:
            json_files = list(data_dir.rglob('*.json'))
            logger.info(f"Found {len(json_files)} JSON files")
            
            # Check index file
            index_file = data_dir / 'index.json'
            if index_file.exists():
                with open(index_file, 'r') as f:
                    import json
                    index_data = json.load(f)
                    if 'last_updated' in index_data:
                        logger.info(f"Data last updated: {index_data['last_updated']}")
        
        if not images_dir.exists():
            logger.warning("Images directory doesn't exist")
        else:
            image_files = list(images_dir.rglob('*.jpg')) + list(images_dir.rglob('*.png'))
            logger.info(f"Found {len(image_files)} image files")
            
            # Check media index
            media_index_file = images_dir / 'media_index.json'
            if media_index_file.exists():
                with open(media_index_file, 'r') as f:
                    import json
                    media_index = json.load(f)
                    if 'last_updated' in media_index:
                        logger.info(f"Media last updated: {media_index['last_updated']}")
    
    def cleanup_old_files(self, days=30):
        """Clean up files older than specified days"""
        logger.info(f"Cleaning up files older than {days} days...")
        
        from datetime import timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Clean up log files
        log_files = Path('.').glob('*.log')
        for log_file in log_files:
            if datetime.fromtimestamp(log_file.stat().st_mtime) < cutoff_date:
                log_file.unlink()
                logger.info(f"Deleted old log file: {log_file}")

def main():
    """Main function with command line argument parsing"""
    parser = argparse.ArgumentParser(description='Trakt Data Management Utility')
    parser.add_argument(
        'action',
        choices=['fetch', 'download', 'full', 'status', 'check', 'cleanup'],
        help='Action to perform'
    )
    parser.add_argument(
        '--cleanup-days',
        type=int,
        default=30,
        help='Days to keep files for cleanup action (default: 30)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    manager = TraktDataManager()
    
    # Check environment variables for actions that need them
    if args.action in ['fetch', 'download', 'full']:
        if not manager.check_environment():
            sys.exit(1)
    
    success = False
    
    if args.action == 'fetch':
        success = manager.fetch_data_only()
    elif args.action == 'download':
        success = manager.download_media_only()
    elif args.action == 'full':
        success = manager.full_update()
    elif args.action == 'status':
        manager.show_status()
        success = True
    elif args.action == 'check':
        success = manager.check_environment()
    elif args.action == 'cleanup':
        manager.cleanup_old_files(args.cleanup_days)
        success = True
    
    if not success:
        logger.error(f"Action '{args.action}' failed")
        sys.exit(1)
    else:
        logger.info(f"Action '{args.action}' completed successfully")

if __name__ == '__main__':
    main()
