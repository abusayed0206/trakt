"use client";

import { useState } from "react";
import Link from "next/link";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import { SearchResult } from "@/lib/types";
import { searchContent } from "@/lib/services/api";
import { Icons } from "@/lib/utils/icons";
import {
  getLetterboxdUrl,
  getTraktUrl,
  getImdbUrl,
  getTmdbUrl,
  formatRelativeTime,
} from "@/lib/utils/media";
import LazyImage from "./LazyImage";

export default function SearchInterface() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"movies" | "shows" | "all">(
    "all"
  );
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setDisplayCount(10); // Reset display count
    try {
      const data = await searchContent(query.trim(), searchType);
      setResults(data);
    } catch (error) {
      console.error("Error searching:", error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const allResults = results
    ? [
        ...(results.results.movies || []).map((item) => ({
          ...item,
          type: "movie" as const,
        })),
        ...(results.results.shows || []).map((item) => ({
          ...item,
          type: "show" as const,
        })),
      ]
    : [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-8">
        <FaSearch className="text-gray-800 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Search My Library</h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Search Input - Full width on all devices */}
          <div className="w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-center sm:text-left shadow-sm"
            />
          </div>

          {/* Controls Row - Dropdown and Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <div className="relative w-full sm:w-auto">
              <label htmlFor="search-type" className="sr-only">
                Search Type
              </label>
              <select
                id="search-type"
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "movies" | "shows" | "all")
                }
                className="w-full sm:w-auto bg-white border border-gray-300 rounded-lg px-6 py-3 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 appearance-none min-w-[160px] text-center sm:text-left shadow-sm"
              >
                <option value="movies">Movies</option>
                <option value="shows">TV Shows</option>
                <option value="all">All</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full sm:w-auto bg-gray-800 hover:bg-gray-900 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 min-w-[140px] justify-center shadow-sm hover:shadow-md disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaSearch className="w-4 h-4" />
                  Search
                </>
              )}
            </button>

            {/* Clear Button - Only show when there are search results */}
            {hasSearched && results && (
              <button
                type="button"
                onClick={() => {
                  setResults(null);
                  setHasSearched(false);
                  setQuery("");
                  setDisplayCount(10);
                }}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg transition-colors flex items-center gap-2 min-w-[140px] justify-center shadow-sm hover:shadow-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && hasSearched && results && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Search Results for &quot;{results.query}&quot;
            </h3>
            <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {allResults.length} results
            </span>
          </div>

          {allResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No results found for &quot;{results.query}&quot;
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allResults.slice(0, displayCount).map((item, index) => (
                  <div key={`${item.type}-${index}`} className="group">
                    <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100">
                      <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        {item.type === "movie" ? "Movie" : "TV"}
                      </div>
                      {item.source === "watched" && (
                        <div className="absolute top-2 right-2 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded z-10">
                          Watched
                        </div>
                      )}
                      <LazyImage
                        tmdbId={(item.type === "movie"
                          ? item.movie!.ids.tmdb
                          : item.show!.ids.tmdb
                        ).toString()}
                        type={item.type === "movie" ? "movies" : "shows"}
                        category="posters"
                        alt={
                          item.type === "movie"
                            ? item.movie!.title
                            : item.show!.title
                        }
                        className="w-full h-full"
                      />
                    </div>
                    {/* External links below poster */}
                    <div className="flex gap-4 mb-2 justify-center">
                      {item.type === "movie" && (
                        <Link
                          href={getLetterboxdUrl(item.movie!.ids.imdb)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg"
                          title="View on Letterboxd"
                        >
                          <Icons.Letterboxd className="w-6 h-6" />
                        </Link>
                      )}
                      <Link
                        href={getTraktUrl(
                          item.type === "movie"
                            ? item.movie!.ids.trakt
                            : item.show!.ids.trakt,
                          item.type
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg"
                        title="View on Trakt"
                      >
                        <Icons.Trakt className="w-6 h-6" />
                      </Link>

                      <Link
                        href={getImdbUrl(
                          item.type === "movie"
                            ? item.movie!.ids.imdb
                            : item.show!.ids.imdb
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg"
                        title="View on IMDB"
                      >
                        <Icons.Imdb className="w-6 h-6" />
                      </Link>
                      <Link
                        href={getTmdbUrl(
                          item.type === "movie"
                            ? item.movie!.ids.tmdb
                            : item.show!.ids.tmdb,
                          item.type === "movie" ? "movie" : "tv"
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg"
                        title="View on TMDB"
                      >
                        <Icons.Tmdb className="w-6 h-6" />
                      </Link>
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                        {item.type === "movie"
                          ? item.movie!.title
                          : item.show!.title}{" "}
                        ({item.type === "movie"
                          ? item.movie!.year
                          : item.show!.year})
                      </h4>
                      {(item.last_watched_at || (item.plays && item.plays > 0)) && (
                        <p className="text-gray-500 text-xs">
                          {item.last_watched_at && `Last watched ${formatRelativeTime(item.last_watched_at)}`}
                          {item.last_watched_at && item.plays && item.plays > 0 && " "}
                          {item.plays && item.plays > 0 && `(${item.plays} ${item.plays === 1 ? "Play" : "Plays"})`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              {allResults.length > displayCount && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 10)}
                    className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    Load More ({allResults.length - displayCount} remaining)
                  </button>
                  
                  {/* Collapse Button - Only show when more than 10 items are displayed */}
                  {displayCount > 10 && (
                    <button
                      onClick={() => setDisplayCount(10)}
                      className="bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      Collapse
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
