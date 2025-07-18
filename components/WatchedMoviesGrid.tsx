'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaFilm, FaImdb, FaEye, FaEyeSlash, FaPlay, FaClock } from 'react-icons/fa';
import { SiTrakt, SiLetterboxd, SiThemoviedatabase } from 'react-icons/si';
import { WatchedMovie } from '@/lib/types/api';
import { fetchWatchedMovies } from '@/lib/services/api';
import { getMoviePosterUrl, getLetterboxdUrl, getTraktUrl, getImdbUrl, getTmdbUrl, formatDate, formatWatchTime, formatRelativeTime } from '@/lib/utils/media';
import OptimizedImage from '@/components/OptimizedImage';

export default function WatchedMoviesGrid() {
  const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchWatchedMovies();
        setWatchedMovies(data);
      } catch (error) {
        console.error('Error fetching watched movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FaFilm className="text-blue-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Watched Movies</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayedMovies = showAll ? watchedMovies : watchedMovies.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaFilm className="text-blue-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Watched Movies</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {watchedMovies.length} movies
          </span>
        </div>
        {watchedMovies.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            {showAll ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
            {showAll ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedMovies.map((item) => (
          <div key={item.movie.ids.trakt} className="group">
            <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100">
              {item.plays > 1 && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded z-10 flex items-center gap-1">
                  <FaPlay className="w-2 h-2" />
                  {item.plays}
                </div>
              )}
              <OptimizedImage
                src={getMoviePosterUrl(item.movie.ids.tmdb)}
                alt={item.movie.title}
                
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Overlay with external links */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end p-3">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full justify-center">
                  <Link
                    href={getLetterboxdUrl(item.movie.ids.imdb)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full transition-colors"
                    title="View on Letterboxd"
                  >
                    <SiLetterboxd className="w-4 h-4" />
                  </Link>
                  <Link
                    href={getTraktUrl(item.movie.ids.trakt, 'movie')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    title="View on Trakt"
                  >
                    <SiTrakt className="w-4 h-4" />
                  </Link>
                  <Link
                    href={getImdbUrl(item.movie.ids.imdb)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                    title="View on IMDB"
                  >
                    <FaImdb className="w-4 h-4" />
                  </Link>
                  <Link
                    href={getTmdbUrl(item.movie.ids.tmdb, 'movie')}
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
              <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                {item.movie.title}
              </h3>
              <p className="text-gray-500 text-xs mb-1">{item.movie.year}</p>
              <p className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                <FaClock className="w-3 h-3" />
                Last watched {formatRelativeTime(item.last_watched_at)}
              </p>
              {item.plays > 1 && (
                <p className="text-gray-600 text-xs">
                  Watched {item.plays} times
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
