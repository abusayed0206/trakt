import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎬 Personal Trakt Data API
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your personal Trakt viewing data, served as a fast, local API
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Real-time Data
            </h2>
            <p className="text-gray-600 mb-4">
              Automatically synced daily from Trakt.tv via GitHub Actions. Your
              complete viewing history, watchlist, and statistics are always up
              to date.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Daily sync at 05:34 UTC</li>
              <li>• Complete watch history</li>
              <li>• Movie and show statistics</li>
              <li>• Watchlist management</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Fast API
            </h2>
            <p className="text-gray-600 mb-4">
              In-memory cached API serving data from local JSON files. No
              external API calls means blazing fast response times.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• In-memory caching</li>
              <li>• Local JSON storage</li>
              <li>• TypeScript types</li>
              <li>• RESTful endpoints</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Search & Filter
            </h2>
            <p className="text-gray-600 mb-4">
              Search across your entire viewing history. Filter by movies or
              shows, find specific titles, and track your viewing patterns.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• Full-text search</li>
              <li>• Content type filtering</li>
              <li>• Statistics summaries</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">🖼️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Media Assets
            </h2>
            <p className="text-gray-600 mb-4">
              High-quality movie posters and show backdrops automatically
              downloaded from TMDB and organized in a clean directory structure.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>• High-quality posters (w780)</li>
              <li>• Backdrop images (w1280)</li>
              <li>• Organized file structure</li>
              <li>• Skip existing files</li>
            </ul>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            href="/api-test"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            🧪 Test API Endpoints
          </Link>

          <div className="text-sm text-gray-500">
            <p>
              API Base URL:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">/api/trakt</code>
            </p>
            <p className="mt-2">
              <a
                href="https://github.com/abusayed0206/watch/blob/main/API_DOCUMENTATION.md"
                target="_blank"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                📖 View Full API Documentation
              </a>
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Start
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Example API Calls
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-100 p-2 rounded font-mono">
                  GET /api/trakt/user/profile
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  GET /api/trakt/user/watched?type=movies
                </div>
                <div className="bg-gray-100 p-2 rounded font-mono">
                  GET /api/trakt/search?q=inception
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Available Endpoints
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <code>/user/profile</code> - User information
                </li>
                <li>
                  • <code>/user/stats</code> - Viewing statistics
                </li>
                <li>
                  • <code>/user/history</code> - Watch history
                </li>
                <li>
                  • <code>/user/watched</code> - Watched content
                </li>
                <li>
                  • <code>/user/watchlist</code> - Watchlist items
                </li>
                <li>
                  • <code>/search</code> - Search content
                </li>
                <li>
                  • <code>/summary</code> - Quick overview
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
