/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  FaFilm,
  FaTv,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPlay,
} from "react-icons/fa";
import { UserProfile, UserStats, WatchingData } from "@/lib/types";
import {
  fetchUserProfile,
  fetchUserStats,
  fetchWatchingData,
} from "@/lib/services/api";
import { formatWatchTime } from "@/lib/utils/media";
import { Icons } from "@/lib/utils/icons";

export default function UserProfileStats() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [watchingData, setWatchingData] = useState<WatchingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData, watchingDataResult] = await Promise.all([
          fetchUserProfile(),
          fetchUserStats(),
          fetchWatchingData(),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setWatchingData(watchingDataResult);
      } catch (error) {
        console.error("Error fetching profile/stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 animate-pulse">
        {/* Profile Header Skeleton */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-200 rounded-full border-4 border-gray-100"></div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center space-y-3">
            <div className="h-8 bg-gray-200 rounded w-80 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-40 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
        </div>

        {/* Now Watching Banner Skeleton */}
        <div className="rounded-xl bg-gray-200 h-48 mb-8"></div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Additional Stats Skeleton */}
        <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-3 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500 text-center">Failed to load profile data</p>
      </div>
    );
  }

  const totalWatchTime = stats.movies.minutes + stats.episodes.minutes;

  // Now Watching Component
  const NowWatchingBanner = () => {
    if (!watchingData?.isWatching || !watchingData.content) {
      return null;
    }

    const { content } = watchingData;
    const progressPercentage = content.progress?.percentage || 0;

    return (
      <div
        className="relative overflow-hidden rounded-xl mb-8 shadow-lg"
        style={{
          backgroundImage: content.images.backdrop
            ? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${content.images.backdrop})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "200px",
        }}
      >
        <div className="relative z-10 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FaPlay className="text-green-400 text-xl" />
            <span className="text-green-400 font-semibold text-sm uppercase tracking-wide">
              Now Watching
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              {content.title}
            </h2>
            {content.subtitle && (
              <p className="text-lg text-gray-200">{content.subtitle}</p>
            )}
            <p className="text-sm text-gray-300">
              {content.year} • {content.type === "movie" ? "Movie" : "TV Show"}
            </p>
          </div>

          {content.progress && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Progress</span>
                <span className="text-sm text-gray-300">
                  {progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                <span>
                  Started:{" "}
                  {new Date(content.progress.started_at).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
                <span>
                  Ends:{" "}
                  {new Date(content.progress.expires_at).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center mt-4 text-xs text-gray-400">
            {content.type === "movie" && (
              <a
                href={`https://letterboxd.com/${profile.username}/film/${content.ids.imdb}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <Icons.Letterboxd className="inline w-5 h-5 mr-1" />
                LB
              </a>
            )}

            <a
              href={`https://trakt.tv/${
                content.type === "movie" ? "movies" : "shows"
              }/${content.ids.trakt}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Icons.Trakt className="inline w-5 h-5 mr-1" />
              Trakt
            </a>
            <a
              href={`https://www.imdb.com/title/${content.ids.imdb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Icons.Imdb className="inline w-4 h-4 mr-1" />
              IMDB
            </a>
            <a
              href={`https://www.themoviedb.org/${
                content.type === "movie" ? "movie" : "tv"
              }/${content.ids.tmdb}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              <Icons.Tmdb className="inline w-4 h-4 mr-1" />
              TMDB
            </a>
          </div>
        </div>

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-6 mb-10">
        <div className="relative">
          <img
            src="https://wsrv.nl/?url=https://cfcdn.sayed.app/watch/dp.jpg&w=300&output=webp&q=85&maxage=31d"
            alt="Sayed's Profile Picture"
            className="w-28 h-28 rounded-full border-4 border-gray-200 object-cover shadow-lg"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="flex-1 flex flex-col items-center text-center">
          <a
            href={`https://trakt.tv/users/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-800 hover:text-gray-600 transition-colors"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2 decoration-2 underline-offset-4 flex items-center justify-center gap-2">
              {profile.name} <Icons.Trakt className="text-gray-700" />{" "}
              {profile.username}
            </h1>
          </a>
          {profile.location && (
            <p className="text-gray-600 mb-1 flex items-center justify-center gap-2">
              <FaMapMarkerAlt className="text-sm text-gray-500" />
              {profile.location}
            </p>
          )}
          <p className="text-gray-600 mb-1 flex items-center justify-center gap-2">
            <FaCalendarAlt className="text-sm text-gray-500" />
            Joined in{" "}
            {new Date(profile.joined_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
          {profile.about && (
            <p className="text-gray-700 mt-3 italic text-center max-w-md">
              {profile.about}
            </p>
          )}
        </div>
      </div>

      {/* Now Watching Banner */}
      <NowWatchingBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
          <FaFilm className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Movies Watched
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.movies.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
          <FaClock className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Movie Time
          </p>
          <p className="text-xl font-bold text-gray-800">
            {formatWatchTime(stats.movies.minutes)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
          <FaTv className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Shows Watched
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.shows.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
          <FaTv className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Episodes
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.episodes.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
          <FaClock className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Episode Time
          </p>
          <p className="text-xl font-bold text-gray-800">
            {formatWatchTime(stats.episodes.minutes)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 hover:shadow-md transition-shadow">
          <FaClock className="text-gray-700 text-2xl mx-auto mb-3" />
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Total Time
          </p>
          <p className="text-xl font-bold text-gray-800">
            {formatWatchTime(totalWatchTime)}
          </p>
        </div>
      </div>

      {/* Additional Stats 

    [I intensionally commented this code. As I dont want to show this stats in the profile page.]


      <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
        <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Total Plays
          </p>
          <p className="md:text-sm text-2xl font-bold text-gray-800">
            {(stats.movies.plays + stats.episodes.plays).toLocaleString()}
          </p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Ratings Given
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.ratings.total.toLocaleString()}
          </p>
        </div>
        <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-600 mb-2 font-medium uppercase tracking-wide">
            Following
          </p>
          <p className="text-xl font-bold text-gray-800">
            {stats.network.following.toLocaleString()}
          </p>
        </div>
      </div>
      */}
    </div>
  );
}
