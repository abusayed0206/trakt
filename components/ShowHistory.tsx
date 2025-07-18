'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaImdb, FaTv } from 'react-icons/fa';
import { SiTrakt, SiThemoviedatabase } from 'react-icons/si';
import { HistoryItem } from '@/lib/types/api';
import { fetchShowHistory } from '@/lib/services/api';
import { getShowSeasonPosterUrl, getTraktUrl, getImdbUrl, getTmdbUrl, formatRelativeTime } from '@/lib/utils/media';
import OptimizedImage from '@/components/OptimizedImage';

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
        <div className="flex items-center gap-3 mb-6">
          <FaTv className="text-purple-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Recently Watched Episodes</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[2/3] rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <FaTv className="text-purple-500 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Recently Watched Episodes</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {history.map((item) => (
          <div key={item.id} className="group">
            <div className="relative overflow-hidden rounded-lg mb-3 aspect-[2/3] bg-gray-100">
              <OptimizedImage
                src={getShowSeasonPosterUrl(item.show!.ids.tmdb, item.episode!.season)}
                alt={`${item.show!.title} Season ${item.episode!.season}`}
                
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              
              {/* Overlay with external links */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-end p-3">
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full justify-center">
                  <Link
                    href={getTraktUrl(item.show!.ids.trakt, 'show')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                    title="View on Trakt"
                  >
                    <SiTrakt className="w-4 h-4" />
                  </Link>
                  <Link
                    href={getImdbUrl(item.show!.ids.imdb)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
                    title="View on IMDB"
                  >
                    <FaImdb className="w-4 h-4" />
                  </Link>
                  <Link
                    href={getTmdbUrl(item.show!.ids.tmdb, 'tv')}
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
                {item.show!.title}
              </h3>
              <p className="text-gray-600 text-xs mb-1">
                S{item.episode!.season}E{item.episode!.number}: {item.episode!.title}
              </p>
              <p className="text-gray-500 text-xs mb-1">{item.show!.year}</p>
              <p className="text-gray-400 text-xs">
                {formatRelativeTime(item.watched_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
