'use client';

import { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import type { SearchResult } from '@/lib/types';
import { searchContent } from '@/lib/services/api';
import PosterGrid from './PosterGrid';
import type { MediaCard } from './PosterCard';

type SearchType = 'all' | 'movies' | 'shows';

function toCards(results: SearchResult): MediaCard[] {
  const subtitle = (r: { source: string; plays?: number }) =>
    r.source === 'watched' ? `Watched${r.plays && r.plays > 1 ? ` · ${r.plays} plays` : ''}` : r.source === 'watchlist' ? 'On watchlist' : 'In history';
  return [
    ...(results.results.movies ?? []).map((r, i): MediaCard => ({
      key: `m${i}`, type: 'movie', title: r.movie.title, year: r.movie.year, tmdb: r.movie.ids.tmdb,
      imdb: r.movie.ids.imdb, trakt: r.movie.ids.trakt, poster: r.poster ?? null, subtitle: subtitle(r), badge: 'Movie',
    })),
    ...(results.results.shows ?? []).map((r, i): MediaCard => ({
      key: `s${i}`, type: 'show', title: r.show.title, year: r.show.year, tmdb: r.show.ids.tmdb,
      imdb: r.show.ids.imdb, trakt: r.show.ids.trakt, poster: r.poster ?? null, subtitle: subtitle(r), badge: 'TV',
    })),
  ];
}

export default function SearchInterface() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<SearchType>('all');
  const [results, setResults] = useState<{ query: string; cards: MediaCard[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    try {
      setResults({ query: q, cards: toCards(await searchContent(q, type)) });
    } catch {
      setResults({ query: q, cards: [] });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults(null);
  };

  return (
    <div>
      <form onSubmit={search} className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search watched movies and shows</span>
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my movies and shows…"
            className="w-full rounded-full bg-white/5 py-3 pl-11 pr-10 text-base text-zinc-100 placeholder-zinc-500 ring-1 ring-white/10 outline-none focus:bg-white/10 focus:ring-red-500/60"
          />
          {results && (
            <button type="button" onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-zinc-200" aria-label="Clear search">
              <FaTimes />
            </button>
          )}
        </label>
        <div className="flex justify-center gap-2">
          <div className="flex flex-1 rounded-full bg-white/5 p-1 ring-1 ring-white/10 sm:flex-none" role="radiogroup" aria-label="Search type">
            {(['all', 'movies', 'shows'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => setType(t)}
                className={`flex-1 rounded-full px-3.5 py-2 text-sm font-medium capitalize ${type === t ? 'bg-white text-zinc-900' : 'text-zinc-300 hover:text-white'}`}
              >
                {t === 'shows' ? 'TV' : t}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {results && (
        <div className="mt-6">
          <p className="mb-5 text-center text-sm text-zinc-400">
            {results.cards.length.toLocaleString()} result{results.cards.length === 1 ? '' : 's'} for “{results.query}”
          </p>
          <PosterGrid key={results.query + type} cards={results.cards} emptyText="No matches in my library." />
        </div>
      )}
    </div>
  );
}
