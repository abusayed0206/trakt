/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/lib/utils/icons';
import { getImdbUrl, getLetterboxdUrl, getTmdbUrl, getTraktUrl } from '@/lib/utils/media';

/** Everything a poster card needs; built on the server so pages ship only these fields */
export interface MediaCard {
  key: string;
  type: 'movie' | 'show';
  title: string;
  year?: number | null;
  tmdb: number;
  imdb?: string | null;
  trakt: number;
  poster: string | null;
  subtitle?: string;
  badge?: string;
}

const linkClass = 'opacity-60 transition hover:opacity-100';

export default function PosterCard({ card }: { card: MediaCard }) {
  const [broken, setBroken] = useState(false);
  const href = card.type === 'movie' ? `/movie/${card.tmdb}` : `/tv/${card.tmdb}`;
  const label = card.year ? `${card.title} (${card.year})` : card.title;

  return (
    <div className="group min-w-0">
      <Link
        href={href}
        className="relative block aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800/60 ring-1 ring-white/10 transition group-hover:ring-white/30"
      >
        {card.poster && !broken ? (
          <img
            src={card.poster}
            alt={label}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center p-3 text-center text-sm text-zinc-400">
            {label}
          </span>
        )}
        {card.badge && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {card.badge}
          </span>
        )}
      </Link>

      <h3 className="mt-2 truncate text-sm font-medium text-zinc-100" title={label}>
        {card.title}
      </h3>
      {card.subtitle && <p className="truncate text-xs text-zinc-400">{card.subtitle}</p>}

      <div className="mt-1.5 hidden items-center gap-2 sm:flex">
        {card.type === 'movie' && card.imdb && (
          <a href={getLetterboxdUrl(card.imdb)} target="_blank" rel="noopener noreferrer" title="Letterboxd" className={linkClass}>
            <Icons.Letterboxd className="h-5 w-5 rounded" alt="Letterboxd" />
          </a>
        )}
        <a href={getTraktUrl(card.trakt, card.type)} target="_blank" rel="noopener noreferrer" title="Trakt" className={linkClass}>
          <Icons.Trakt className="h-5 w-5 rounded" alt="Trakt" />
        </a>
        {card.imdb && (
          <a href={getImdbUrl(card.imdb)} target="_blank" rel="noopener noreferrer" title="IMDb" className={linkClass}>
            <Icons.Imdb className="h-5 w-5 rounded" alt="IMDb" />
          </a>
        )}
        <a href={getTmdbUrl(card.tmdb, card.type === 'movie' ? 'movie' : 'tv')} target="_blank" rel="noopener noreferrer" title="TMDB" className={linkClass}>
          <Icons.Tmdb className="h-5 w-5 rounded" alt="TMDB" />
        </a>
      </div>
    </div>
  );
}
