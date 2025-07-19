import UserProfileStats from "@/components/UserProfileStats";
import MovieHistory from "@/components/MovieHistory";
import ShowHistory from "@/components/ShowHistory";
import MovieWatchlist from "@/components/MovieWatchlist";
import CustomLists from "@/components/CustomLists";
import UserComments from "@/components/UserComments";
import WatchedMoviesGrid from "@/components/WatchedMoviesGrid";
import WatchedShowsGrid from "@/components/WatchedShowsGrid";
import SearchInterface from "@/components/SearchInterface";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* User Profile & Stats */}
        <UserProfileStats />
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
  );
}
