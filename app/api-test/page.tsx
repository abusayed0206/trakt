'use client';

import { useState } from 'react';

interface ApiEndpoint {
  name: string;
  url: string;
  description: string;
  method: 'GET' | 'POST';
}

const API_ENDPOINTS: ApiEndpoint[] = [
  { name: 'Index', url: '/api/trakt', description: 'Main index with data structure', method: 'GET' },
  { name: 'User Profile', url: '/api/trakt/user/profile', description: 'User profile information', method: 'GET' },
  { name: 'User Stats', url: '/api/trakt/user/stats', description: 'User statistics overview', method: 'GET' },
  
  // History endpoints
  { name: 'All History', url: '/api/trakt/user/history', description: 'Complete watch history', method: 'GET' },
  { name: 'Movie History', url: '/api/trakt/user/history?type=movies', description: 'Movie watch history only', method: 'GET' },
  { name: 'Show History', url: '/api/trakt/user/history?type=shows', description: 'Show watch history only', method: 'GET' },
  
  // Watched endpoints
  { name: 'All Watched', url: '/api/trakt/user/watched', description: 'All watched content', method: 'GET' },
  { name: 'Watched Movies', url: '/api/trakt/user/watched?type=movies', description: 'Watched movies with play counts', method: 'GET' },
  { name: 'Watched Shows', url: '/api/trakt/user/watched?type=shows', description: 'Watched shows with episodes', method: 'GET' },
  
  // Watchlist endpoints
  { name: 'All Watchlist', url: '/api/trakt/user/watchlist', description: 'Complete watchlist', method: 'GET' },
  { name: 'Movie Watchlist', url: '/api/trakt/user/watchlist?type=movies', description: 'Movie watchlist only', method: 'GET' },
  { name: 'Show Watchlist', url: '/api/trakt/user/watchlist?type=shows', description: 'Show watchlist only', method: 'GET' },
  
  // Comments and Lists
  { name: 'Comments', url: '/api/trakt/user/comments', description: 'User comments', method: 'GET' },
  { name: 'Lists', url: '/api/trakt/user/lists', description: 'User created lists', method: 'GET' },
  { name: 'Personal MDBList Items', url: '/api/trakt/user/lists/personal-mdblist', description: 'Items in Personal MDBList', method: 'GET' },
  { name: 'Series Watchlist 2025 Items', url: '/api/trakt/user/lists/series-watchlist-for-2025', description: 'Items in Series Watchlist for 2025', method: 'GET' },
  { name: 'Anticipated Movies Items', url: '/api/trakt/user/lists/anticipated-movies', description: 'Items in Anticipated Movies list', method: 'GET' },
  
  
  // Search endpoints
  { name: 'Search Movies', url: '/api/trakt/search?q=inception&type=movies', description: 'Search for movies', method: 'GET' },
  { name: 'Search Shows', url: '/api/trakt/search?q=breaking&type=shows', description: 'Search for shows', method: 'GET' },
];

export default function ApiTestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [response, setResponse] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (endpoint: ApiEndpoint) => {
    setLoading(true);
    setError(null);
    setSelectedEndpoint(endpoint);

    try {
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/trakt', { method: 'POST' });
      const data = await response.json() as { message?: string };
      alert(data.message || 'Cache cleared');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear cache');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const searchEndpoint: ApiEndpoint = {
      name: `Search: "${searchQuery}"`,
      url: `/api/trakt/search?q=${encodeURIComponent(searchQuery)}`,
      description: `Search results for "${searchQuery}"`,
      method: 'GET',
    };
    
    fetchData(searchEndpoint);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Trakt API Test Interface</h1>
          <p className="text-gray-600 mb-4">
            Test your personal Trakt data API endpoints. All data is served from local JSON files.
          </p>
          
          {/* Cache Control */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Cache Control</h2>
            <p className="text-blue-700 text-sm mb-3">
              Clear the in-memory cache to refresh data from JSON files after GitHub Actions updates.
            </p>
            <button
              onClick={clearCache}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear Cache'}
            </button>
          </div>

          {/* Search */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">Search</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies or shows..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading || !searchQuery.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Endpoints List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {API_ENDPOINTS.map((endpoint, index) => (
                <button
                  key={index}
                  onClick={() => fetchData(endpoint)}
                  disabled={loading}
                  className={`w-full text-left p-3 rounded border transition-colors ${
                    selectedEndpoint?.url === endpoint.url
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  <div className="font-medium text-gray-900">{endpoint.name}</div>
                  <div className="text-sm text-gray-600">{endpoint.description}</div>
                  <div className="text-xs text-blue-600 font-mono">{endpoint.method} {endpoint.url}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Response Display */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Response</h2>
            
            {selectedEndpoint && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <div className="font-medium">{selectedEndpoint.name}</div>
                <div className="text-sm text-gray-600 font-mono">
                  {selectedEndpoint.method} {selectedEndpoint.url}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                <div className="font-medium text-red-800">Error</div>
                <div className="text-red-700">{error}</div>
              </div>
            )}

            {response !== null && !loading && (
              <div className="bg-gray-100 rounded p-4 max-h-96 overflow-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {typeof response === 'string'
                    ? response
                    : JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}

            {!selectedEndpoint && !loading && (
              <div className="text-center py-8 text-gray-500">
                Select an endpoint to see the response
              </div>
            )}
          </div>
        </div>

        {/* API Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Available Data</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• User profile and statistics</li>
                <li>• Complete watch history</li>
                <li>• Watched movies and shows with play counts</li>
                <li>• Watchlist items</li>
                <li>• User comments and lists</li>
                <li>• Search across all content</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• In-memory caching for performance</li>
                <li>• Type filtering (movies/shows/all)</li>
                <li>• Search functionality</li>
                <li>• Structured TypeScript types</li>
                <li>• Error handling</li>
                <li>• Automatic daily data updates</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This API serves your personal Trakt data from local JSON files. 
              Data is automatically updated daily via GitHub Actions. Use the &quot;Clear Cache&quot; button 
              to refresh data after updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
