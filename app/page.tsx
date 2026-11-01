import { FaBookmark, FaFilm, FaList, FaRegCommentDots, FaSearch, FaTv } from 'react-icons/fa';
import Hero from '@/components/Hero';
import Section from '@/components/Section';
import PosterGrid from '@/components/PosterGrid';
import ListsBrowser, { ListSummary } from '@/components/ListsBrowser';
import Reviews from '@/components/Reviews';
import SearchInterface from '@/components/SearchInterface';
import Footer from '@/components/Footer';
import type { MediaCard } from '@/components/PosterCard';
import { TraktDataService } from '@/lib/services/trakt-data';
import { getImageUrl } from '@/lib/imageIndex';
import { formatDate } from '@/lib/utils/media';
import type { HistoryItem, Movie, Show } from '@/lib/types';

// Data only changes when the daily sync commits and Vercel redeploys, so the page is rendered at build time
export const dynamic = 'force-static';

const RECENT = 12;

function movieCard(movie: Movie, key: string, extra: Partial<MediaCard> = {}): MediaCard {
  return {
    key, type: 'movie', title: movie.title, year: movie.year, tmdb: movie.ids.tmdb, imdb: movie.ids.imdb,
    trakt: movie.ids.trakt, poster: getImageUrl('movies', 'posters', movie.ids.tmdb), ...extra,
  };
}

function showCard(show: Show, key: string, extra: Partial<MediaCard> = {}, season?: number): MediaCard {
  const seasonPoster = season === undefined ? null : getImageUrl('shows', 'posters', show.ids.tmdb, { season });
  return {
    key, type: 'show', title: show.title, year: show.year, tmdb: show.ids.tmdb, imdb: show.ids.imdb,
    trakt: show.ids.trakt, poster: seasonPoster ?? getImageUrl('shows', 'posters', show.ids.tmdb), ...extra,
  };
}

/** Latest episode per show, so a binge shows up once instead of filling the row */
function recentShows(history: HistoryItem[]): MediaCard[] {
  const groups = new Map<number, { item: HistoryItem; count: number }>();
  for (const item of history) {
    if (!item.show) continue;
    const group = groups.get(item.show.ids.tmdb);
    if (group) group.count++;
    else groups.set(item.show.ids.tmdb, { item, count: 1 });
  }
  return [...groups.values()].slice(0, RECENT).map(({ item, count }) => {
    const ep = item.episode;
    return showCard(
      item.show!,
      String(item.id),
      {
        subtitle: `${ep ? `S${ep.season}E${ep.number} · ` : ''}${formatDate(item.watched_at)}`,
        badge: count > 1 ? `${count} eps` : undefined,
      },
      ep?.season
    );
  });
}

export default function HomePage() {
  const data = TraktDataService.getInstance();
  const profile = data.getUserProfile()?.data ?? null;
  const stats = data.getUserStats()?.data ?? null;
  const movieHistory = data.getUserHistoryMovies()?.data ?? [];
  const showHistory = data.getUserHistoryShows()?.data ?? [];
  const watchedMovies = data.getUserWatchedMovies()?.data ?? [];
  const watchedShows = data.getUserWatchedShows()?.data ?? [];
  const watchlist = data.getUserWatchlist()?.data ?? [];
  const comments = data.getUserComments()?.data ?? [];

  const seen = new Set<number>();
  const recentMovies = movieHistory
    .filter((h) => h.movie && !seen.has(h.movie.ids.tmdb) && seen.add(h.movie.ids.tmdb))
    .slice(0, RECENT)
    .map((h) => movieCard(h.movie!, String(h.id), { subtitle: formatDate(h.watched_at) }));

  const recentEpisodes = recentShows(showHistory);

  const watchlistCards = [...watchlist]
    .sort((a, b) => a.rank - b.rank)
    .map((w) => {
      const extra = { badge: `#${w.rank}`, subtitle: `Added ${formatDate(w.listed_at)}` };
      if (w.movie) return movieCard(w.movie, String(w.id), extra);
      if (w.show) return showCard(w.show, String(w.id), { ...extra, subtitle: `TV · ${extra.subtitle}` });
      return null;
    })
    .filter((c): c is MediaCard => c !== null);

  const libraryMovies = [...watchedMovies]
    .sort((a, b) => b.last_watched_at.localeCompare(a.last_watched_at))
    .map((w) =>
      movieCard(w.movie, `wm${w.movie.ids.trakt}`, {
        subtitle: formatDate(w.last_watched_at),
        badge: w.plays > 1 ? `${w.plays}×` : undefined,
      })
    );

  const libraryShows = [...watchedShows]
    .sort((a, b) => b.last_watched_at.localeCompare(a.last_watched_at))
    .map((w) => {
      const episodes = (w.seasons ?? []).reduce((n, s) => n + s.episodes.length, 0);
      const aired = w.show.aired_episodes;
      return showCard(w.show, `ws${w.show.ids.trakt}`, {
        subtitle: aired ? `${episodes}/${aired} episodes` : `${episodes} episodes`,
      });
    });

  const lists: ListSummary[] = (data.getUserLists()?.data ?? [])
    .filter((l) => data.getListItems(l.ids.slug))
    .map((l) => ({
      slug: l.ids.slug, name: l.name, description: l.description, itemCount: l.item_count, shareLink: l.share_link,
    }));

  // Backdrops from what was watched most recently, so the header reflects current viewing
  const backdrops = [
    ...recentMovies.map((c) => getImageUrl('movies', 'backdrops', c.tmdb, { width: 1600 })),
    ...recentEpisodes.map((c) => getImageUrl('shows', 'backdrops', c.tmdb, { width: 1600 })),
  ].filter((u): u is string => u !== null);

  const nav = [
    ['#search', 'Search'],
    ['#recent', 'Recent'],
    ['#watchlist', 'Watchlist'],
    ['#lists', 'Lists'],
    ['#reviews', 'Reviews'],
    ['#movies', 'Movies'],
    ['#shows', 'Shows'],
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Hero profile={profile} stats={stats} backdrops={backdrops} />

      <nav className="sticky top-0 z-30 border-y border-white/5 bg-zinc-950/85 backdrop-blur-md" aria-label="Sections">
        {/* w-max + mx-auto: centered when it fits, horizontally scrollable when it doesn't */}
        <div className="no-scrollbar overflow-x-auto px-4">
          <div className="mx-auto flex w-max gap-1 py-2">
            {nav.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="shrink-0 rounded-full px-3.5 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4">
        <Section id="search" title="Search my library" icon={<FaSearch />}>
          <SearchInterface />
        </Section>

        <Section id="recent" title="Recently watched movies" icon={<FaFilm />}>
          <PosterGrid cards={recentMovies} />
        </Section>

        <Section id="recent-shows" title="Recently watched shows" icon={<FaTv />}>
          <PosterGrid cards={recentEpisodes} />
        </Section>

        <Section id="watchlist" title="Watchlist" icon={<FaBookmark />} count={watchlistCards.length}>
          <PosterGrid cards={watchlistCards} emptyText="Watchlist is empty." />
        </Section>

        <Section id="lists" title="Lists" icon={<FaList />} count={lists.length}>
          <ListsBrowser lists={lists} />
        </Section>

        <Section id="reviews" title="Reviews & comments" icon={<FaRegCommentDots />} count={comments.length}>
          <Reviews comments={comments} />
        </Section>

        <Section id="movies" title="All watched movies" icon={<FaFilm />} count={libraryMovies.length}>
          <PosterGrid cards={libraryMovies} />
        </Section>

        <Section id="shows" title="All watched shows" icon={<FaTv />} count={libraryShows.length}>
          <PosterGrid cards={libraryShows} />
        </Section>

      </main>

      <Footer />
    </div>
  );
}
