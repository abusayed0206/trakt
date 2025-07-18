/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import {
  FaUser,
  FaFilm,
  FaTv,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { UserProfile, UserStats } from "@/lib/types";
import { fetchUserProfile, fetchUserStats } from "@/lib/services/api";
import { formatWatchTime } from "@/lib/utils/media";

export default function UserProfileStats() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          fetchUserProfile(),
          fetchUserStats(),
        ]);
        setProfile(profileData);
        setStats(statsData);
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
      <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3"></div>
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

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div className="relative">
          <img
            src="https://wsrv.nl/?url=https://cfcdn.sayed.app/watch/dp.jpg&w=300&output=webp&q=85&maxage=31d"
            alt="Sayed's Profile Picture"
            className="w-24 h-24 rounded-full border-4 border-gray-100 object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {profile.name}
          </h1>
          <p className="text-gray-600 mb-1 flex items-center gap-2">
            <FaUser className="text-sm" />@{profile.username}
          </p>
          {profile.location && (
            <p className="text-gray-600 mb-1 flex items-center gap-2">
              <FaMapMarkerAlt className="text-sm" />
              {profile.location}
            </p>
          )}
          <p className="text-gray-600 mb-1 flex items-center gap-2">
            <FaCalendarAlt className="text-sm" />
            Joined{" "}
            {new Date(profile.joined_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
          {profile.about && (
            <p className="text-gray-700 mt-3 italic">{profile.about}</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <FaFilm className="text-blue-500 text-2xl mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Movies Watched</p>
          <p className="text-xl font-bold text-blue-600">
            {stats.movies.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 text-center">
          <FaClock className="text-green-500 text-2xl mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Movie Time</p>
          <p className="text-xl font-bold text-green-600">
            {formatWatchTime(stats.movies.minutes)}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <FaTv className="text-purple-500 text-2xl mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Shows Watched</p>
          <p className="text-xl font-bold text-purple-600">
            {stats.shows.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <FaTv className="text-orange-500 text-2xl mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Episodes</p>
          <p className="text-xl font-bold text-orange-600">
            {stats.episodes.watched.toLocaleString()}
          </p>
        </div>

        <div className="bg-pink-50 rounded-lg p-4 text-center">
          <FaClock className="text-pink-500 text-2xl mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Episode Time</p>
          <p className="text-xl font-bold text-pink-600">
            {formatWatchTime(stats.episodes.minutes)}
          </p>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <FaClock className="text-indigo-500 text-2xl mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">Total Time</p>
          <p className="text-xl font-bold text-indigo-600">
            {formatWatchTime(totalWatchTime)}
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Plays</p>
          <p className="text-2xl font-bold text-gray-800">
            {(stats.movies.plays + stats.episodes.plays).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Ratings Given</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.ratings.total.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Following</p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.network.following.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
