'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaComment, FaHeart, FaReply } from 'react-icons/fa';
import { CommentItem } from '@/lib/types';
import { fetchUserComments } from '@/lib/services/api';
import { getTraktUrl, formatRelativeTime } from '@/lib/utils/media';
import { Icons } from '@/lib/utils/icons';

export default function UserComments() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(10);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());

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
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaComment className="text-gray-800 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Recent Comments</h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse border border-gray-100">
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
        <div className="flex items-center justify-center gap-3 mb-6">
          <FaComment className="text-gray-800 text-xl" />
          <h2 className="text-2xl font-bold text-gray-800">Recent Comments</h2>
        </div>
        <p className="text-gray-500 text-center py-8">No comments yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-6">
        <FaComment className="text-gray-800 text-xl" />
        <h2 className="text-2xl font-bold text-gray-800">Recent Comments</h2>
        <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {comments.length} comments
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comments.slice(0, displayCount).map((item) => (
          <div key={item.comment.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors border border-gray-100 hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <Icons.Trakt className="text-gray-700 flex-shrink-0 w-5 h-5" />
              <div className="flex-1 min-w-0">
                <Link
                  href={getTraktUrl(
                    item.type === 'movie' ? item.movie!.ids.trakt : item.show!.ids.trakt,
                    item.type === 'movie' ? 'movie' : 'show'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-gray-600 transition-colors"
                  title="View on Trakt"
                >
                  <h3 className="font-semibold text-sm truncate hover:underline">
                    {item.type === 'movie' ? item.movie!.title : item.show!.title}
                  </h3>
                </Link>
                {item.type === 'episode' && item.episode && (
                  <p className="text-gray-600 text-xs">
                    S{item.episode.season}E{item.episode.number}: {item.episode.title}
                  </p>
                )}
                <p className="text-gray-500 text-xs">
                  {item.type === 'movie' ? item.movie!.year : item.show!.year}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                {item.comment.spoiler ? (
                  <span>
                    <span className="bg-gray-800 text-white px-2 py-1 rounded mr-2 text-xs font-medium">
                      SPOILER
                    </span>
                    <span 
                      className={`cursor-pointer select-none transition-all duration-200 ${
                        revealedSpoilers.has(item.comment.id) ? '' : 'blur-sm'
                      }`}
                      onClick={() => {
                        const newRevealed = new Set(revealedSpoilers);
                        if (newRevealed.has(item.comment.id)) {
                          newRevealed.delete(item.comment.id);
                        } else {
                          newRevealed.add(item.comment.id);
                        }
                        setRevealedSpoilers(newRevealed);
                      }}
                    >
                      {item.comment.comment}
                    </span>
                  </span>
                ) : (
                  item.comment.comment
                )}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                {item.comment.likes > 0 && (
                  <div className="flex items-center gap-1">
                    <FaHeart className="text-gray-600" />
                    <span>{item.comment.likes}</span>
                  </div>
                )}
                {item.comment.replies > 0 && (
                  <div className="flex items-center gap-1">
                    <FaReply className="text-gray-600" />
                    <span>{item.comment.replies}</span>
                  </div>
                )}
                {item.comment.review && (
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium">
                    Review
                  </span>
                )}
              </div>
              <span>{formatRelativeTime(item.comment.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Load More and Collapse Buttons */}
      <div className="flex justify-center items-center gap-4 mt-8">
        {comments.length > displayCount && (
          <button
            onClick={() => setDisplayCount(prev => prev + 10)}
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            Load More ({comments.length - displayCount} remaining)
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
