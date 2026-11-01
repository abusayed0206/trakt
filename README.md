# Trakt Watch Dashboard

A personal dashboard for my [Trakt.tv](https://trakt.tv/users/lrs) history, live at **[trakt.sayed.app](https://trakt.sayed.app)**.

It shows watch stats, recently watched movies and shows, my watchlist and lists, reviews, and a searchable library of everything I've watched. Each title has its own page with TMDB details. A small read-only JSON API serves the same data.

![Cover](public/cover.webp)

## How it works

There's no database, and the site doesn't call Trakt when someone visits. Instead:

1. **Once a day**, a GitHub Action (`daily-trakt-sync.yml`) fetches my Trakt data into `public/data/json/` and downloads any new posters and backdrops from TMDB. The images go into a separate CDN repo, served from `cfcdn.sayed.app/watch/`.
2. The sync is **incremental**. It only rewrites JSON whose data changed and only asks TMDB about images the CDN doesn't have yet. A day without new activity makes no commit at all, so there's nothing to redeploy.
3. When something did change, the commit makes **Vercel** redeploy. The homepage is pre-rendered at build time from those JSON files, so it loads as a single static page. Images are served through [wsrv.nl](https://wsrv.nl) as resized WebP.

The movie and TV detail pages (`/movie/[tmdb_id]`, `/tv/[tmdb_id]`) are the only parts that fetch live data, from TMDB.

```
Trakt API ──┐                             ┌─► public/data/json/*.json ──► Vercel build ──► static site
            ├─► GitHub Action (daily) ────┤
TMDB API  ──┘                             └─► cdn repo (watch/*.jpg) ──► wsrv.nl ──► images
```

## Stack

- Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript
- Python 3.11 scripts for the data sync (`scripts/`)
- Vercel for hosting, a GitHub repo as the image CDN, wsrv.nl for image resizing

## Running locally

```bash
npm install
npm run dev
```

The repo already contains the latest data snapshot, so the dashboard works without any keys. The movie and TV detail pages need a TMDB key in `.env.local`:

```bash
TMDB_API_KEY=your_tmdb_v3_key
```

Other commands:

```bash
npm run build        # production build (pre-renders the homepage)
npm run lint
npm run type-check
```

## Refreshing the data yourself

```bash
pip install -r scripts/requirements.txt
python scripts/manage_data.py fetch                                   # Trakt → public/data/json
python scripts/download_media.py --cdn-repo-path ../cdn               # new images → ../cdn/watch
cd scripts && python test_sync.py                                      # offline tests for the sync scripts
```

`.env.local` for the scripts:

```bash
TRAKT_API_KEY=your_trakt_client_id
TRAKT_USERNAME=your_trakt_username
TMDB_API_KEY=your_tmdb_v3_key
```

A few Trakt API details these scripts handle:

- Since mid-2026, list endpoints only return the first 100 items unless you page through them. The fetcher always pages.
- Watched shows are fetched with `extended=full,progress`, which adds season progress and runtime.
- `/users/{id}/stats` is now VIP-only. For other accounts the fetcher rebuilds watch counts and watch time from the watched data.

## GitHub Actions

| Workflow | When | What it does |
| --- | --- | --- |
| `daily-trakt-sync.yml` | daily 05:34 UTC, on push to `main`, manually | Fetches Trakt data, downloads missing images to the CDN repo, commits only what changed |
| `generate-cover.yml` | daily 06:00 UTC, when watched data changes, manually | Builds `public/cover.webp` from recently watched posters |
| `manual-media-download.yml` | manually | Re-runs the image download; optionally wipes the CDN folder first to re-download everything |
| `test-scripts.yml` | PRs touching `scripts/` | Compiles the scripts and runs the offline sync tests |

Repository secrets:

| Secret | Used for |
| --- | --- |
| `TRAKT_API_KEY` | Trakt app Client ID ([developer.trakt.tv](https://developer.trakt.tv/apps)). From January 1, 2027, the Trakt developer account must have a linked GitHub account. |
| `TRAKT_USERNAME` | Whose data to fetch |
| `TMDB_API_KEY` | TMDB v3 API key |
| `PAT_TOKEN` | A personal access token with `repo` scope, so the workflows can push to the private CDN repo |

## API

All endpoints are read-only `GET`s with CORS enabled. You can try them at [/api-test](https://trakt.sayed.app/api-test). The full reference is in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

| Endpoint | Returns |
| --- | --- |
| `/api/trakt` | Index of the snapshot |
| `/api/trakt/user/profile` · `/stats` · `/comments` · `/lists` | Profile, stats, comments, lists |
| `/api/trakt/user/history?type=movies\|shows` | Last 100 plays |
| `/api/trakt/user/watched?type=movies\|shows` | Everything watched |
| `/api/trakt/user/watchlist?type=movies\|shows` | Watchlist |
| `/api/trakt/user/lists/{slug}` | List items, with poster URLs |
| `/api/trakt/search?q=…&type=all\|movies\|shows` | Title search |
| `/api/images?type=movies\|shows&category=posters\|backdrops&tmdb_id=…` | Redirects to the image |

## Project layout

```
app/                 pages (homepage, /movie, /tv, /docs, /api-test) and API routes
components/          homepage sections (Hero, PosterGrid, ListsBrowser, Reviews, …)
lib/services/        trakt-data.ts reads the JSON snapshot; tmdb.ts calls TMDB for detail pages
lib/imageIndex.ts    maps TMDB ids to CDN image files using public/data/media_index.json
scripts/             Python sync: fetch_trakt_data.py, download_media.py, generate_cover.py
public/data/         generated by the sync; don't edit by hand
```

## Credits

Data from [Trakt](https://trakt.tv) and [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
