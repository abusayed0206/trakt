# CDN Migration Summary

## Overview
The media download system has been updated to use a separate CDN repository for storing images while keeping the media index in the main repository.

## Changes Made

### 1. Modified `scripts/download_media.py`
- **Added CDN support**: The `MediaDownloader` class now accepts an optional `cdn_repo_path` parameter
- **Dual path handling**: 
  - When `cdn_repo_path` is provided: Images saved to `{cdn_repo_path}/watch/`, index saved to `public/data/media_index.json`
  - When not provided (fallback): Images saved to `public/data/imgs/`, index saved to `public/data/imgs/media_index.json`
- **Command line interface**: Added `--cdn-repo-path` argument for CLI usage

### 2. Updated GitHub Actions Workflows

#### Daily Trakt Sync (`daily-trakt-sync.yml`)
- **Added CDN repo checkout**: Now clones `abusayed0206/cdn` repository to `cdn-repo/`
- **Separate commits**: 
  - Main repo: Commits Trakt data and media index
  - CDN repo: Commits image files
- **Updated paths**: All image operations now target `cdn-repo/watch/`

#### Manual Media Download (`manual-media-download.yml`)
- **Same CDN integration**: Updated to use the new dual-repository approach
- **Force download**: Now clears CDN directory when force download is enabled
- **Dual push**: Pushes changes to both repositories

### 3. Updated Frontend Code (`lib/utils/media-async.ts`)
- **Improved placeholder**: Replaced local placeholder paths with external placeholder service
- **CDN ready**: Already configured to use `https://cfcdn.sayed.app/watch/` CDN

## Repository Structure

### Main Repository (abusayed0206/watch)
```
public/
  data/
    json/                 # Trakt API data
    media_index.json     # Index of all available media files
```

### CDN Repository (abusayed0206/cdn)
```
watch/                   # Equivalent to old /public/data/imgs
  movies/
    posters/            # Movie poster images
    backdrops/          # Movie backdrop images
  shows/
    posters/            # Show poster images (main + seasons)
      [tmdb_id]/
        [season_number]/
    backdrops/          # Show backdrop images
  thumbnails/           # Thumbnail images
```

## Benefits

1. **Separation of concerns**: Code/data in main repo, media files in CDN repo
2. **Better performance**: Images served from optimized CDN infrastructure
3. **Reduced main repo size**: Large binary files moved to dedicated repository
4. **Scalability**: CDN can handle high-bandwidth image serving
5. **Backward compatibility**: Frontend already configured for CDN usage

## Migration Impact

- **No frontend changes required**: Already using CDN URLs
- **API compatibility**: Image API continues to work with CDN URLs
- **Workflow automation**: Both repositories updated automatically
- **Fallback support**: Script works without CDN repo for local development

## Environment Variables Required

- `TRAKT_API_KEY`: For fetching Trakt data
- `TRAKT_USERNAME`: For user-specific Trakt data
- `TMDB_API_KEY`: For downloading images from TMDB
- `GITHUB_TOKEN`: For accessing both repositories in workflows

## Usage

### Automated (GitHub Actions)
The daily sync will automatically:
1. Fetch new Trakt data
2. Download missing images to CDN repo
3. Update media index in main repo
4. Commit and push to both repositories

### Manual
```bash
# With CDN repo
python scripts/download_media.py --cdn-repo-path /path/to/cdn/repo

# Without CDN repo (fallback to local)
python scripts/download_media.py
```

## Next Steps

1. **Monitor first automated run**: Verify both repositories are updated correctly
2. **CDN setup**: Ensure `https://cfcdn.sayed.app/watch/` points to the CDN repository
3. **Cleanup**: Consider removing old `/public/data/imgs` directory after successful migration
4. **Documentation**: Update README and API documentation with new structure
