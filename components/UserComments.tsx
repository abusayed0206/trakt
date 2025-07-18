'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaComment, FaHeart, FaReply, FaFilm, FaTv } from 'react-icons/fa';
import { SiTrakt } from 'react-icons/si';
import { CommentItem } from '@/lib/types/api';
import { fetchUserComments } from '@/lib/services/api';
import { getTraktUrl, formatRelativeTime } from '@/lib/utils/media';

export default function UserComments() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUserComments();
        setComments(data);
      } catch (error) {
        console.error('Error fetching user comments:', error);
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
          <FaComment className="text-blue-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Recent Comments</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FaComment className="text-blue-500 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Recent Comments</h2>
        </div>
        <p className="text-gray-500 text-center py-8">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <FaComment className="text-blue-500 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Recent Comments</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {comments.length} comments
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comments.map((item) => (
          <div key={item.comment.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              {item.type === 'movie' ? (
                <FaFilm className="text-blue-500 flex-shrink-0" />
              ) : (
                <FaTv className="text-purple-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm truncate">
                  {item.type === 'movie' ? item.movie!.title : item.show!.title}
                </h3>
                {item.type === 'episode' && item.episode && (
                  <p className="text-gray-600 text-xs">
                    S{item.episode.season}E{item.episode.number}: {item.episode.title}
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  {item.type === 'movie' ? item.movie!.year : item.show!.year}
                </p>
              </div>
              <Link
                href={getTraktUrl(
                  item.type === 'movie' ? item.movie!.ids.trakt : item.show!.ids.trakt,
                  item.type === 'movie' ? 'movie' : 'show'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0"
                title="View on Trakt"
              >
                <SiTrakt className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                {item.comment.spoiler && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded mr-2">
                    SPOILER
                  </span>
                )}
                {item.comment.comment}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {item.comment.likes > 0 && (
                  <div className="flex items-center gap-1">
                    <FaHeart className="text-red-500" />
                    <span>{item.comment.likes}</span>
                  </div>
                )}
                {item.comment.replies > 0 && (
                  <div className="flex items-center gap-1">
                    <FaReply className="text-blue-500" />
                    <span>{item.comment.replies}</span>
                  </div>
                )}
                {item.comment.review && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Review
                  </span>
                )}
              </div>
              <span>{formatRelativeTime(item.comment.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
