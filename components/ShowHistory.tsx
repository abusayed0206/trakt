'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTv } from 'react-icons/fa';
import { HistoryItem } from '@/lib/types';
import { fetchShowHistory } from '@/lib/services/api';
import { getTraktUrl, getImdbUrl, getTmdbUrl, formatRelativeTime } from '@/lib/utils/media';
import { Icons } from '@/lib/utils/icons';
import LazyImage from './LazyImage';

export default function ShowHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchShowHistory();
        setHistory(data.slice(0, 10)); // Show only last 10
      } catch (error) {
        console.error('Error fetching show history:', error);
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
          <h2 className="text-2xl font-bold text-gray-800">Recently Watched Episodes</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-6">
        <FaTv className="text-gray-800 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Recently Watched Episodes</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {history.map((item) => (
          <div key={item.id} className="group">
            <Link href={`/tv/${item.show!.ids.tmdb}`}>
              <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100 cursor-pointer">
                <LazyImage
                  tmdbId={item.show!.ids.tmdb.toString()}
                  type="shows"
                  category="posters"
                  season={item.episode!.season.toString()}
                  alt={`${item.show!.title} Season ${item.episode!.season}`}
                  className="w-full h-full"
                />
              </div>
            </Link>
            
            {/* External links below poster */}
            <div className="flex gap-4 mb-2 justify-center">
              <Link
                href={getTraktUrl(item.show!.ids.trakt, 'show')}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg"
                title="View on Trakt"
              >
                <Icons.Trakt className="w-6 h-6" />
              </Link>
              <Link
                href={getImdbUrl(item.show!.ids.imdb)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg"
                title="View on IMDB"
              >
                <Icons.Imdb className="w-6 h-6" />
              </Link>
              <Link
                href={getTmdbUrl(item.show!.ids.tmdb, 'tv')}
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
                {item.show!.title} ({item.show!.year})
              </h3>
              <p className="text-gray-600 text-xs mb-1">
                S{item.episode!.season}E{item.episode!.number}: {item.episode!.title}
              </p>
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
