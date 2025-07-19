'use client';

import { getMoviePosterUrl, getShowPosterUrl, getShowSeasonPosterUrl } from '@/lib/utils/media';

export default function DebugUrls() {
  const tmdbId = 64840;
  const season = 1;

  const urls = {
    'Movie Poster': getMoviePosterUrl(tmdbId),
    'Show Poster': getShowPosterUrl(tmdbId),
    'Show Season Poster': getShowSeasonPosterUrl(tmdbId, season),
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Generated URLs</h1>
      
      <div className="space-y-6">
        {Object.entries(urls).map(([label, url]) => (
          <div key={label} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold mb-2">{label}</h3>
            <p className="text-sm text-gray-600 mb-4 break-all font-mono">{url}</p>
            
            <div className="flex gap-4">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Open in New Tab
              </a>
              
              <button
                onClick={() => {
                  fetch(url)
                    .then(response => {
                      console.log(`${label} Response:`, response.status, response.statusText);
                      console.log(`${label} Headers:`, Object.fromEntries(response.headers.entries()));
                    })
                    .catch(error => {
                      console.error(`${label} Fetch Error:`, error);
                    });
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Fetch
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded">
        <h3 className="font-bold mb-2">Debug Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check browser console for fetch results</li>
          <li>Click "Open in New Tab" to test direct image loading</li>
          <li>Click "Test Fetch" to test programmatic access</li>
          <li>Look for CORS or other network errors</li>
        </ul>
      </div>
    </div>
  );
}
