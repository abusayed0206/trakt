# API reference

A read-only JSON API over a daily snapshot of one Trakt.tv account (`lrs`), served at `https://trakt.sayed.app`.

- **Base URL:** `https://trakt.sayed.app/api`. Locally it's `http://localhost:3000/api`.
- **No authentication**, and CORS is open (`Access-Control-Allow-Origin: *`).
- **Freshness:** a GitHub Action syncs from Trakt once a day, and the site redeploys only when the data changed. `metadata.fetched_at` on each response is when that file last changed.
- **Shapes** are Trakt's own API objects, saved as-is apart from the trimming noted below. Field names follow the [Trakt API docs](https://developer.trakt.tv).
- **Errors** come back as `{ "error": "message" }` with status `400`, `404` or `500`.

## Response envelope

Most endpoints return the stored file:

```json
{
  "metadata": {
    "fetched_at": "2026-11-01T21:33:09.878057+00:00",
    "source": "trakt_api_user_data",
    "username": "lrs",
    "endpoint": "user/watched/shows.json",
    "count": 147
  },
  "data": [ ... ]
}
```

The endpoints that accept `type` return `{ "movies": <envelope>, "shows": <envelope> }` when `type` is omitted.

---

## `GET /api/trakt`

Index of the snapshot. `data.last_updated` is the last time any Trakt data changed.

`POST /api/trakt` clears the server's in-memory cache. On Vercel the data only changes with a redeploy, so you shouldn't need it.

## `GET /api/trakt/user/profile`

The Trakt profile (`/users/{id}?extended=full`): `username`, `name`, `location`, `about`, `joined_at`, `vip`, `ids`, …

## `GET /api/trakt/user/stats`

```json
{
  "movies":   { "plays": 878, "watched": 857, "minutes": 108692, "collected": 0, "ratings": 16, "comments": 8 },
  "shows":    { "watched": 147, "collected": 1, "ratings": 4, "comments": 1 },
  "episodes": { "plays": 5006, "watched": 4462, "minutes": 240192, "collected": 8, "ratings": 1, "comments": 8 },
  "network":  { "friends": 1, "followers": 8, "following": 11 },
  "ratings":  { "total": 21, "distribution": { "1": 1, "10": 5 } }
}
```

Trakt made `/users/{id}/stats` VIP-only in 2026. For non-VIP accounts, the sync rebuilds `movies.{plays,watched,minutes}`, `shows.watched` and `episodes.{plays,watched,minutes}` from the watched data:

- Movie minutes use each movie's runtime.
- Episode minutes use each show's average episode runtime.
- Specials (season 0) aren't counted.

The other fields are carried over from the last real snapshot (July 2026).

## `GET /api/trakt/user/history?type=movies|shows`

The 100 most recent plays of each type, newest first.

```json
{
  "id": 14584697656,
  "watched_at": "2026-10-29T19:30:00.000Z",
  "action": "watch",
  "type": "episode",
  "episode": { "season": 1, "number": 8, "title": "Part 8: The Call of the Wild", "ids": { "trakt": 6542024, "tmdb": 1199553 } },
  "show": { "title": "The Night Of", "year": 2016, "ids": { "trakt": 196851, "slug": "the-night-of", "imdb": "tt2401256", "tmdb": 66276 } }
}
```

## `GET /api/trakt/user/watched?type=movies|shows`

Everything ever watched, with play counts. The movie and show objects are trimmed to `title`, `year`, `ids` and `runtime`; shows also keep `aired_episodes`. Shows include per-season episode progress:

```json
{
  "plays": 8,
  "last_watched_at": "2026-10-29T19:30:00.000Z",
  "last_updated_at": "2026-10-29T19:30:00.000Z",
  "reset_at": null,
  "show": { "title": "The Night Of", "year": 2016, "ids": { "trakt": 196851, "tmdb": 66276 }, "aired_episodes": 8, "runtime": 60 },
  "seasons": [ { "number": 1, "episodes": [ { "number": 1, "plays": 1, "last_watched_at": "2026-10-29T19:30:00.000Z" } ] } ]
}
```

## `GET /api/trakt/user/watchlist?type=movies|shows`

The watchlist items. Each has `rank`, `id`, `listed_at`, `notes`, `type`, and a `movie` or `show`.

## `GET /api/trakt/user/lists`

Public lists: `name`, `description`, `share_link`, `item_count`, `updated_at`, `ids.slug`, …

## `GET /api/trakt/user/lists/{slug}`

Items of one list, using the slug from `/user/lists`. Each item is a Trakt list item (`rank`, `id`, `listed_at`, `type`, `movie` | `show`) plus a resolved image URL:

```json
{ "rank": 1, "type": "show", "show": { "title": "Lost", "...": "..." }, "poster": "https://wsrv.nl/?url=https%3A%2F%2Fcfcdn.sayed.app%2Fwatch%2Fshows%2Fposters%2F4607_poster.jpg&w=400&output=webp&q=90&maxage=31d" }
```

`poster` is `null` when the CDN has no poster for the title.

## `GET /api/trakt/user/comments`

Comments and reviews, newest first. Each item has `type` (`movie`, `show` or `episode`), the `movie`/`show`/`episode` it's about, and `comment` (`comment`, `spoiler`, `review`, `likes`, `replies`, `created_at`, …).

## `GET /api/trakt/search?q={query}&type=all|movies|shows`

Case-insensitive title search across watched items, the watchlist and history. `type` defaults to `all`.

```json
{
  "query": "night",
  "type": "all",
  "results": {
    "movies": [ { "movie": { "...": "..." }, "plays": 1, "last_watched_at": "...", "source": "watched", "poster": "https://wsrv.nl/?url=..." } ],
    "shows":  [ { "show":  { "...": "..." }, "source": "watched", "poster": null } ]
  }
}
```

`source` is `watched`, `watchlist` or `history`.

---

## Images

Images are downloaded from TMDB into a CDN repo, served from `https://cfcdn.sayed.app/watch/`, and resized through [wsrv.nl](https://wsrv.nl). `public/data/media_index.json` lists every file that exists.

### `GET /api/images?type=movies|shows&category=posters|backdrops&tmdb_id={id}[&season={n}]`

Returns a `302` redirect to a 400px-wide WebP, so you can use it directly as `<img src>`. Add `season` with `type=shows&category=posters` to get that season's poster. Returns `404` if the image isn't on the CDN.

### `GET /api/images/random-backdrop`

`{ "url": "<1920×1080 wsrv URL>", "tmdbId": "…", "type": "movies" | "shows", "filename": "…" }`

### `POST /api/images/reload-cache`

Reloads `media_index.json` into memory. Like `POST /api/trakt`, this is only useful when running locally.
