# API Documentation

This document describes the REST API endpoints available in the Trakt Watch Dashboard. The API provides access to your personal Trakt data and optimized image serving capabilities.

## 🌐 Base URLs

- **Trakt Data API**: `/api/trakt`
- **Image API**: `/api/images`

## 🔐 Authentication

All endpoints serve pre-processed personal data and do not require authentication. The data is synchronized daily from Trakt.tv using your configured API credentials.

---

## 📊 Trakt Data API

### Core Endpoints

#### `GET /api/trakt`

Get the main data structure overview and metadata.

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "index.json",
    "count": 1
  },
  "data": {
    "last_updated": "2025-07-19T09:00:13.040949+00:00",
    "data_type": "personal_user_data",
    "username": "your_username",
    "authentication": "api_key_only",
    "data_structure": {
      "user": {
        "profile": "Basic user profile information",
        "stats": "Comprehensive viewing statistics",
        "history": {
          "movies": "Recent movie viewing history",
          "shows": "Recent TV show viewing history"
        },
        "watchlist": {
          "movies": "Movie watchlist",
          "all": "Complete watchlist"
        },
        "watched": {
          "movies": "All watched movies",
          "shows": "All watched TV shows"
        },
        "lists": "Custom user lists",
        "comments": "User comments and reviews"
      }
    }
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

---

### � Currently Watching

#### `GET /api/watching`

Get real-time scrobble data showing what the user is currently watching, with enhanced metadata from TMDB.

**Features:**
- Real-time scrobble detection from Trakt API
- TMDB backdrop images in multiple resolutions
- Progress calculation and time remaining
- Works for both movies and TV episodes

**Response when watching:**

```json
{
  "isWatching": true,
  "content": {
    "type": "episode",
    "title": "House of Cards",
    "subtitle": "S3E10 - Chapter 36", 
    "year": 2013,
    "progress": {
      "started_at": "2025-07-19T13:00:12.000Z",
      "expires_at": "2025-07-19T13:57:12.000Z",
      "percentage": 45
    },
    "images": {
      "backdrop": "https://image.tmdb.org/t/p/w1280/backdrop1.jpg",
      "backdrop_medium": "https://image.tmdb.org/t/p/w1280/backdrop2.jpg", 
      "backdrop_small": "https://image.tmdb.org/t/p/w1280/backdrop3.jpg"
    },
    "ids": {
      "trakt": 1416,
      "tmdb": 1425,
      "imdb": "tt1856010"
    }
  }
}
```

**Response when not watching:**

```json
{
  "isWatching": false
}
```

**Notes:**
- Requires `TRAKT_API_KEY` and `TMDB_API_KEY` environment variables
- Progress percentage is calculated based on start/end times
- Images are sourced from TMDB's highest quality backdrops
- Works with both movies (`type: "movie"`) and episodes (`type: "episode"`)

---

### �👤 User Profile & Statistics

#### `GET /api/trakt/user/profile`

Get user profile information including bio, location, and social links.

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/profile/basic.json"
  },
  "data": {
    "username": "your_username",
    "private": false,
    "name": "Your Name",
    "bio": "Your bio",
    "location": "Your Location",
    "website": "https://your-website.com",
    "joined_at": "2020-01-01T00:00:00.000Z",
    "avatar": {
      "full": "https://avatar-url.jpg"
    },
    "cover": {
      "full": "https://cover-url.jpg"
    }
  }
}
```

#### `GET /api/trakt/user/stats`

Get comprehensive viewing statistics including totals and time spent.

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/stats/overview.json"
  },
  "data": {
    "movies": {
      "plays": 1234,
      "watched": 987,
      "minutes": 123456,
      "collected": 456,
      "ratings": 789,
      "comments": 12
    },
    "shows": {
      "watched": 234,
      "collected": 123,
      "ratings": 345,
      "comments": 5
    },
    "seasons": {
      "watched": 456,
      "collected": 234,
      "ratings": 123,
      "comments": 2
    },
    "episodes": {
      "plays": 5678,
      "watched": 4567,
      "minutes": 234567,
      "collected": 1234,
      "ratings": 2345,
      "comments": 34
    }
  }
}
```

---

### 📈 History & Activity

#### `GET /api/trakt/user/history`

Get recent viewing history with optional filtering.

**Query Parameters:**

- `type` (optional): `movies` or `shows` - Filter by content type

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/history/movies.json",
    "count": 50
  },
  "data": [
    {
      "id": 12345,
      "watched_at": "2025-07-19T08:30:00.000Z",
      "action": "watch",
      "type": "movie",
      "movie": {
        "title": "Movie Title",
        "year": 2023,
        "ids": {
          "trakt": 12345,
          "slug": "movie-title-2023",
          "imdb": "tt1234567",
          "tmdb": 98765
        }
      }
    }
  ]
}
```

---

### 📚 Watchlist & Collections

#### `GET /api/trakt/user/watchlist`

Get user's watchlist with priority rankings.

**Query Parameters:**

- `type` (optional): `movies` or `all` - Filter by content type

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/watchlist/movies.json",
    "count": 125
  },
  "data": [
    {
      "rank": 1,
      "id": 12345,
      "listed_at": "2025-07-19T08:30:00.000Z",
      "type": "movie",
      "notes": "Must watch this weekend",
      "movie": {
        "title": "Movie Title",
        "year": 2023,
        "ids": {
          "trakt": 12345,
          "slug": "movie-title-2023",
          "imdb": "tt1234567",
          "tmdb": 98765
        }
      }
    }
  ]
}
```

#### `GET /api/trakt/user/watched`

Get all watched content with play counts and timestamps.

**Query Parameters:**

- `type` (optional): `movies` or `shows` - Filter by content type

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/watched/movies.json",
    "count": 987
  },
  "data": [
    {
      "plays": 2,
      "last_watched_at": "2025-07-19T08:30:00.000Z",
      "last_updated_at": "2025-07-19T08:30:00.000Z",
      "movie": {
        "title": "Movie Title",
        "year": 2023,
        "ids": {
          "trakt": 12345,
          "slug": "movie-title-2023",
          "imdb": "tt1234567",
          "tmdb": 98765
        }
      }
    }
  ]
}
```

---

### 📝 Lists & Comments

#### `GET /api/trakt/user/lists`

Get all user-created lists with metadata.

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/lists/user_lists.json",
    "count": 5
  },
  "data": [
    {
      "name": "Best Movies 2023",
      "description": "My favorite movies from 2023",
      "privacy": "public",
      "type": "personal",
      "display_numbers": true,
      "allow_comments": true,
      "sort_by": "rank",
      "sort_how": "asc",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2025-07-19T08:30:00.000Z",
      "item_count": 25,
      "comment_count": 3,
      "like_count": 15,
      "ids": {
        "trakt": 12345,
        "slug": "best-movies-2023"
      }
    }
  ]
}
```

#### `GET /api/trakt/user/lists/[id]`

Get items in a specific list.

**Path Parameters:**

- `id`: List slug or Trakt ID

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/lists/best-movies-2023_items.json",
    "count": 25
  },
  "data": [
    {
      "rank": 1,
      "id": 12345,
      "listed_at": "2023-06-15T10:30:00.000Z",
      "type": "movie",
      "notes": "Absolutely brilliant cinematography",
      "movie": {
        "title": "Movie Title",
        "year": 2023,
        "ids": {
          "trakt": 12345,
          "slug": "movie-title-2023",
          "imdb": "tt1234567",
          "tmdb": 98765
        }
      }
    }
  ]
}
```

#### `GET /api/trakt/user/comments`

Get all user comments and reviews.

**Response:**

```json
{
  "metadata": {
    "last_updated": "2025-07-19T09:00:13.041000+00:00",
    "source": "trakt_api_user_data",
    "username": "your_username",
    "endpoint": "user/comments/all.json",
    "count": 45
  },
  "data": [
    {
      "id": 12345,
      "parent_id": 0,
      "created_at": "2025-07-19T08:30:00.000Z",
      "updated_at": "2025-07-19T08:30:00.000Z",
      "comment": "This movie was absolutely fantastic! The cinematography was breathtaking.",
      "spoiler": false,
      "review": true,
      "replies": 2,
      "likes": 15,
      "user_rating": 9,
      "movie": {
        "title": "Movie Title",
        "year": 2023,
        "ids": {
          "trakt": 12345,
          "slug": "movie-title-2023",
          "imdb": "tt1234567",
          "tmdb": 98765
        }
      }
    }
  ]
}
```

---

### 🔍 Search

#### `GET /api/trakt/search`

Search through your watched content, watchlist, and custom lists.

**Query Parameters:**

- `q` (required): Search query string
- `type` (optional): `movies`, `shows`, or `all` (default: `all`)

**Response:**

```json
{
  "query": "inception",
  "type": "all",
  "results": {
    "movies": [
      {
        "type": "movie",
        "source": "watched",
        "movie": {
          "title": "Inception",
          "year": 2010,
          "ids": {
            "trakt": 1234,
            "slug": "inception-2010",
            "imdb": "tt1375666",
            "tmdb": 27205
          }
        },
        "plays": 3,
        "last_watched_at": "2024-12-15T20:30:00.000Z"
      }
    ],
    "shows": [
      {
        "type": "show",
        "source": "watchlist",
        "show": {
          "title": "Inception: The Series",
          "year": 2023,
          "ids": {
            "trakt": 5678,
            "slug": "inception-series-2023",
            "imdb": "tt9876543",
            "tmdb": 54321
          }
        },
        "listed_at": "2024-01-15T10:00:00.000Z"
      }
    ]
  },
  "total_results": 2
}
```

---

## 🖼️ Image API

The Image API provides optimized image serving with lazy loading and CDN integration through wsrv.nl.

### Endpoints

#### `GET /api/images`

Get optimized images with automatic WebP conversion and quality optimization.

**Query Parameters:**

- `type` (conditional): `movies` or `shows` - Required for full images
- `category` (required): `posters` or `backdrops`
- `tmdb_id` (required): TMDB ID of the content
- `season` (optional): Season number for show season posters

**Examples:**

**Full Movie Poster:**

```
GET /api/images?type=movies&category=posters&tmdb_id=27205
```

**TV Show Season Poster:**

```
GET /api/images?type=shows&category=posters&tmdb_id=1399&season=1
```

**Response:**

- **Success**: `302 Found` redirect to optimized wsrv.nl URL
- **Not Found**: `404` with error message
- **Invalid Parameters**: `400` with validation error

**Redirect URLs:**

**Full Images:**

```
https://wsrv.nl/?url=https%3A%2F%2Fcfcdn.sayed.app%2Fwatch%2Fmovies%2Fposters%2F27205_poster.jpg&w=400&output=webp&q=85&maxage=7d
```

#### `POST /api/images/reload-cache`

Reload the image index cache to pick up new images.

**Response:**

```json
{
  "message": "Image cache reloaded successfully",
  "stats": {
    "movie_posters": 821,
    "show_posters": 176
  }
}
```

---

## 🎛️ Image Optimization Features

### Full Image Strategy

- **Lazy Loading**: Full images (400px width) load when entering viewport
- **Quality**: 85% quality for optimal balance
- **Caching**: 7-day browser cache with CDN optimization

### URL Parameters

- `w`: Width in pixels
- `output`: Format (webp, jpg, png)
- `q`: Quality (1-100)
- `maxage`: Cache duration (e.g., 7d, 24h)

---

## 📊 Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "metadata": {
    "last_updated": "ISO 8601 timestamp",
    "source": "data source identifier",
    "username": "trakt username",
    "endpoint": "source file path",
    "count": "number of items (if applicable)"
  },
  "data": "actual response data"
}
```

### Error Response

```json
{
  "error": "Human-readable error message"
}
```

---

## 🚀 Performance Features

### Caching Strategy

- **Image Index**: Pre-loaded at server startup with 24-hour auto-refresh
- **JSON Data**: In-memory caching with manual cache clearing capability
- **CDN**: 7-day browser cache for optimized images

### Optimization

- **Smart Loading**: Full images on viewport entry
- **WebP Conversion**: Automatic format optimization
- **Quality Tuning**: Balanced quality vs. file size
- **Lazy Loading**: Reduces initial page load time

### Rate Limiting

- No rate limiting on API endpoints (serving pre-processed data)
- Image CDN handles rate limiting and optimization

---

## 🔧 Integration Examples

### Using the Image API in Components

```typescript
// Full image URL
const fullImageUrl = `/api/images?type=movies&category=posters&tmdb_id=${tmdbId}`;

// Season poster URL
const seasonUrl = `/api/images?type=shows&category=posters&tmdb_id=${tmdbId}&season=1`;
```

### Search Integration

```typescript
const searchResults = await fetch(`/api/trakt/search?q=${query}&type=movies`);
const data = await searchResults.json();
```

### Data Fetching

```typescript
const profile = await fetch("/api/trakt/user/profile");
const watchlist = await fetch("/api/trakt/user/watchlist?type=movies");
const history = await fetch("/api/trakt/user/history");
```

---

## 📈 Data Freshness

- **Update Frequency**: Data is synchronized daily from Trakt.tv
- **Cache Duration**: Image index auto-refreshes every 24 hours
- **Manual Refresh**: Use `POST /api/trakt` to clear cache manually
- **Image Updates**: New images detected automatically on next cache refresh

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

**🚀 NEW: CDN-Powered Image Serving with In-Memory Caching**

This endpoint now serves images directly from Cloudflare CDN with blazing fast performance using in-memory indexing for instant lookups.

**Required Query Parameters:**

- `type`: `movies` or `shows`
- `category`: `posters` or `backdrops`
- `tmdb_id`: TMDB ID of the movie/show

**Optional Query Parameters:**

- `season`: Season number (only for show posters)

**Supported Endpoints:**

**Movie & Show Images (redirects to CDN):**

- `/api/images?type=movies&category=posters&tmdb_id=XXX` - Movie poster from CDN
- `/api/images?type=movies&category=backdrops&tmdb_id=XXX` - Movie backdrop from CDN
- `/api/images?type=shows&category=posters&tmdb_id=XXX` - Show poster from CDN
- `/api/images?type=shows&category=backdrops&tmdb_id=XXX` - Show backdrop from CDN
- `/api/images?type=shows&category=posters&tmdb_id=XXX&season=X` - Season X poster from CDN

**Response:**

✅ **HTTP 302 Redirect** to CDN URL:

```
Location: https://cfcdn.sayed.app/watch/movies/posters/27205_poster.jpg
```

**CDN URLs:** All images are served from `https://cfcdn.sayed.app/watch/` with the same folder structure:

- `https://cfcdn.sayed.app/watch/movies/posters/27205_poster.jpg`
- `https://cfcdn.sayed.app/watch/shows/backdrops/1399_backdrop.jpg`
- `https://cfcdn.sayed.app/watch/shows/posters/1399/1/season_1_poster.jpg`

**Performance Features:**

- ✅ **In-Memory Index**: All image lookups happen in memory (no filesystem reads per request)
- ✅ **CDN-Powered**: Images served from Cloudflare CDN for global performance
- ✅ **HTTP Redirects**: Browser/client automatically follows to CDN URL
- ✅ **Blazing Fast**: Sub-millisecond image resolution + CDN edge caching
- ✅ **Global Distribution**: Images served from nearest edge location
- ✅ **Future-Proof**: Scalable CDN architecture with automatic caching

**Usage with Next.js Image:**

```jsx
import Image from 'next/image';

// Movie poster - redirects to CDN
<Image
  src="/api/images?type=movies&category=posters&tmdb_id=27205"
  alt="Inception poster"
  width={300}
  height={450}
  priority
/>


// Season poster
<Image
  src="/api/images?type=shows&category=posters&tmdb_id=1399&season=1"
  alt="Game of Thrones Season 1"
  width={300}
  height={450}
  quality={90}
/>

// Direct CDN URLs (for advanced use cases)
<Image
  src="https://cfcdn.sayed.app/watch/movies/posters/27205_poster.jpg"
  alt="Direct CDN access"
  width={300}
  height={450}
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
    "seasonPosters": 12
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
