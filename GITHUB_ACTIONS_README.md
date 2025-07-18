# GitHub Actions Setup

This repository includes automated workflows for fetching Trakt data and downloading media files.

## Required Repository Secrets

You need to set up the following secrets in your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `TRAKT_API_KEY` | Your Trakt API Client ID | `abc123def456...` |
| `TRAKT_USERNAME` | Your Trakt username | `lrs` |
| `TMDB_API_KEY` | Your TMDB API key | `xyz789uvw...` |

## Workflows

### 1. Daily Trakt Data Sync (`daily-trakt-sync.yml`)

- **Schedule**: Runs daily at 05:34 AM UTC
- **Trigger**: Automatic (cron) or manual
- **Actions**:
  1. Fetches latest Trakt data using `manage_data.py fetch`
  2. Downloads missing media files using `download_media.py`
  3. Commits changes in 2 separate commits
  4. Pushes all changes in a single push
  5. Provides a summary of what was updated

### 2. Manual Media Download (`manual-media-download.yml`)

- **Schedule**: Manual trigger only
- **Options**:
  - `force_download`: Set to `true` to re-download all media files
- **Actions**:
  1. Downloads missing media files
  2. Optionally clears existing files if force download is enabled
  3. Commits and pushes changes

### 3. Test Scripts (`test-scripts.yml`)

- **Trigger**: On pull requests affecting scripts or workflows
- **Actions**:
  1. Tests Python script syntax
  2. Verifies imports work correctly
  3. Ensures directory structure is correct

## File Structure

```
├── .github/
│   └── workflows/
│       ├── daily-trakt-sync.yml
│       ├── manual-media-download.yml
│       └── test-scripts.yml
├── scripts/
│   ├── fetch_trakt_data.py
│   ├── download_media.py
│   ├── manage_data.py
│   └── requirements.txt
└── public/
    └── data/
        ├── json/          # Trakt JSON data
        └── imgs/          # Media images
```

## How It Works

1. **Data Fetching**: The workflow fetches your personal Trakt data (profile, history, watched, watchlist, lists, comments)
2. **Media Download**: Downloads high-quality posters and backdrops for movies/shows from TMDB
3. **Smart Skipping**: Only downloads images that don't already exist (efficient)
4. **Organized Storage**: Data is stored in organized JSON and image folders
5. **Git Integration**: Changes are automatically committed and pushed

## Manual Triggers

You can manually trigger workflows:

1. Go to Actions tab in your repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Configure options if available (like force download)

## Monitoring

- Check the Actions tab to monitor workflow runs
- Each run provides a summary of what was updated
- Failed runs will show error details for debugging

## Notes

- The workflow uses Ubuntu latest for consistency
- Python dependencies are cached for faster runs
- Environment files are securely created and cleaned up
- All commits are made by "GitHub Action" user
- The workflow respects API rate limits with built-in delays
