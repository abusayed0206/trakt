#!/usr/bin/env python3
"""
Generate cover image from Trakt watched data
Fetches movies and shows data, creates cover.json, and generates a 896x272px cover image
with 20 posters arranged in 2 rows of 10 each in alternating pattern: 3 movies, 2 shows, 2 movies, 3 shows
"""

import requests
import json
import os
import random
from PIL import Image
from io import BytesIO
import sys

def fetch_json_data(url):
    """Fetch JSON data from URL"""
    try:
        print(f"📡 Fetching data from: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Handle API response structure - extract data array if it exists
        if isinstance(data, dict) and 'data' in data:
            actual_data = data['data']
            print(f"✅ Successfully fetched {len(actual_data)} items from data array")
            return actual_data
        elif isinstance(data, list):
            print(f"✅ Successfully fetched {len(data)} items")
            return data
        else:
            print(f"⚠️ Unexpected data structure: {type(data)}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching data from {url}: {e}")
        return []
    except json.JSONDecodeError as e:
        print(f"❌ Error parsing JSON from {url}: {e}")
        return []

def get_tmdb_poster_urls(movies_data, shows_data):
    """Extract TMDB IDs and create poster URLs, sorted by watch date (newest first)"""
    poster_data = {
        "movies": [],
        "shows": []
    }
    
    # Process movies with watch dates
    print("🎬 Processing movies...")
    movie_entries_with_dates = []
    for movie_entry in movies_data:
        if 'movie' in movie_entry and 'last_watched_at' in movie_entry:
            movie = movie_entry['movie']
            if 'ids' in movie and 'tmdb' in movie['ids'] and movie['ids']['tmdb']:
                tmdb_id = movie['ids']['tmdb']
                poster_url = f"https://cfcdn.sayed.app/watch/movies/posters/{tmdb_id}_poster.jpg"
                movie_entries_with_dates.append({
                    "tmdb_id": tmdb_id,
                    "title": movie.get('title', 'Unknown'),
                    "poster_url": poster_url,
                    "last_watched_at": movie_entry['last_watched_at']
                })
    
    # Sort by watch date (newest first) and take top 10
    movie_entries_with_dates.sort(key=lambda x: x['last_watched_at'], reverse=True)
    poster_data["movies"] = movie_entries_with_dates[:10]
    
    # Process shows with watch dates
    print("📺 Processing shows...")
    show_entries_with_dates = []
    for show_entry in shows_data:
        if 'show' in show_entry and 'last_watched_at' in show_entry:
            show = show_entry['show']
            if 'ids' in show and 'tmdb' in show['ids'] and show['ids']['tmdb']:
                tmdb_id = show['ids']['tmdb']
                
                # Use available seasons from the data, or fallback to random
                available_seasons = []
                if 'seasons' in show_entry:
                    available_seasons = [season['number'] for season in show_entry['seasons'] if season.get('number', 0) > 0]
                
                # Choose a season - prefer from available seasons, otherwise random 1-5
                if available_seasons:
                    season = random.choice(available_seasons)
                else:
                    season = random.randint(1, 5)
                
                poster_url = f"https://cfcdn.sayed.app/watch/shows/posters/{tmdb_id}/{season}/season_{season}_poster.jpg"
                show_entries_with_dates.append({
                    "tmdb_id": tmdb_id,
                    "title": show.get('title', 'Unknown'),
                    "season": season,
                    "available_seasons": available_seasons,
                    "poster_url": poster_url,
                    "last_watched_at": show_entry['last_watched_at']
                })
    
    # Sort by last watched date (newest first) and take top 10
    show_entries_with_dates.sort(key=lambda x: x['last_watched_at'], reverse=True)
    poster_data["shows"] = show_entries_with_dates[:10]
    
    print(f"✅ Selected {len(poster_data['movies'])} most recent movies")
    print(f"✅ Selected {len(poster_data['shows'])} most recent shows")
    
    return poster_data

def download_image(url, timeout=10):
    """Download image from URL and return PIL Image object"""
    try:
        print(f"⬇️ Downloading: {url}")
        response = requests.get(url, timeout=timeout)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        return image
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return None

def create_cover_image(poster_data, output_path):
    """Create a 896x272px cover image from poster data with alternating pattern"""
    # Cover dimensions - optimized for 20 posters in 2 rows
    cover_width = 896
    cover_height = 272
    
    # Poster dimensions - 2 rows of 10 posters each
    posters_per_row = 10
    poster_width = cover_width // posters_per_row  # 89px
    poster_height = cover_height // 2  # 136px
    
    # Create a new image with black background
    cover = Image.new('RGB', (cover_width, cover_height), (0, 0, 0))
    
    # Create alternating pattern: 3 movies, 2 shows, 2 movies, 3 shows (repeat)
    # Pattern for 20 positions: M M M S S M M S S S M M M S S M M S S S
    pattern = ['M', 'M', 'M', 'S', 'S', 'M', 'M', 'S', 'S', 'S', 
               'M', 'M', 'M', 'S', 'S', 'M', 'M', 'S', 'S', 'S']
    
    # Prepare sorted poster lists
    movies = [movie["poster_url"] for movie in poster_data["movies"]]
    shows = [show["poster_url"] for show in poster_data["shows"]]
    
    print(f"🎨 Creating cover with alternating pattern: 3M-2S-2M-3S...")
    print(f"📐 Poster dimensions: {poster_width}x{poster_height}")
    print(f"🎬 Available movies: {len(movies)}")
    print(f"📺 Available shows: {len(shows)}")
    
    successful_downloads = 0
    movie_index = 0
    show_index = 0
    
    for i in range(20):
        # Calculate position (2 rows of 10)
        row = i // posters_per_row
        col = i % posters_per_row
        
        x_position = col * poster_width
        y_position = row * poster_height
        
        # Determine which poster to use based on pattern
        if pattern[i] == 'M':
            # Use movie poster
            if movie_index < len(movies):
                poster_url = movies[movie_index]
                media_type = "Movie"
                movie_index += 1
            elif show_index < len(shows):
                # Fallback to show if no more movies
                poster_url = shows[show_index]
                media_type = "Show (fallback)"
                show_index += 1
            else:
                # Fallback to first movie if we run out
                poster_url = movies[0] if movies else None
                media_type = "Movie (repeat)"
        else:  # pattern[i] == 'S'
            # Use show poster
            if show_index < len(shows):
                poster_url = shows[show_index]
                media_type = "Show"
                show_index += 1
            elif movie_index < len(movies):
                # Fallback to movie if no more shows
                poster_url = movies[movie_index]
                media_type = "Movie (fallback)"
                movie_index += 1
            else:
                # Fallback to first show if we run out
                poster_url = shows[0] if shows else None
                media_type = "Show (repeat)"
        
        if poster_url:
            # Download and resize poster
            poster_img = download_image(poster_url)
            if poster_img:
                try:
                    # Resize to fit the calculated dimensions
                    poster_img = poster_img.resize((poster_width, poster_height), Image.Resampling.LANCZOS)
                    
                    # Paste onto cover at calculated position
                    cover.paste(poster_img, (x_position, y_position))
                    successful_downloads += 1
                    
                    print(f"✅ Added {media_type} {successful_downloads} at position ({x_position}, {y_position}): {poster_url}")
                    
                except Exception as e:
                    print(f"❌ Error processing poster {poster_url}: {e}")
        else:
            print(f"⚠️ No poster available for position {i+1}")
    
    if successful_downloads == 0:
        print("⚠️ No posters were successfully downloaded. Creating placeholder cover...")
        # Create a simple gradient or solid color as fallback
        for x in range(cover_width):
            for y in range(cover_height):
                # Simple gradient
                intensity = int((x / cover_width) * 50 + 20)
                cover.putpixel((x, y), (intensity, intensity, intensity))
    
    # Save the cover image
    cover.save(output_path, 'JPEG', quality=95)
    print(f"🖼️ Cover image saved: {output_path}")
    print(f"📊 Successfully processed {successful_downloads} posters")
    print(f"🔄 Pattern used: {'-'.join(pattern)}")

def main():
    """Main function"""
    print("🚀 Starting cover generation process...")
    
    # URLs to fetch data from
    movies_url = "https://trakt.sayed.app/api/trakt/user/watched?type=movies"
    shows_url = "https://trakt.sayed.app/api/trakt/user/watched?type=shows"
    
    # Fetch data
    movies_data = fetch_json_data(movies_url)
    shows_data = fetch_json_data(shows_url)
    
    if not movies_data and not shows_data:
        print("❌ No data fetched. Exiting...")
        sys.exit(1)
    
    # Create poster data
    poster_data = get_tmdb_poster_urls(movies_data, shows_data)
    
    # Ensure public directory exists
    os.makedirs('public', exist_ok=True)
    
    # Save cover.json
    cover_json_path = 'public/cover.json'
    with open(cover_json_path, 'w', encoding='utf-8') as f:
        json.dump(poster_data, f, indent=2, ensure_ascii=False)
    print(f"💾 Saved cover data: {cover_json_path}")
    
    # Create cover image
    cover_image_path = 'public/cover.jpg'
    create_cover_image(poster_data, cover_image_path)
    
    print("✅ Cover generation completed successfully!")

if __name__ == "__main__":
    main()
