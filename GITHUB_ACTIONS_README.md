# GitHub Actions Setup

This repository includes automated workflows for fetching Trakt data and downloading media files using a dual-repository system.

## Repository Structure

This project uses two repositories:

1. **Main Repository** (`your-username/watch`): Contains the Next.js application, Trakt data, and media index
2. **CDN Repository** (`your-username/cdn`): Contains all media files (posters, backdrops, thumbnails)

## Initial Setup

### 1. Create Repositories

1. **Fork or create the main repository** with your watch dashboard code
2. **Create a CDN repository** (e.g., `your-username/cdn`) - this can be a simple empty repository

### 2. Repository Secrets Setup

You need to set up secrets in **both repositories**:

#### Main Repository Secrets
Go to your main repository → Settings → Secrets and variables → Actions

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `TRAKT_API_KEY` | Your Trakt API Client ID | `abc123def456...` |
| `TRAKT_USERNAME` | Your Trakt username | `yourusername` |
| `TMDB_API_KEY` | Your TMDB API key | `xyz789uvw...` |
| ` PAT_TOKEN` | Personal Access Token for CDN repo | `ghp_xxxxxxxxxxxx` |

#### CDN Repository Secrets
Go to your CDN repository → Settings → Secrets and variables → Actions

| Secret Name | Description |
|-------------|-------------|
| `GITHUB_TOKEN` | Automatically provided by GitHub |

### 3. Personal Access Token Setup

For the main repository to access your CDN repository, you need a Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
4. Copy the token and add it as ` PAT_TOKEN` secret in your main repository

### 4. Update Repository Names in Workflows

In your main repository, update the workflow files to use your repository names:

**File**: `.github/workflows/daily-trakt-sync.yml`
```yaml
# Update this line (around line 25):
- name: Checkout CDN repository
  uses: actions/checkout@v4
  with:
    repository: your-username/cdn  # Change this to your CDN repo
    token: ${{ secrets. PAT_TOKEN }}
    path: cdn-repo
```

**File**: `.github/workflows/manual-media-download.yml`
```yaml
# Update this line (around line 20):
- name: Checkout CDN repository
  uses: actions/checkout@v4
  with:
    repository: your-username/cdn  # Change this to your CDN repo
    token: ${{ secrets. PAT_TOKEN }}
    path: cdn-repo
```

### 5. Configure CDN URL (Optional)

If you want to serve images from a custom CDN:

1. Set up your CDN to point to your CDN repository
2. Update the CDN URL in `lib/utils/media.ts`:
```typescript
const CDN_BASE_URL = 'https://your-cdn-domain.com/watch/';
```

## API Keys Setup

### Trakt API Key
1. Go to [Trakt API](https://trakt.tv/oauth/applications)
2. Create a new application
3. Copy the Client ID (this is your `TRAKT_API_KEY`)

### TMDB API Key
1. Go to [TMDB API](https://www.themoviedb.org/settings/api)
2. Create an account and request an API key
3. Copy the API key (this is your `TMDB_API_KEY`)

## File Structure After Setup

### Main Repository (`your-username/watch`)
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
├── public/
│   └── data/
│       ├── json/          # Trakt JSON data
│       └── media_index.json # Index of available media
└── app/                   # Next.js application
```

### CDN Repository (`your-username/cdn`)
```
└── watch/                 # Media files directory
    ├── movies/
    │   ├── posters/       # Movie poster images
    │   └── backdrops/     # Movie backdrop images
    ├── shows/
    │   ├── posters/       # Show poster images
    │   │   └── [tmdb_id]/
    │   │       └── [season]/
    │   └── backdrops/     # Show backdrop images
    └── thumbnails/        # Thumbnail images
```

## Workflows

### 1. Daily Trakt Data Sync (`daily-trakt-sync.yml`)

- **Schedule**: Runs daily at 05:34 AM UTC
- **Trigger**: Automatic (cron) or manual
- **Actions**:
  1. Fetches latest Trakt data using `manage_data.py fetch`
  2. Downloads missing media files to CDN repository
  3. Updates media index in main repository
  4. Commits changes to both repositories
  5. Provides a summary of what was updated

**Repositories Updated:**
- Main repo: Trakt JSON data + media index
- CDN repo: New media files (posters, backdrops)

### 2. Manual Media Download (`manual-media-download.yml`)

- **Schedule**: Manual trigger only
- **Options**:
  - `force_download`: Set to `true` to re-download all media files
- **Actions**:
  1. Downloads missing media files to CDN repository
  2. Optionally clears existing CDN files if force download is enabled
  3. Updates media index in main repository
  4. Commits and pushes changes to both repositories

### 3. Test Scripts (`test-scripts.yml`)

- **Trigger**: On pull requests affecting scripts or workflows
- **Actions**:
  1. Tests Python script syntax
  2. Verifies imports work correctly
  3. Ensures directory structure is correct

## How It Works

1. **Dual Repository System**: 
   - Main repository stores application code and Trakt data
   - CDN repository stores all media files for better performance

2. **Data Fetching**: Workflows fetch your personal Trakt data (profile, history, watched, watchlist, lists, comments)

3. **Media Download**: Downloads high-quality posters and backdrops from TMDB to CDN repository

4. **Smart Skipping**: Only downloads images that don't already exist (efficient)

5. **Organized Storage**: 
   - Trakt data stored as JSON in main repository
   - Media files organized by type in CDN repository
   - Media index tracks all available files

6. **Automated Commits**: Changes are automatically committed to both repositories

## Manual Triggers

You can manually trigger workflows:

1. Go to Actions tab in your **main repository**
2. Select the workflow you want to run
3. Click "Run workflow"
4. Configure options if available (like force download)

## Monitoring

- Check the Actions tab in your main repository to monitor workflow runs
- Each run provides a summary of what was updated in both repositories
- Failed runs will show error details for debugging
- CDN repository will show commit history of media file updates

## Troubleshooting

### Common Issues

1. **"Repository not found" error**:
   - Verify CDN repository name in workflow files
   - Check that ` PAT_TOKEN` has correct permissions

2. **"Permission denied" error**:
   - Ensure Personal Access Token has `repo` and `workflow` scopes
   - Verify token is added as ` PAT_TOKEN` secret

3. **Media files not loading**:
   - Check that CDN URL is correctly configured
   - Verify media files are being committed to CDN repository

4. **API rate limits**:
   - Workflows include built-in delays to respect API limits
   - Check API key validity if requests are failing

### Verification Steps

After setup, verify everything works:

1. **Manual trigger**: Run the "Manual Media Download" workflow
2. **Check commits**: Verify both repositories receive commits
3. **Test frontend**: Ensure images load correctly in your application
4. **Monitor daily sync**: Check that automated daily sync works

## Notes

- Workflows use Ubuntu latest for consistency
- Python dependencies are cached for faster runs
- Environment files are securely created and cleaned up
- All commits are made by "GitHub Action" user
- The system respects API rate limits with built-in delays
- CDN repository can be public for better CDN performance
- Main repository can remain private to protect API keys
