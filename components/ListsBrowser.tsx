'use client';

import { useEffect, useState } from 'react';
import type { ListItem } from '@/lib/types';
import { fetchListItems } from '@/lib/services/api';
import { formatDate } from '@/lib/utils/media';
import { Icons } from '@/lib/utils/icons';
import PosterGrid from './PosterGrid';
import type { MediaCard } from './PosterCard';

export interface ListSummary {
  slug: string;
  name: string;
  description: string;
  itemCount: number;
  shareLink?: string;
}

function toCard(item: ListItem): MediaCard | null {
  const media = item.movie ?? item.show;
  if (!media) return null;
  return {
    key: String(item.id),
    type: item.movie ? 'movie' : 'show',
    title: media.title,
    year: media.year,
    tmdb: media.ids.tmdb,
    imdb: media.ids.imdb,
    trakt: media.ids.trakt,
    poster: item.poster ?? null,
    subtitle: `Added ${formatDate(item.listed_at)}`,
    badge: `#${item.rank}`,
  };
}

// Items are fetched on demand: some lists hold thousands of entries
export default function ListsBrowser({ lists }: { lists: ListSummary[] }) {
  const [selected, setSelected] = useState(lists[0]?.slug);
  const [cards, setCards] = useState<MediaCard[] | null>(null);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setCards(null);
    fetchListItems(selected)
      .then((items) => !cancelled && setCards(items.map(toCard).filter((c): c is MediaCard => c !== null)))
      .catch(() => !cancelled && setCards([]));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const list = lists.find((l) => l.slug === selected);
  if (!list) return <p className="py-6 text-sm text-zinc-500">No public lists.</p>;

  return (
    <div>
      <div className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
        {lists.map((l) => (
          <button
            key={l.slug}
            role="tab"
            aria-selected={l.slug === selected}
            onClick={() => setSelected(l.slug)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition ${
              l.slug === selected
                ? 'bg-white text-zinc-900 ring-white'
                : 'bg-white/5 text-zinc-300 ring-white/10 hover:bg-white/10'
            }`}
          >
            {l.name} <span className="opacity-60">{l.itemCount.toLocaleString()}</span>
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-start justify-between gap-4">
        {list.description ? (
          <p className="line-clamp-2 max-w-3xl text-sm text-zinc-400">{list.description}</p>
        ) : (
          <span />
        )}
        {list.shareLink && (
          <a
            href={list.shareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
          >
            <Icons.Trakt className="h-4 w-4 rounded" alt="" /> Open on Trakt
          </a>
        )}
      </div>

      {cards === null ? (
        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : (
        <PosterGrid key={selected} cards={cards} emptyText="This list is empty." />
      )}
    </div>
  );
}
