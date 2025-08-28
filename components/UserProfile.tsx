/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import { UserProfile as UserProfileType, WatchingData } from "@/lib/types";
import { fetchUserProfile, fetchWatchingData } from "@/lib/services/api";
import { Icons } from "@/lib/utils/icons";

export default function UserProfile() {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [watchingData, setWatchingData] = useState<WatchingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, watchingDataResult] = await Promise.all([
          fetchUserProfile(),
          fetchWatchingData(),
        ]);
        setProfile(profileData);
        setWatchingData(watchingDataResult);
      } catch (error) {
        console.error("Error fetching profile/watching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="mx-auto w-fit max-w-full px-4 sm:px-6 animate-pulse">
          {/* Profile Header Skeleton */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 text-center md:text-left">
                {/* Profile Picture Skeleton */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-200 rounded-full border-4 border-gray-100"></div>
                </div>

                {/* Profile Info Skeleton */}
                <div className="space-y-2">
                  <div className="h-6 md:h-8 bg-gray-200 rounded w-48 mx-auto md:mx-0"></div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="h-4 md:h-5 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 md:h-5 bg-gray-200 rounded w-40"></div>
                  </div>
                  {/* Now Watching Skeleton */}
                  <div className="bg-gray-200/80 backdrop-blur-sm rounded-xl h-8 mb-2 mt-4 mx-auto md:mx-0 w-60"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-500">Failed to load profile data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Profile Content - Fullscreen and centered */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="mx-auto w-fit max-w-full px-4 sm:px-6">
          {/* Profile Header */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 text-center md:text-left">
                {/* Profile Picture */}
                <div className="relative shrink-0">
                  <img
                    src="https://wsrv.nl/?url=https://cfcdn.sayed.app/watch/dp.jpg&w=140&output=webp&q=85&maxage=14d"
                    alt="Sayed's Profile Picture"
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-200 object-cover shadow-xl"
                    loading="eager"
                    decoding="async"
                  />
                  <a
                    href={`https://trakt.tv/users/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute -top-2 -right-2 hover:scale-110 transition-all duration-200"
                  >
                    <Icons.TraktT className="w-6 h-6 md:w-8 md:h-8 text-red-600 drop-shadow-lg" />
                  </a>
                </div>

                {/* Profile Info */}
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                    {profile.name}
                  </h1>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm md:text-base text-gray-600">
                    {profile.location && (
                      <span className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-500" />
                        {profile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500" />
                      Joined in{" "}
                      {new Date(profile.joined_at).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {profile.about && (
                    <p className="text-sm md:text-base text-gray-700 italic max-w-3xl leading-relaxed mt-2">
                      {profile.about}
                    </p>
                  )}

                  {/* Now Watching - Integrated into profile */}
                  {watchingData?.isWatching && watchingData.content && (
                    <div className="mt-4 p-3 bg-green-50/80 backdrop-blur-sm rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-600 font-medium text-xs uppercase tracking-wide">
                          Currently Watching
                        </span>
                      </div>
                      <div className="text-sm md:text-base">
                        <div className="font-semibold text-gray-800">
                          {watchingData.content.title} (
                          {watchingData.content.year})
                        </div>
                        {watchingData.content.subtitle && (
                          <div className="text-gray-600 text-sm">
                            {watchingData.content.subtitle}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
