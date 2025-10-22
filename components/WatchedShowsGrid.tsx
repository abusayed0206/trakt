'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTv } from 'react-icons/fa';
import { WatchedShow } from '@/lib/types';
import { fetchWatchedShows } from '@/lib/services/api';
import { getTraktUrl, getImdbUrl, getTmdbUrl, formatRelativeTime } from '@/lib/utils/media';
import { Icons } from '@/lib/utils/icons';
import LazyImage from './LazyImage';

export default function WatchedShowsGrid() {
  const [watchedShows, setWatchedShows] = useState<WatchedShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);

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
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaTv className="text-gray-800 text-xl" />
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

  const displayedShows = watchedShows.slice(0, displayCount);

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-6">
        <FaTv className="text-gray-800 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Watched Shows</h2>
        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {watchedShows.length} shows
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedShows.map((item) => {
          const totalEpisodes = item.seasons.reduce((acc, season) => acc + season.episodes.length, 0);
          
          return (
            <div key={item.show.ids.trakt} className="group">
              <Link href={`/tv/${item.show.ids.tmdb}`}>
                <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100 cursor-pointer">
                  <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded z-10 flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    {totalEpisodes}
                  </div>
                  <LazyImage
                    tmdbId={item.show.ids.tmdb.toString()}
                    type="shows"
                    category="posters"
                    alt={item.show.title}
                    className="w-full h-full"
                  />
                </div>
              </Link>
              
              {/* External links below poster */}
              <div className="flex gap-4 mb-2 justify-center">
                <Link
                  href={getTraktUrl(item.show.ids.trakt, 'show')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg"
                  title="View on Trakt"
                >
                  <Icons.Trakt className="w-6 h-6" />
                </Link>
                <Link
                  href={getImdbUrl(item.show.ids.imdb)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg"
                  title="View on IMDB"
                >
                  <Icons.Imdb className="w-6 h-6" />
                </Link>
                <Link
                  href={getTmdbUrl(item.show.ids.tmdb, 'tv')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg"
                  title="View on TMDB"
                >
                  <Icons.Tmdb className="w-6 h-6" />
                </Link>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-1 line-clamp-2">
                  {item.show.title} ({item.show.year})
                </h3>
                <p className="text-gray-500 text-xs mb-1">
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
      
      {/* Load More and Collapse Buttons */}
      <div className="flex justify-center items-center gap-4 mt-8">
        {watchedShows.length > displayCount && (
          <button
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            Load More ({watchedShows.length - displayCount} remaining)
          </button>
        )}
        
        {/* Collapse Button - Show when more than 10 items are displayed */}
        {displayCount > 10 && (
          <button
            onClick={() => setDisplayCount(prev => prev - 10)}
            className="bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}
