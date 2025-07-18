# Configuration file for Trakt data fetching and media downloading

# API Configuration
TRAKT_API_VERSION = "2"
TMDB_API_VERSION = "3"

# Rate Limiting (requests per second)
TRAKT_RATE_LIMIT = 1000  # requests per hour
TMDB_RATE_LIMIT = 40     # requests per 10 seconds

# Image Configuration
IMAGE_SIZES = {
    "poster_sizes": ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
    "backdrop_sizes": ["w300", "w780", "w1280", "original"],
    "still_sizes": ["w92", "w185", "w300", "original"],
    "profile_sizes": ["w45", "w185", "h632", "original"]
}

DEFAULT_IMAGE_SIZES = {
    "poster": "w500",
    "backdrop": "w1280", 
    "still": "w300",
    "profile": "w185"
}

# Download Limits (to avoid excessive API usage)
MAX_IMAGES_PER_ITEM = {
    "posters": 3,
    "backdrops": 2,
    "stills": 1
}

# Thumbnail Configuration
THUMBNAIL_SIZE = (150, 225)
THUMBNAIL_QUALITY = 85

# Directory Structure
DATA_STRUCTURE = {
    "json": {
        "user": ["profile.json", "settings.json", "stats.json"],
        "history": ["recent.json", "movies.json", "shows.json", "episodes.json"],
        "collection": ["movies.json", "shows.json"],
        "watchlist": ["all.json", "movies.json", "shows.json"],
        "ratings": ["all.json", "movies.json", "shows.json", "episodes.json"],
        "lists": ["user_lists.json"],
        "recommendations": ["movies.json", "shows.json"],
        "calendar": ["my_shows.json", "my_movies.json"],
        "stats": ["overview.json"],
        "comments": ["all.json"]
    },
    "images": {
        "movies": ["posters", "backdrops"],
        "shows": ["posters", "backdrops"],
        "episodes": ["stills"],
        "people": ["profiles"],
        "thumbnails": []
    }
}

# Trakt API Endpoints
TRAKT_ENDPOINTS = {
    "user_profile": "/users/{username}",
    "user_settings": "/users/settings",
    "user_stats": "/users/{username}/stats",
    "history": "/users/{username}/history",
    "history_movies": "/users/{username}/history/movies",
    "history_shows": "/users/{username}/history/shows",
    "history_episodes": "/users/{username}/history/episodes",
    "collection_movies": "/users/{username}/collection/movies",
    "collection_shows": "/users/{username}/collection/shows",
    "watchlist": "/users/{username}/watchlist",
    "watchlist_movies": "/users/{username}/watchlist/movies",
    "watchlist_shows": "/users/{username}/watchlist/shows",
    "ratings": "/users/{username}/ratings",
    "ratings_movies": "/users/{username}/ratings/movies",
    "ratings_shows": "/users/{username}/ratings/shows",
    "ratings_episodes": "/users/{username}/ratings/episodes",
    "lists": "/users/{username}/lists",
    "list_items": "/users/{username}/lists/{slug}/items",
    "recommendations_movies": "/recommendations/movies",
    "recommendations_shows": "/recommendations/shows",
    "calendar_shows": "/calendars/my/shows",
    "calendar_movies": "/calendars/my/movies",
    "comments": "/users/{username}/comments"
}

# TMDB API Endpoints
TMDB_ENDPOINTS = {
    "movie_details": "/movie/{id}",
    "movie_images": "/movie/{id}/images",
    "tv_details": "/tv/{id}",
    "tv_images": "/tv/{id}/images",
    "episode_images": "/tv/{id}/season/{season}/episode/{episode}/images",
    "person_details": "/person/{id}",
    "person_images": "/person/{id}/images"
}
