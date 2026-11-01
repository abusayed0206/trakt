'use client';

import { useState } from 'react';
import PosterCard, { MediaCard } from './PosterCard';

/** Poster column widths for a centered flex-wrap grid (3/4/5/6 columns, gap-x-3), so a short last row stays centered */
export const POSTER_ROW = 'flex flex-wrap justify-center gap-x-3 gap-y-6';
export const POSTER_CELL =
  'w-[calc((100%-1.5rem)/3)] sm:w-[calc((100%-2.25rem)/4)] md:w-[calc((100%-3rem)/5)] lg:w-[calc((100%-3.75rem)/6)]';

interface PosterGridProps {
  cards: MediaCard[];
  /** Cards shown before "Show more" (two rows on wide screens) */
  initial?: number;
  emptyText?: string;
}

export default function PosterGrid({ cards, initial = 12, emptyText = 'Nothing here yet.' }: PosterGridProps) {
  const [count, setCount] = useState(initial);

  if (cards.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-500">{emptyText}</p>;
  }

  return (
    <>
      <div className={POSTER_ROW}>
        {cards.slice(0, count).map((card) => (
          <div key={card.key} className={POSTER_CELL}>
            <PosterCard card={card} />
          </div>
        ))}
      </div>

      {(cards.length > count || count > initial) && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {cards.length > count && (
            <button
              onClick={() => setCount((c) => c + initial * 2)}
              className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-zinc-100 ring-1 ring-white/10 hover:bg-white/15"
            >
              Show more · {(cards.length - count).toLocaleString()} left
            </button>
          )}
          {count > initial && (
            <button
              onClick={() => setCount(initial)}
              className="rounded-full px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </>
  );
}
