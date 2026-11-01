'use client';

import { useState } from 'react';
import { FaHeart, FaReply } from 'react-icons/fa';
import type { CommentItem } from '@/lib/types';
import { formatDate, getTraktUrl } from '@/lib/utils/media';

const INITIAL = 6;

export default function Reviews({ comments }: { comments: CommentItem[] }) {
  const [count, setCount] = useState(INITIAL);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  if (comments.length === 0) return <p className="py-6 text-center text-sm text-zinc-500">No comments yet.</p>;

  const toggle = (id: number) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <div className="flex flex-wrap justify-center gap-4">
        {comments.slice(0, count).map((item) => {
          const media = item.movie ?? item.show;
          const hidden = item.comment.spoiler && !revealed.has(item.comment.id);
          return (
            <article key={item.comment.id} className="flex w-full flex-col rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/10 md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]">
              <header className="mb-2 min-w-0">
                {media && (
                  <a
                    href={getTraktUrl(media.ids.trakt, item.movie ? 'movie' : 'show')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate py-1 font-medium text-zinc-100 hover:underline"
                  >
                    {media.title} <span className="font-normal text-zinc-500">{media.year}</span>
                  </a>
                )}
                {item.type === 'episode' && item.episode && (
                  <p className="truncate text-xs text-zinc-400">
                    S{item.episode.season}E{item.episode.number} · {item.episode.title}
                  </p>
                )}
              </header>

              {item.comment.spoiler ? (
                <button
                  onClick={() => toggle(item.comment.id)}
                  className="text-left text-sm leading-relaxed text-zinc-300"
                  aria-label={hidden ? 'Reveal spoiler' : 'Hide spoiler'}
                >
                  <span className="mr-2 rounded bg-red-500/15 px-1.5 py-0.5 text-xs font-semibold uppercase text-red-400">
                    Spoiler
                  </span>
                  <span className={hidden ? 'select-none blur-sm' : ''}>{item.comment.comment}</span>
                </button>
              ) : (
                <p className="text-sm leading-relaxed text-zinc-300">{item.comment.comment}</p>
              )}

              <footer className="mt-auto flex items-center gap-4 pt-3 text-xs text-zinc-500">
                {item.comment.likes > 0 && (
                  <span className="flex items-center gap-1">
                    <FaHeart aria-hidden /> {item.comment.likes}
                  </span>
                )}
                {item.comment.replies > 0 && (
                  <span className="flex items-center gap-1">
                    <FaReply aria-hidden /> {item.comment.replies}
                  </span>
                )}
                {item.comment.review && <span className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-300">Review</span>}
                <span className="ml-auto">{formatDate(item.comment.created_at)}</span>
              </footer>
            </article>
          );
        })}
      </div>

      {(comments.length > count || count > INITIAL) && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {comments.length > count && (
            <button
              onClick={() => setCount((c) => c + INITIAL)}
              className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-zinc-100 ring-1 ring-white/10 hover:bg-white/15"
            >
              Show more · {comments.length - count} left
            </button>
          )}
          {count > INITIAL && (
            <button onClick={() => setCount(INITIAL)} className="rounded-full px-6 py-2.5 text-sm font-medium text-zinc-400 hover:text-zinc-100">
              Show less
            </button>
          )}
        </div>
      )}
    </>
  );
}
