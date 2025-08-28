"use client";

import { useEffect, useState } from "react";
import UserProfile from "@/components/UserProfile";
import UserStats from "@/components/UserStats";
import MovieHistory from "@/components/MovieHistory";
import ShowHistory from "@/components/ShowHistory";
import MovieWatchlist from "@/components/MovieWatchlist";
import CustomLists from "@/components/CustomLists";
import UserComments from "@/components/UserComments";
import WatchedMoviesGrid from "@/components/WatchedMoviesGrid";
import WatchedShowsGrid from "@/components/WatchedShowsGrid";
import SearchInterface from "@/components/SearchInterface";
import Footer from "@/components/Footer";
import { fetchWatchingData } from "@/lib/services/api";
import { useRandomBackdrop } from "@/lib/hooks/useRandomBackdrop";
import { WatchingData } from "@/lib/types";

export default function HomePage() {
  const [watchingData, setWatchingData] = useState<WatchingData | null>(null);
  const [watchingLoading, setWatchingLoading] = useState(true);

  // Fetch watching data to get current backdrop if any
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchWatchingData();
        setWatchingData(data);
      } catch (error) {
        console.error("Error fetching watching data:", error);
      } finally {
        setWatchingLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get backdrop URL (watching backdrop takes priority, otherwise random)
  const watchingBackdrop = watchingData?.content?.images?.backdrop;
  const { backdropUrl, loading: backdropLoading } = useRandomBackdrop(watchingBackdrop);

  // Don't show backdrop until we know if user is watching something
  const showBackdrop = !watchingLoading && !backdropLoading && backdropUrl;

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#f9fafb', // fallback color
      }}
    >
      {/* Fullscreen Background */}
      {showBackdrop && (
        <div
          className="fixed inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* User Profile & Stats */}
          <UserProfile />
          <UserStats />
          {/* Search Interface */}

          {/* Comments */}
          <UserComments />
          <SearchInterface />
          <MovieHistory />
          <ShowHistory />

          {/* Watchlist & Lists */}
          <MovieWatchlist />
          <CustomLists />

          {/* Watched Content Grids */}
          <WatchedMoviesGrid />
          <WatchedShowsGrid />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
