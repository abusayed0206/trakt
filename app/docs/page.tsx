import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API docs · Sayed\'s Trakt Tracker',
  description: 'Read-only JSON API over a daily snapshot of my Trakt.tv data',
};

const ENDPOINTS: { path: string; params?: string; description: string }[] = [
  { path: '/api/trakt', description: 'Index of the data snapshot and when it last changed' },
  { path: '/api/trakt/user/profile', description: 'Trakt profile' },
  { path: '/api/trakt/user/stats', description: 'Watched counts and watch time (rebuilt from watched data)' },
  { path: '/api/trakt/user/history', params: 'type=movies|shows', description: 'Most recent 100 plays per type' },
  { path: '/api/trakt/user/watched', params: 'type=movies|shows', description: 'Everything watched, with play counts; shows include per-season episode progress' },
  { path: '/api/trakt/user/watchlist', params: 'type=movies|shows', description: 'Watchlist, ranked' },
  { path: '/api/trakt/user/lists', description: 'Public lists' },
  { path: '/api/trakt/user/lists/{slug}', description: 'Items of one list, each with a resolved poster URL' },
  { path: '/api/trakt/user/comments', description: 'Comments and reviews' },
  { path: '/api/trakt/search', params: 'q=…&type=all|movies|shows', description: 'Title search across watched, watchlist and history' },
  { path: '/api/images', params: 'type=movies|shows&category=posters|backdrops&tmdb_id=…[&season=N]', description: '302 redirect to an optimized image on the CDN' },
  { path: '/api/images/random-backdrop', description: 'A random backdrop URL' },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/" className="text-sm text-zinc-400 transition hover:text-white">
          ← Back to the dashboard
        </Link>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">API</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          Read-only JSON over a snapshot of my Trakt.tv data. A GitHub Action refreshes it daily and the site redeploys
          only when something changed. All endpoints are <code className="text-zinc-200">GET</code>, return{' '}
          <code className="text-zinc-200">{'{ metadata, data }'}</code> unless noted, and allow cross-origin requests.
        </p>

        <div className="mt-10 overflow-hidden rounded-xl ring-1 ring-white/10">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="border-t border-white/5 bg-white/[0.02] px-5 py-4 first:border-t-0">
              <code className="break-all font-mono text-sm text-red-400">
                {e.path}
                {e.params && <span className="text-zinc-500">?{e.params}</span>}
              </code>
              <p className="mt-1 text-sm text-zinc-400">{e.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/api-test"
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            Try the endpoints
          </Link>
          <a
            href="https://github.com/abusayed0206/trakt/blob/main/API_DOCUMENTATION.md"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/15"
          >
            Full reference on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
