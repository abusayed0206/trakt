# Trakt API Documentation

This API provides access to your personal Trakt data stored as JSON files. All endpoints return data in the same format as the original Trakt API responses, with added metadata about when the data was fetched.

## Base URL

```
/api/trakt
```

## Endpoints

### 📊 General

#### `GET /api/trakt`

Get the main index with data structure overview.

**Response:**

```json
{
  "metadata": {
    ### 🔍 Search & Utilities025-07-18T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "lrs",
    "endpoint": "index.json",
    "count": 1
  },
  "data": {
    "last_updated": "2025-07-18T09:00:13.040949+00:00",
    "data_type": "personal_user_data",
    "username": "lrs",
    "authentication": "api_key_only",
    "data_structure": { ... }
  }
}
```

#### `POST /api/trakt`

Clear the in-memory cache to refresh data from JSON files.

**Response:**

```json
{
  "message": "Cache cleared successfully"
}
```

### 👤 User Profile

#### `GET /api/trakt/user/profile`

Get user profile information.

**Response:**

```json
{
  "metadata": { ... },
  "data": {
    "username": "lrs",
    "private": false,
    "name": "John Doe",
    "biography": "...",
    "location": "...",
    "website": "...",
    "joined_at": "2025-01-01T00:00:00.000Z",
    "avatar": {
      "full": "https://..."
    },
    "ids": {
      "slug": "lrs"
    }
  }
}
```

#### `GET /api/trakt/user/stats`

Get user statistics overview.

**Response:**

```json
{
  "metadata": { ... },
  "data": {
    "movies": {
      "plays": 1234,
      "watched": 567,
      "minutes": 89012,
      "collected": 345,
      "ratings": 234,
      "comments": 12
    },
    "shows": {
      "watched": 89,
      "collected": 67,
      "ratings": 45,
      "comments": 23
    },
    "episodes": {
      "plays": 3456,
      "watched": 2789,
      "minutes": 123456,
      "collected": 1234,
      "ratings": 567,
      "comments": 89
    },
    "network": {
      "friends": 12,
      "followers": 34,
      "following": 56
    },
    "ratings": {
      "total": 234,
      "distribution": {
        "1": 2,
        "2": 3,
        "3": 5,
        "4": 8,
        "5": 13,
        "6": 21,
        "7": 34,
        "8": 55,
        "9": 89,
        "10": 144
      }
    }
  }
}
```

### 📺 Watch History

#### `GET /api/trakt/user/history`

Get watch history for all content.

**Query Parameters:**

- `type` (optional): `movies`, `shows`, or `all` (default: `all`)

**Examples:**

- `/api/trakt/user/history` - All history
- `/api/trakt/user/history?type=movies` - Movie history only
- `/api/trakt/user/history?type=shows` - Show history only

**Response (when type=all):**

```json
{
  "movies": {
    "metadata": { ... },
    "data": [
      {
        "id": 12345,
        "watched_at": "2025-07-18T08:30:00.000Z",
        "action": "watch",
        "type": "movie",
        "movie": {
          "title": "Inception",
          "year": 2010,
          "ids": {
            "trakt": 1,
            "slug": "inception-2010",
            "imdb": "tt1375666",
            "tmdb": 27205
          }
        }
      }
    ]
  },
  "shows": { ... }
}
```

### ✅ Watched Content

#### `GET /api/trakt/user/watched`

Get watched content with play counts and dates.

**Query Parameters:**

- `type` (optional): `movies`, `shows`, or `all` (default: `all`)

**Examples:**

- `/api/trakt/user/watched` - All watched content
- `/api/trakt/user/watched?type=movies` - Watched movies only
- `/api/trakt/user/watched?type=shows` - Watched shows only

**Response:**

```json
{
  "movies": {
    "metadata": { ... },
    "data": [
      {
        "plays": 2,
        "last_watched_at": "2025-07-18T08:30:00.000Z",
        "last_updated_at": "2025-07-18T08:30:00.000Z",
        "movie": {
          "title": "Inception",
          "year": 2010,
          "ids": { ... }
        }
      }
    ]
  },
  "shows": {
    "metadata": { ... },
    "data": [
      {
        "plays": 45,
        "last_watched_at": "2025-07-18T08:30:00.000Z",
        "last_updated_at": "2025-07-18T08:30:00.000Z",
        "show": {
          "title": "Breaking Bad",
          "year": 2008,
          "ids": { ... }
        },
        "seasons": [
          {
            "number": 1,
            "episodes": [
              {
                "number": 1,
                "plays": 1,
                "last_watched_at": "2025-07-18T08:30:00.000Z"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 📝 Watchlist

#### `GET /api/trakt/user/watchlist`

Get watchlist items.

**Query Parameters:**

- `type` (optional): `movies`, `shows`, or `all` (default: `all`)

**Response:**

```json
{
  "movies": {
    "metadata": { ... },
    "data": [
      {
        "rank": 1,
        "id": 12345,
        "listed_at": "2025-07-18T08:30:00.000Z",
        "notes": "Must watch this weekend",
        "type": "movie",
        "movie": {
          "title": "Dune",
          "year": 2021,
          "ids": { ... }
        }
      }
    ]
  },
  "shows": { ... }
}
```

### 💬 Comments & Lists

#### `GET /api/trakt/user/comments`

Get user comments on movies and shows.

#### `GET /api/trakt/user/lists`

Get user's created lists.

**Response:**

```json
{
  "metadata": { ... },
  "data": [
    {
      "name": "Personal MDBList",
      "description": "This list is maintained by mdblist.com",
      "privacy": "public",
      "share_link": "https://trakt.tv/lists/30436377",
      "type": "personal",
      "display_numbers": false,
      "allow_comments": true,
      "sort_by": "rank",
      "sort_how": "asc",
      "created_at": "2025-01-18T09:06:17.000Z",
      "updated_at": "2025-03-26T06:43:15.000Z",
      "item_count": 69,
      "comment_count": 0,
      "likes": 0,
      "ids": {
        "trakt": 30436377,
        "slug": "personal-mdblist"
      },
      "user": { ... }
    }
  ]
}
```

#### `GET /api/trakt/user/lists/[id]`

Get items from a specific list by slug ID.

**Examples:**

- `/api/trakt/user/lists/personal-mdblist` - Items in Personal MDBList
- `/api/trakt/user/lists/series-watchlist-for-2025` - Items in Series Watchlist for 2025
- `/api/trakt/user/lists/anticipated-movies` - Items in Anticipated Movies list


### 🖼️ Images

#### `GET /api/images`

**🚀 NEW: Direct Image Serving with In-Memory Caching**

This endpoint now serves image **bytes** directly in a single request using in-memory indexing for blazing fast performance.

**Required Query Parameters:**

- `type`: `movies` or `shows` (not required for thumbnails)
- `category`: `posters` or `backdrops` 
- `tmdb_id`: TMDB ID of the movie/show

**Optional Query Parameters:**

- `season`: Season number (only for show posters)

**Supported Endpoints:**

**Movie & Show Images (serves image bytes directly):**
- `/api/images?type=movies&category=posters&tmdb_id=XXX` - Movie poster bytes
- `/api/images?type=movies&category=backdrops&tmdb_id=XXX` - Movie backdrop bytes
- `/api/images?type=shows&category=posters&tmdb_id=XXX` - Show poster bytes  
- `/api/images?type=shows&category=backdrops&tmdb_id=XXX` - Show backdrop bytes
- `/api/images?type=shows&category=posters&tmdb_id=XXX&season=X` - Season X poster bytes

**Thumbnails (serves image bytes directly):**
- `/api/images?category=posters&tmdb_id=XXX` - Thumbnail poster bytes
- `/api/images?category=backdrops&tmdb_id=XXX` - Thumbnail backdrop bytes

**Response:**

✅ **Image bytes** with optimized headers:
```http
Content-Type: image/jpeg
Cache-Control: public, max-age=31536000, immutable
ETag: "path/to/image.jpg"
```

**Performance Features:**

- ✅ **In-Memory Index**: All image lookups happen in memory (no filesystem reads per request)
- ✅ **Single Request**: One API call = image bytes (no extra lookup needed)
- ✅ **Blazing Fast**: Sub-millisecond image resolution
- ✅ **1-Year Caching**: Optimal browser and CDN caching
- ✅ **Future-Proof**: Ready for S3/R2/CDN migration with zero frontend changes

**Usage with Next.js Image:**

```jsx
import Image from 'next/image';

// Movie poster - served directly as bytes
<Image 
  src="/api/images?type=movies&category=posters&tmdb_id=27205"
  alt="Inception poster"
  width={300}
  height={450}
  priority
/>

// Thumbnail - ultra-fast loading
<Image 
  src="/api/images?category=posters&tmdb_id=27205"
  alt="Inception thumbnail"
  width={150}
  height={225}
  quality={85}
/>

// Season poster
<Image 
  src="/api/images?type=shows&category=posters&tmdb_id=1399&season=1"
  alt="Game of Thrones Season 1"
  width={300} 
  height={450}
  quality={90}
/>
```

#### `POST /api/images/reload-cache`

Reload the in-memory image index without restarting the server.

**Usage:**

```bash
curl -X POST /api/images/reload-cache
```

**Response:**

```json
{
  "success": true,
  "message": "Image index reloaded successfully",
  "stats": {
    "moviePosters": 150,
    "movieBackdrops": 75,
    "showPosters": 89,
    "showBackdrops": 45,
    "seasonPosters": 12,
    "thumbnailPosters": 200,
    "thumbnailBackdrops": 100
  }
}
```


### �🔍 Search & Utilities

#### `GET /api/trakt/search`

Search across your personal data.

**Query Parameters:**

- `q` (required): Search query
- `type` (optional): `movies`, `shows`, or `all` (default: `all`)

**Examples:**

- `/api/trakt/search?q=inception` - Search for "inception" in all content
- `/api/trakt/search?q=breaking&type=shows` - Search for "breaking" in shows only

**Response:**

```json
{
  "query": "inception",
  "type": "all",
  "results": {
    "movies": [
      {
        "movie": {
          "title": "Inception",
          "year": 2010,
          "ids": { ... }
        },
        "source": "watched",
        "plays": 2,
        "last_watched_at": "2025-07-18T08:30:00.000Z"
      }
    ],
    "shows": []
  }
}
```

````

## Error Responses

All endpoints return errors in this format:

**404 Not Found:**
```json
{
  "error": "Data not found"
}
````

**400 Bad Request:**

```json
{
  "error": "Invalid parameter"
}
```

**500 Internal Server Error:**

```json
{
  "error": "Internal server error"
}
```

## Data Refresh

The API uses in-memory caching for performance. To refresh data after GitHub Actions updates the JSON files:

```bash
curl -X POST /api/trakt
```

## Notes

- All timestamps are in ISO 8601 format
- Data is automatically fetched and updated daily via GitHub Actions
- The API serves data from local JSON files, so it's fast and doesn't hit external APIs
- Images are served directly through the optimized `/api/images` endpoint with in-memory caching
