/* eslint-disable @next/next/no-img-element */
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import type { UserProfile, UserStats } from '@/lib/types';
import { Icons } from '@/lib/utils/icons';
import { formatWatchTime } from '@/lib/utils/media';
import HeroBackdrop from './HeroBackdrop';

interface HeroProps {
  profile: UserProfile | null;
  stats: UserStats | null;
  backdrops: string[];
}

export default function Hero({ profile, stats, backdrops }: HeroProps) {
  const statItems = stats
    ? [
        { label: 'Movies', value: stats.movies.watched.toLocaleString() },
        { label: 'Movie time', value: formatWatchTime(stats.movies.minutes) },
        { label: 'Shows', value: stats.shows.watched.toLocaleString() },
        { label: 'Episodes', value: stats.episodes.watched.toLocaleString() },
        { label: 'Episode time', value: formatWatchTime(stats.episodes.minutes) },
        { label: 'Total time', value: formatWatchTime(stats.movies.minutes + stats.episodes.minutes) },
      ]
    : [];

  return (
    <header className="relative isolate overflow-hidden">
      <HeroBackdrop urls={backdrops} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-zinc-950/40 via-zinc-950/75 to-zinc-950" />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-20 sm:pt-28">
        {profile && (
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
            <a
              href={`https://trakt.tv/users/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative shrink-0"
              title="Trakt profile"
            >
              <img
                src="https://wsrv.nl/?url=https://cfcdn.sayed.app/watch/dp.jpg&w=192&output=webp&q=85&maxage=14d"
                alt={profile.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white/15"
              />
              <Icons.TraktT className="absolute -bottom-1 -right-1 h-8 w-8 drop-shadow-lg" alt="" />
            </a>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{profile.name}</h1>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-zinc-300 sm:justify-start">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-zinc-400" aria-hidden />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-zinc-400" aria-hidden />
                  Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              {profile.about && <p className="mt-3 max-w-2xl text-zinc-300 italic">{profile.about}</p>}
            </div>
          </div>
        )}

        {statItems.length > 0 && (
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-3 lg:grid-cols-6">
            {statItems.map((s) => (
              <div key={s.label} className="bg-zinc-950/70 px-4 py-4 backdrop-blur">
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-400">{s.label}</dt>
                <dd className="mt-1 text-2xl font-semibold tabular-nums text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </header>
  );
}
