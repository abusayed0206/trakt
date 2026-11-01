# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal Trakt.tv watch dashboard: a Next.js 15 (App Router, React 19, Tailwind 4) site that serves **pre-fetched JSON snapshots** of one Trakt user's data, plus Python scripts (run by GitHub Actions) that produce those snapshots and the poster/backdrop images. Deployed on Vercel, where every push to `main` redeploys; the README's Cloudflare Pages instructions are stale.

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

Consequence: most commits on `main` are bot data commits, and files under `public/data/` and `public/cover.*` are generated — don't hand-edit them; change the scripts instead.

### Serving (Next.js)

- **No database and no live Trakt calls.** `lib/services/trakt-data.ts` (`TraktDataService` singleton) reads the JSON files from `public/data/json` with `fs` and caches them in memory. All `app/api/trakt/**` routes are thin wrappers over it (usually switching on `?type=movies|shows`, 404 when a file is missing); search is in-memory over the same files.
- **Homepage is a static server component.** `app/page.tsx` is `force-static`: at build time it reads the snapshot via `TraktDataService`, turns everything into small `MediaCard` objects (`components/PosterCard.tsx`) with poster URLs already resolved, and passes them to client components (`PosterGrid` for show-more, `ListsBrowser`, `Reviews`, `SearchInterface`). Only list items (thousands per list) and search are fetched client-side through `lib/services/api.ts`. Because data only changes on redeploy, never call the app's own `/api/*` routes from server code — read `TraktDataService` directly (the detail pages used to, and the relative fetch silently failed).
- **Images:** `lib/imageIndex.ts` turns `media_index.json` into a TMDB-id → filenames lookup (cached for the process lifetime). `getImageUrl(type, category, tmdbId, { season, width })` returns the wsrv.nl URL for `https://cfcdn.sayed.app/watch/<path>` or `null`; use it server-side instead of linking `/api/images` (which is a 302-redirect wrapper around the same function, kept for API consumers). The list-items and search routes add a resolved `poster` field for the same reason.
- **Live exception:** the `/movie/[tmdb_id]` and `/tv/[tmdb_id]` detail pages fetch from TMDB at request time via `lib/services/tmdb.ts` (needs `TMDB_API_KEY`; without it they 404 locally), with TMDB images proxied through `lib/utils/image-proxy.ts`.
- **Styling:** dark-only (zinc-950 background, red accent), matching the detail pages. Sections use `components/Section.tsx`; every poster tile is `PosterCard`.
- `middleware.ts` adds permissive CORS headers to all `/api/*` routes (the API is intended for external consumption; documented in `API_DOCUMENTATION.md` and the `/docs` and `/api-test` pages).
- Types for the snapshot shapes live in `lib/types/` (`index.ts` Trakt, `tmdb.ts`, `api.ts`). Import alias `@/` → repo root.
- Allowed remote image hosts are configured in `next.config.ts` (`wsrv.nl`, `cfcdn.sayed.app/watch/**`).
