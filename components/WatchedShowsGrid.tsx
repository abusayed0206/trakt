'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTv, FaImdb, FaEye, FaEyeSlash, FaPlay, FaClock } from 'react-icons/fa';
import { SiTrakt, SiThemoviedatabase } from 'react-icons/si';
import { WatchedShow } from '@/lib/types/api';
import { fetchWatchedShows } from '@/lib/services/api';
import { getShowPosterUrl, getTraktUrl, getImdbUrl, getTmdbUrl, formatRelativeTime } from '@/lib/utils/media';
import OptimizedImage from '@/components/OptimizedImage';

export default function WatchedShowsGrid() {
  const [watchedShows, setWatchedShows] = useState<WatchedShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchWatchedShows();
        setWatchedShows(data);
      } catch (error) {
        console.error('Error fetching watched shows:', error);
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
          <FaTv className="text-purple-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Watched Shows</h2>
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

  const displayedShows = showAll ? watchedShows : watchedShows.slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaTv className="text-purple-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Watched Shows</h2>
          <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {watchedShows.length} shows
          </span>
        </div>
        {watchedShows.length > 10 && (
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
        {displayedShows.map((item) => {
          const totalEpisodes = item.seasons.reduce((acc, season) => acc + season.episodes.length, 0);
          
          return (
            <div key={item.show.ids.trakt} className="group">
              <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100">
                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded z-10 flex items-center gap-1">
                  <FaPlay className="w-2 h-2" />
                  {totalEpisodes}
                </div>
                <OptimizedImage
                  src={getShowPosterUrl(item.show.ids.tmdb)}
                  alt={item.show.title}
                  
                  className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                
                {/* Overlay with external links */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end p-3">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full justify-center">
                    <Link
                      href={getTraktUrl(item.show.ids.trakt, 'show')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                      title="View on Trakt"
                    >
                      <SiTrakt className="w-4 h-4" />
                    </Link>
                    <Link
                      href={getImdbUrl(item.show.ids.imdb)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                      title="View on IMDB"
                    >
                      <FaImdb className="w-4 h-4" />
                    </Link>
                    <Link
                      href={getTmdbUrl(item.show.ids.tmdb, 'tv')}
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
                  {item.show.title}
                </h3>
                <p className="text-gray-500 text-xs mb-1">{item.show.year}</p>
                <p className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                  <FaClock className="w-3 h-3" />
                  Last watched {formatRelativeTime(item.last_watched_at)}
                </p>
                <p className="text-gray-600 text-xs mb-1">
                  {item.seasons.length} {item.seasons.length === 1 ? 'season' : 'seasons'}
                </p>
                <p className="text-gray-600 text-xs">
                  {totalEpisodes} {totalEpisodes === 1 ? 'episode' : 'episodes'} watched
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
