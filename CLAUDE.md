# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal Trakt.tv watch dashboard: a Next.js 15 (App Router, React 19, Tailwind 4) site that serves **pre-fetched JSON snapshots** of one Trakt user's data, plus Python scripts (run by GitHub Actions) that produce those snapshots and the poster/backdrop images. Deployed to Cloudflare Pages.

## Commands

```bash
npm run dev          # next dev --turbopack
npm run build
npm run lint         # next lint (eslint.config.mjs, next/core-web-vitals + typescript)
npm run type-check   # tsc --noEmit
```

There is no JS test suite. The only CI check (`.github/workflows/test-scripts.yml`, on PRs touching `scripts/**`) is `py_compile` + import of the Python scripts, `python manage_data.py --help`, and the offline sync tests (`cd scripts && python test_sync.py`).

Python data scripts (Python 3.11, `pip install -r scripts/requirements.txt`), run from the repo root:

```bash
python scripts/manage_data.py {fetch|download|full|status|check|cleanup}
python scripts/download_media.py --cdn-repo-path <path-to-cdn-checkout>
python scripts/generate_cover.py
```

Env vars (in `.env.local`, loaded by both Next and the scripts via python-dotenv): `TRAKT_API_KEY` (Trakt client ID), `TRAKT_USERNAME` (defaults to `lrs`), `TMDB_API_KEY`, optional `NEXT_PUBLIC_BASE_URL` (sitemap). The README's `TRAKT_CLIENT_ID`/`CDN_BASE_URL`/`WSRV_BASE_URL` names are stale and not read by code.

## Architecture

### Data pipeline (offline, GitHub Actions)

`daily-trakt-sync.yml` (daily + every push to `main`):
1. `fetch_trakt_data.py` pulls the user's profile, stats, history, watched, watchlist, lists, comments from the Trakt API and writes them to `public/data/json/user/**` plus `public/data/json/index.json`. Committed as "🎬 Update Trakt data".
2. `download_media.py` walks those JSON files, downloads TMDB posters/backdrops/season posters into a **separate repo** (`abusayed0206/cdn`, checked out to `cdn-repo/`, folder `watch/`), and writes `public/data/media_index.json` listing every available filename. Committed as "📊 Update media index".

Both steps are incremental, and that's deliberate: `save_json` skips files whose `data` is unchanged, `index.json` is only rewritten when something else changed, the downloader only calls TMDB for images missing from the CDN checkout (plus one `/tv/{id}` call per show to catch new seasons), and `media_index.json` keeps its old `last_updated` when the file set is unchanged. A day with no Trakt activity therefore produces no commit and no redeploy. Don't add per-run timestamps to generated files.

`generate-cover.yml` builds `public/cover.webp` (896×272) + `public/cover.json` from watched data.

Trakt API docs live at https://developer.trakt.tv (the old apiary docs are deprecated); breaking changes are announced in GitHub Discussions on `trakt/trakt-api`. Since July 2026, list-style endpoints return only the first 100 items unless paged, so anything that should be complete must use `make_request(..., paginate=True)`. Watched shows also need `extended=progress` to include `seasons`. `/users/{id}/stats` is VIP-only (returns `204`), so `build_stats()` in `fetch_trakt_data.py` rebuilds the watched, plays and minutes numbers from watched data. It keeps the remaining fields (ratings, network, collected) from the last real snapshot, July 2026.

Consequence: most commits on `main` are bot data commits, and files under `public/data/` and `public/cover.*` are generated — don't hand-edit them; change the scripts instead. `scripts/README.md` describes an older "public trending data" version of the scripts and is out of date.

### Serving (Next.js)

- **No database and almost no live API calls.** `lib/services/trakt-data.ts` (`TraktDataService` singleton) reads the JSON files from `public/data/json` with `fs` and caches them in an in-memory `Map`. All `app/api/trakt/**` routes are thin wrappers over this service (typically switching on a `?type=movies|shows` query param and returning 404 when a file is missing). Search (`/api/trakt/search`) is also done in-memory over the same files.
- **Images:** `lib/imageIndex.ts` (`ImageIndexManager` singleton, preloaded by `lib/server-init.ts`) turns `media_index.json` into a TMDB-id → filenames lookup. `GET /api/images?type=movies|shows&category=posters|backdrops&tmdb_id=…[&season=N]` finds the file and **302-redirects** to `wsrv.nl` proxying `https://cfcdn.sayed.app/watch/<path>`. Components get these URLs via helpers in `lib/utils/media.ts` (`getMoviePosterUrl`, etc.) and render with `components/LazyImage`. `POST /api/images/reload-cache` reloads the index.
- **Live exceptions:** `/api/watching` calls the Trakt "watching" endpoint and TMDB live (needs env vars; see `WATCHING_FEATURE.md`). The `/movie/[tmdb_id]` and `/tv/[tmdb_id]` detail pages fetch from TMDB via `lib/services/tmdb.ts`, with TMDB images proxied through `lib/utils/image-proxy.ts`.
- `middleware.ts` adds permissive CORS headers to all `/api/*` routes (the API is intended for external consumption; documented in `API_DOCUMENTATION.md` and the `/docs` and `/api-test` pages).
- Types for the snapshot shapes live in `lib/types/` (`index.ts` Trakt, `tmdb.ts`, `api.ts`). Import alias `@/` → repo root.
- Allowed remote image hosts are configured in `next.config.ts` (`wsrv.nl`, `cfcdn.sayed.app/watch/**`).
