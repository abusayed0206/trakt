'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaFilm } from 'react-icons/fa';
import { HistoryItem } from '@/lib/types';
import { fetchMovieHistory } from '@/lib/services/api';
import { getTraktUrl, getImdbUrl, getTmdbUrl, formatRelativeTime, getLetterboxdUrl } from '@/lib/utils/media';
import { Icons } from '@/lib/utils/icons';
import LazyImage from './LazyImage';

export default function MovieHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchMovieHistory();
        setHistory(data.slice(0, 10)); // Show only last 10
      } catch (error) {
        console.error('Error fetching movie history:', error);
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
          <FaFilm className="text-gray-800 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Recently Watched Movies</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-6">
        <FaFilm className="text-gray-800 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Recently Watched Movies</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {history.map((item) => (
          <div key={item.id} className="group">
            <Link href={`/movie/${item.movie!.ids.tmdb}`}>
              <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100 cursor-pointer">
                <LazyImage
                  tmdbId={item.movie!.ids.tmdb.toString()}
                  type="movies"
                  category="posters"
                  alt={item.movie!.title}
                  className="w-full h-full"
                />
              </div>
            </Link>
            
            {/* External links below poster */}
            <div className="flex gap-4 mb-2 justify-center">
              <Link
                href={getLetterboxdUrl(item.movie!.ids.imdb)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg"
                title="View on Letterboxd"
              >
                <Icons.Letterboxd className="w-6 h-6" />
              </Link>
              <Link
                href={getTraktUrl(item.movie!.ids.trakt, 'movie')}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg"
                title="View on Trakt"
              >
                <Icons.Trakt className="w-6 h-6" />
              </Link>
              <Link
                href={getImdbUrl(item.movie!.ids.imdb)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg"
                title="View on IMDB"
              >
                <Icons.Imdb className="w-6 h-6" />
              </Link>
              <Link
                href={getTmdbUrl(item.movie!.ids.tmdb, 'movie')}
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
                {item.movie!.title} ({item.movie!.year})
              </h3>
              <p className="text-gray-500 text-xs">
                Last watched {formatRelativeTime(item.watched_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
