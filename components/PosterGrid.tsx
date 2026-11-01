'use client';

import { useState } from 'react';
import PosterCard, { MediaCard } from './PosterCard';

interface PosterGridProps {
  cards: MediaCard[];
  /** Cards shown before "Show more" (two rows on wide screens) */
  initial?: number;
  emptyText?: string;
}

export default function PosterGrid({ cards, initial = 12, emptyText = 'Nothing here yet.' }: PosterGridProps) {
  const [count, setCount] = useState(initial);

  if (cards.length === 0) {
    return <p className="py-6 text-sm text-zinc-500">{emptyText}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {cards.slice(0, count).map((card) => (
          <PosterCard key={card.key} card={card} />
        ))}
      </div>

      {(cards.length > count || count > initial) && (
        <div className="mt-6 flex justify-center gap-3">
          {cards.length > count && (
            <button
              onClick={() => setCount((c) => c + initial * 2)}
              className="rounded-full bg-white/10 px-5 py-2 text-sm font-medium text-zinc-100 ring-1 ring-white/10 transition hover:bg-white/15"
            >
              Show more · {(cards.length - count).toLocaleString()} left
            </button>
          )}
          {count > initial && (
            <button
              onClick={() => setCount(initial)}
              className="rounded-full px-5 py-2 text-sm font-medium text-zinc-400 transition hover:text-zinc-100"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </>
  );
}
