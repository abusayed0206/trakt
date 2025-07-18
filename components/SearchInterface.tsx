'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaSearch, FaChevronDown, FaImdb } from 'react-icons/fa';
import { SiTrakt, SiLetterboxd, SiThemoviedatabase } from 'react-icons/si';
import { SearchResult } from '@/lib/types/api';
import { searchContent } from '@/lib/services/api';
import { getMoviePosterUrl, getShowPosterUrl, getLetterboxdUrl, getTraktUrl, getImdbUrl, getTmdbUrl, formatRelativeTime } from '@/lib/utils/media';
import OptimizedImage from '@/components/OptimizedImage';

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'movies' | 'shows' | 'all'>('movies');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const data = await searchContent(query.trim(), searchType);
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const allResults = results ? [
    ...(results.results.movies || []).map(item => ({ ...item, type: 'movie' as const })),
    ...(results.results.shows || []).map(item => ({ ...item, type: 'show' as const }))
  ] : [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <FaSearch className="text-green-500 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Search Your Library</h2>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for movies or TV shows..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="relative">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as 'movies' | 'shows' | 'all')}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none min-w-[120px]"
            >
              <option value="movies">Movies</option>
              <option value="shows">TV Shows</option>
              <option value="all">All</option>
            </select>
            <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 min-w-[100px] justify-center"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaSearch className="w-4 h-4" />
                Search
              </>
            )}
          </button>
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
            <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {allResults.length} results
            </span>
          </div>

          {allResults.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No results found for &quot;{results.query}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allResults.map((item, index) => (
                <div key={`${item.type}-${index}`} className="group">
                  <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100">
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      {item.type === 'movie' ? 'Movie' : 'TV'}
                    </div>
                    {item.source === 'watched' && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        Watched
                      </div>
                    )}
                    <OptimizedImage
                      src={item.type === 'movie' 
                        ? getMoviePosterUrl(item.movie!.ids.tmdb) 
                        : getShowPosterUrl(item.show!.ids.tmdb)
                      }
                      alt={item.type === 'movie' ? item.movie!.title : item.show!.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    
                    {/* Overlay with external links */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end p-3">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full justify-center">
                        {item.type === 'movie' && (
                          <Link
                            href={getLetterboxdUrl(item.movie!.ids.imdb)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
                            title="View on Letterboxd"
                          >
                            <SiLetterboxd className="w-4 h-4" />
                          </Link>
                        )}
                        <Link
                          href={getTraktUrl(
                            item.type === 'movie' ? item.movie!.ids.trakt : item.show!.ids.trakt, 
                            item.type
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                          title="View on Trakt"
                        >
                          <SiTrakt className="w-4 h-4" />
                        </Link>
                        <Link
                          href={getImdbUrl(item.type === 'movie' ? item.movie!.ids.imdb : item.show!.ids.imdb)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                          title="View on IMDB"
                        >
                          <FaImdb className="w-4 h-4" />
                        </Link>
                        <Link
                          href={getTmdbUrl(
                            item.type === 'movie' ? item.movie!.ids.tmdb : item.show!.ids.tmdb, 
                            item.type === 'movie' ? 'movie' : 'tv'
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors"
                          title="View on TMDB"
                        >
                          <SiThemoviedatabase className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                      {item.type === 'movie' ? item.movie!.title : item.show!.title}
                    </h4>
                    <p className="text-gray-500 text-xs mb-1">
                      {item.type === 'movie' ? item.movie!.year : item.show!.year}
                    </p>
                    {item.plays && item.plays > 0 && (
                      <p className="text-gray-600 text-xs mb-1">
                        {item.plays} {item.plays === 1 ? 'play' : 'plays'}
                      </p>
                    )}
                    {item.last_watched_at && (
                      <p className="text-gray-400 text-xs">
                        Last watched {formatRelativeTime(item.last_watched_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
