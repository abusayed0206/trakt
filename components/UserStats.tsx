"use client";

import { useEffect, useState } from "react";
import {
  FaFilm,
  FaTv,
  FaClock,
} from "react-icons/fa";
import { UserStats as UserStatsType } from "@/lib/types";
import { fetchUserStats } from "@/lib/services/api";
import { formatWatchTime } from "@/lib/utils/media";

export default function UserStats() {
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await fetchUserStats();
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8 animate-pulse">
        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-50/80 rounded-lg p-4 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <p className="text-gray-500 text-center">Failed to load stats data</p>
      </div>
    );
  }

  const totalWatchTime = stats.movies.minutes + stats.episodes.minutes;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-200/50 hover:shadow-md transition-shadow">
          <FaFilm className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Movies Watched
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.movies.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-200/50 hover:shadow-md transition-shadow">
          <FaClock className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Movie Time
          </p>
          <p className="text-xl font-bold text-gray-800">
            {formatWatchTime(stats.movies.minutes)}
          </p>
        </div>

        <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-200/50 hover:shadow-md transition-shadow">
          <FaTv className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Shows Watched
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.shows.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-200/50 hover:shadow-md transition-shadow">
          <FaTv className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Episodes
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.episodes.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-200/50 hover:shadow-md transition-shadow">
          <FaClock className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Episode Time
          </p>
          <p className="text-xl font-bold text-gray-800">
            {formatWatchTime(stats.episodes.minutes)}
          </p>
        </div>

        <div className="bg-gray-50/80 rounded-xl p-4 text-center border border-gray-200/50 hover:shadow-md transition-shadow">
          <FaClock className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Total Time
          </p>
          <p className="text-xl font-bold text-gray-800">
            {formatWatchTime(totalWatchTime)}
          </p>
        </div>
      </div>
    </div>
  );
}
