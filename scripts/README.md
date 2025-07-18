# Trakt Public Data Management Scripts

This directory contains Python scripts for fetching public data from the Trakt API and downloading associated media files.

## Scripts Overview

### 1. `fetch_trakt_data.py`
Fetches comprehensive **public** data from the Trakt API (no authentication required) including:
- Trending movies and shows
- Popular content across different time periods
- Most watched, played, and collected content
- Box office data and recent updates
- Genre, certification, network, language, and country data
- Detailed information for popular movies and shows

### 2. `download_media.py`
Downloads media files (posters, backdrops, episode stills) using TMDB API:
- Movie posters and backdrops
- TV show posters and backdrops
- Episode stills
- Automatically creates thumbnails
- Organizes files in structured directories

### 3. `manage_data.py`
Unified utility script that can:
- Run data fetch only
- Run media download only
- Perform full update (both operations)
- Check environment configuration
- Show status of existing data
- Clean up old files

### 4. `config.py`
Configuration file containing:
- API endpoints and rate limits
- Image size configurations
- Directory structure definitions
- Default settings

## Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
Copy `.env.local.example` to `.env.local` and fill in your API keys:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `TRAKT_API_KEY` - Get from https://trakt.tv/oauth/applications (use Client ID)
- `TMDB_API_KEY` - Get from https://www.themoviedb.org/settings/api

**Note:** No authentication tokens required! We only use public Trakt API endpoints.

### 3. Get API Keys

#### Trakt API:
1. Go to https://trakt.tv/oauth/applications
2. Create a new application
3. Use the **Client ID** as your `TRAKT_API_KEY`
4. **No access token needed** - we only fetch public data

#### TMDB API:
1. Go to https://www.themoviedb.org/settings/api
2. Request an API key
3. Use the API key (v3 auth)

## Usage

### Using the Management Script (Recommended)

```bash
# Check environment setup
python manage_data.py check

# Fetch Trakt data only
python manage_data.py fetch

# Download media only (requires existing JSON data)
python manage_data.py download

# Full update (fetch data then download media)
python manage_data.py full

# Show status of current data
python manage_data.py status

# Clean up old files
python manage_data.py cleanup

# Verbose output
python manage_data.py full --verbose
```

### Using Individual Scripts

```bash
# Fetch Trakt data
python fetch_trakt_data.py

# Download media files
python download_media.py
```


## Features

### Public Data Collection
- **No authentication required** - Uses only public Trakt API endpoints
- Comprehensive trending and popular content data
- Box office and statistical information
- Genre, certification, and metadata collection
- Multiple time period analysis (weekly, monthly, yearly)

### Media Downloads
- High-quality images from TMDB
- Automatic thumbnail generation
- Organized directory structure
- Duplicate detection and skipping
- Configurable image sizes and limits

### Utility Features
- Environment validation
- Status reporting
- Cleanup functions
- Verbose logging
- Error recovery

## Rate Limiting

The scripts respect API rate limits:
- **Trakt API**: 1000 requests per hour
- **TMDB API**: 40 requests per 10 seconds

Built-in delays prevent hitting rate limits.

## Error Handling

- Network error recovery
- Rate limit handling
- Missing data graceful handling
- Comprehensive logging
- Partial failure recovery

## GitHub Actions Integration

These scripts are designed to be used in GitHub Actions. The recommended workflow:

1. **Daily data fetch** - Runs `manage_data.py fetch`
2. **Media download** - Runs `manage_data.py download` after data fetch
3. **Cleanup** - Weekly cleanup of old files

## Troubleshooting

### Common Issues

1. **Missing API Keys**
   - Check `.env.local` file exists and has correct values
   - Run `python manage_data.py check`

2. **Rate Limiting**
   - Scripts handle this automatically
   - Check logs for rate limit messages

3. **Missing Images**
   - Ensure JSON data exists first
   - Check TMDB API key is valid
   - Some items may not have TMDB IDs

4. **Network Issues**
   - Scripts retry failed requests
   - Check internet connection
   - Check API service status

### Logs

Scripts create detailed logs:
- Console output for immediate feedback
- `trakt_data_management.log` for detailed logs
- Use `--verbose` flag for debug information

## Dependencies

- `requests` - HTTP requests
- `python-dotenv` - Environment variable loading
- `pillow` - Image processing for thumbnails
- `pathlib` - Path handling
- `logging` - Comprehensive logging

## License

This project is for personal use with Trakt and TMDB APIs. Ensure compliance with their terms of service.
