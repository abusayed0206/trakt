# 📺 Watching API Feature

This document describes the new real-time "Now Watching" feature that integrates Trakt scrobble data with TMDB images.

## 🎯 Overview

The `/api/watching` endpoint provides real-time information about what you're currently watching, complete with high-quality backdrop images from TMDB and progress tracking.

## 🚀 Features

- **Real-time scrobble detection** from Trakt API
- **High-quality backdrop images** from TMDB (multiple resolutions)
- **Progress calculation** with time remaining
- **Works for both movies and TV episodes**
- **Beautiful UI banner** that appears when watching content
- **Responsive design** with gradient overlays for text readability

## 📋 Requirements

### Environment Variables

Add these to your `.env.local` file:

```env
TRAKT_API_KEY=your_trakt_client_id
TRAKT_USERNAME=your_trakt_username
TMDB_API_KEY=your_tmdb_api_key
```

### API Keys Setup

1. **Trakt API Key**:
   - Go to https://trakt.tv/oauth/applications
   - Create a new application
   - Use the Client ID as your `TRAKT_API_KEY`

2. **TMDB API Key**:
   - Go to https://www.themoviedb.org/settings/api
   - Request an API key
   - Use the API Key (v3 auth) as your `TMDB_API_KEY`

## 🔧 API Endpoint

### `GET /api/watching`

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

## 🎨 UI Integration

The watching data is automatically integrated into the `UserProfileStats` component:

- **Dynamic banner** appears when content is being watched
- **Background image** uses TMDB backdrop with gradient overlay
- **Progress bar** shows current viewing progress
- **Time indicators** show start time and estimated end time
- **External links** to Trakt, IMDb, and TMDB

## 📱 Component Features

### NowWatchingBanner Component

- **Responsive design** that works on all screen sizes
- **Gradient overlays** for optimal text readability
- **Progress visualization** with animated progress bar
- **External links** with proper icons
- **Fallback background** when no backdrop image is available

### Loading States

- **Skeleton loading** for the watching banner
- **Graceful fallbacks** when APIs are unavailable
- **Error handling** with console logging

## 🔄 How It Works

1. **Frontend requests** watching data from `/api/watching`
2. **API fetches** current scrobble from Trakt API
3. **If watching**, API fetches backdrop images from TMDB
4. **Progress calculation** based on start/end times
5. **Response** includes all data needed for UI display
6. **Component renders** beautiful banner with all information

## 🛠️ Technical Implementation

### Files Created/Modified

- **`/app/api/watching/route.ts`** - New API endpoint
- **`/components/UserProfileStats.tsx`** - Updated with watching banner
- **`/lib/types/index.ts`** - Added watching-related types
- **`/lib/services/api.ts`** - Added fetchWatchingData function
- **`/app/api-test/page.tsx`** - Added watching endpoint to test interface
- **`/API_DOCUMENTATION.md`** - Added documentation

### Type Definitions

```typescript
interface WatchingData {
  isWatching: boolean;
  content?: {
    type: 'movie' | 'episode';
    title: string;
    subtitle?: string;
    year: number;
    progress?: {
      started_at: string;
      expires_at: string;
      percentage?: number;
    };
    images: {
      backdrop?: string;
      backdrop_medium?: string;
      backdrop_small?: string;
    };
    ids: {
      trakt: number;
      tmdb: number;
      imdb: string;
    };
  };
}
```

## 🧪 Testing

### Test the API directly:
```bash
curl http://localhost:3000/api/watching
```

### Test in the UI:
1. Start watching something on a device with Trakt scrobbling enabled
2. Visit your application homepage
3. The watching banner should appear automatically

### Use the API test interface:
1. Go to `/api-test`
2. Select "Now Watching" from the endpoint list
3. Click "Test Endpoint" to see current status

## 🎯 Future Enhancements

- **Auto-refresh** watching status every minute
- **Episode thumbnails** for TV shows
- **Playlist support** for continuous watching
- **Watch party integration** for shared viewing
- **Notification system** for friends' watching activity

## 📊 Performance Notes

- **Caching**: Watching data is not cached due to real-time nature
- **API calls**: Makes 1 Trakt API call + 1 TMDB API call per request
- **Rate limiting**: Respects both Trakt and TMDB rate limits
- **Fallbacks**: Gracefully handles API failures

## 🔧 Troubleshooting

### Common Issues

1. **"Not watching" always returned**:
   - Check if Trakt scrobbling is enabled on your media player
   - Verify TRAKT_API_KEY and TRAKT_USERNAME are correct

2. **No backdrop images**:
   - Verify TMDB_API_KEY is valid
   - Check if the content has images on TMDB

3. **Incorrect progress calculation**:
   - This depends on accurate scrobble timing from your media player
   - Some players may report inaccurate start/end times

### Debug Mode

Check browser console and Next.js terminal for error messages:
- Trakt API errors
- TMDB API errors  
- Network issues
- Environment variable problems

---

**Created**: July 19, 2025  
**Version**: 1.0  
**Status**: ✅ Ready for use
