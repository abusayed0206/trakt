import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaTv, FaCalendar, FaStar, FaPlay, FaCheckCircle } from 'react-icons/fa';
import { fetchTMDBShow } from '@/lib/services/tmdb';
import { fetchWatchedShows, fetchShowHistory } from '@/lib/services/api';
import { getBackdropUrl, getPosterUrl, getProfileUrl } from '@/lib/utils/image-proxy';
import { Icons } from '@/lib/utils/icons';
import { getImdbUrl, getTmdbUrl } from '@/lib/utils/media';

interface TVPageProps {
  params: Promise<{
    tmdb_id: string;
  }>;
}

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const { tmdb_id } = await params;
  try {
    const show = await fetchTMDBShow(tmdb_id);
    return {
      title: `${show.name} (${new Date(show.first_air_date).getFullYear()}) - TV Show Details`,
      description: show.overview || `Details about ${show.name}`,
    };
  } catch {
    return {
      title: 'TV Show Not Found',
    };
  }
}

export default async function TVPage({ params }: TVPageProps) {
  const { tmdb_id } = await params;
  let show;
  try {
    show = await fetchTMDBShow(tmdb_id);
  } catch {
    notFound();
  }

  // Fetch user data to determine watch status
  const [watchedShows, history] = await Promise.all([
    fetchWatchedShows().catch(() => []),
    fetchShowHistory().catch(() => []),
  ]);

  // Check if show is watched
  const watchedShow = watchedShows.find(s => s.show.ids.tmdb === parseInt(tmdb_id));
  const isWatched = !!watchedShow;

  // Calculate total episodes watched
  const totalEpisodesWatched = watchedShow?.seasons.reduce(
    (acc, season) => acc + season.episodes.length,
    0
  ) || 0;

  // Get last 10 shows from history
  const recentShows = history
    .filter((item, index, self) => 
      index === self.findIndex(t => t.show!.ids.tmdb === item.show!.ids.tmdb)
    )
    .slice(0, 10);

  // Get creators
  const creators = show.created_by || [];

  // Get main cast
  const mainCast = show.credits?.cast.slice(0, 10) || [];

  // Get trailer
  const trailer = show.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  // Format episode runtime
  const formatRuntime = (minutes?: number[]) => {
    if (!minutes || minutes.length === 0) return 'N/A';
    if (minutes.length === 1) return `${minutes[0]}m`;
    return `${Math.min(...minutes)}-${Math.max(...minutes)}m`;
  };

  return (
    <div className="min-h-screen relative">
      {/* Full Page Backdrop Background */}
      {show.backdrop_path ? (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getBackdropUrl(show.backdrop_path, 'w1280')})`,
            }}
          />
          <div className="fixed inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/90 to-gray-900" />
        </>
      ) : (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
      )}

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Poster */}
          <div className="flex-shrink-0 w-full sm:w-64 md:w-72 lg:w-80 mx-auto lg:mx-0">
            <div className="lg:sticky lg:top-4">
              {show.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPosterUrl(show.poster_path, 'w500')}
                  alt={show.name}
                  className="w-full rounded-xl lg:rounded-2xl shadow-2xl border-2 lg:border-4 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-xl lg:rounded-2xl shadow-2xl border-2 lg:border-4 border-gray-700/50 flex items-center justify-center">
                  <FaTv className="text-gray-600 text-4xl lg:text-6xl" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            {/* Title Section */}
            <div className="mb-4 lg:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 lg:mb-3 leading-tight">
                {show.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-gray-300 text-base lg:text-xl">
                <span>{new Date(show.first_air_date).getFullYear()}</span>
                {show.last_air_date && (
                  <>
                    <span>-</span>
                    <span>{new Date(show.last_air_date).getFullYear()}</span>
                  </>
                )}
                {show.episode_run_time && show.episode_run_time.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{formatRuntime(show.episode_run_time)}</span>
                  </>
                )}
                {show.status && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="px-2 lg:px-3 py-1 bg-gray-700/50 rounded-full text-xs lg:text-sm">{show.status}</span>
                  </>
                )}
              </div>
            </div>

            {show.tagline && (
              <p className="text-gray-400 italic text-base lg:text-lg mb-4 lg:mb-6 border-l-4 border-blue-500 pl-3 lg:pl-4">
                &ldquo;{show.tagline}&rdquo;
              </p>
            )}

            {/* Status Badges */}
            <div className="flex gap-2 lg:gap-3 mb-4 lg:mb-6 flex-wrap">
              {isWatched && (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium border border-green-500/30">
                  <FaCheckCircle />
                  <span>Watched ({totalEpisodesWatched} episodes)</span>
                </div>
              )}
            </div>

            {/* Rating & Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <FaStar className="text-yellow-500 text-sm lg:text-base" />
                  <span className="text-xl lg:text-2xl font-bold text-white">{show.vote_average.toFixed(1)}</span>
                </div>
                <p className="text-gray-400 text-xs lg:text-sm">{show.vote_count.toLocaleString()} votes</p>
              </div>
              {show.number_of_seasons && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Seasons</p>
                  <p className="text-white font-semibold text-lg lg:text-xl">{show.number_of_seasons}</p>
                </div>
              )}
              {show.number_of_episodes && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Episodes</p>
                  <p className="text-white font-semibold text-lg lg:text-xl">{show.number_of_episodes}</p>
                </div>
              )}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <FaCalendar className="text-gray-400 text-sm lg:text-base" />
                  <p className="text-gray-400 text-xs lg:text-sm">First Aired</p>
                </div>
                <p className="text-white font-semibold text-sm lg:text-base">{new Date(show.first_air_date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Genres */}
            {show.genres && show.genres.length > 0 && (
              <div className="mb-4 lg:mb-6">
                <div className="flex gap-2 flex-wrap">
                  {show.genres.map(genre => (
                    <span
                      key={genre.id}
                      className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium border border-blue-500/30"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            <div className="flex gap-3 lg:gap-4 mb-6 lg:mb-8 flex-wrap">
              {show.external_ids?.imdb_id && (
                <Link
                  href={getImdbUrl(show.external_ids.imdb_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 lg:p-3 bg-gray-800/70 backdrop-blur-sm hover:bg-gray-700 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-110 border border-gray-700"
                  title="View on IMDb"
                >
                  <Icons.Imdb className="w-6 lg:w-8 h-6 lg:h-8" />
                </Link>
              )}
              <Link
                href={getTmdbUrl(show.id, 'tv')}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 lg:p-3 bg-gray-800/70 backdrop-blur-sm hover:bg-gray-700 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-110 border border-gray-700"
                title="View on TMDB"
              >
                <Icons.Tmdb className="w-6 lg:w-8 h-6 lg:h-8" />
              </Link>
              {trailer && (
                <Link
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 bg-red-600 hover:bg-red-700 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-105 text-white font-semibold text-sm lg:text-base"
                >
                  <FaPlay />
                  <span>Watch Trailer</span>
                </Link>
              )}
            </div>

            {/* Overview */}
            <div className="mb-4 lg:mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-2 lg:mb-3">Overview</h2>
              <p className="text-gray-300 leading-relaxed text-sm lg:text-lg">
                {show.overview || 'No overview available.'}
              </p>
            </div>

            {/* Creators & Networks */}
            {creators.length > 0 && (
              <div className="mb-4 p-3 lg:p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg lg:rounded-xl border border-gray-700/50">
                <span className="text-gray-400 text-sm lg:text-base">Created by: </span>
                <span className="font-semibold text-white text-sm lg:text-lg">
                  {creators.map(c => c.name).join(', ')}
                </span>
              </div>
            )}

            {show.networks && show.networks.length > 0 && (
              <div className="mb-4 lg:mb-6">
                <h3 className="text-base lg:text-lg font-semibold text-white mb-2 lg:mb-3">Networks</h3>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {show.networks.map(network => (
                    <div key={network.id} className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 lg:px-4 py-2 rounded-lg border border-gray-700/50">
                      <span className="text-gray-300 text-xs lg:text-sm">{network.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seasons */}
        {show.seasons && show.seasons.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-8 mb-6 lg:mb-8 border border-gray-700/50">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">Seasons</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3 lg:gap-6">
              {show.seasons
                .filter(season => season.season_number >= 0)
                .map(season => (
                  <div key={season.id} className="group">
                    <div className="text-center">
                      {season.poster_path ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getPosterUrl(season.poster_path, 'w185')}
                          alt={season.name}
                          className="w-full aspect-[2/3] object-cover rounded-lg lg:rounded-xl mb-2 lg:mb-3 shadow-lg border border-gray-700/50 group-hover:border-blue-500/50 group-hover:scale-105 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-gray-700 rounded-lg lg:rounded-xl mb-2 lg:mb-3 flex items-center justify-center shadow-lg border border-gray-700/50 group-hover:scale-105 transition-transform duration-300">
                          <FaTv className="text-gray-500 text-3xl lg:text-5xl" />
                        </div>
                      )}
                      <p className="font-semibold text-white text-xs lg:text-sm line-clamp-1">{season.name}</p>
                      <p className="text-gray-400 text-[10px] lg:text-xs mt-0.5 lg:mt-1">{season.episode_count} episodes</p>
                      {season.air_date && (
                        <p className="text-gray-500 text-[10px] lg:text-xs mt-0.5 lg:mt-1">
                          {new Date(season.air_date).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {mainCast.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-8 mb-6 lg:mb-8 border border-gray-700/50">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">Top Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3 lg:gap-6">
              {mainCast.map(actor => (
                <Link
                  key={actor.id}
                  href={`https://www.themoviedb.org/person/${actor.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="text-center">
                    {actor.profile_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getProfileUrl(actor.profile_path, 'w185')}
                        alt={actor.name}
                        className="w-full aspect-[2/3] object-cover rounded-lg lg:rounded-xl mb-2 lg:mb-3 group-hover:scale-105 transition-transform duration-300 shadow-lg border border-gray-700/50 group-hover:border-blue-500/50"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] bg-gray-700 rounded-lg lg:rounded-xl mb-2 lg:mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 border border-gray-700/50">
                        <span className="text-gray-500 text-3xl lg:text-5xl">👤</span>
                      </div>
                    )}
                    <p className="font-semibold text-white text-xs lg:text-sm group-hover:text-blue-400 transition-colors line-clamp-1">{actor.name}</p>
                    <p className="text-gray-400 text-[10px] lg:text-xs mt-0.5 lg:mt-1 line-clamp-1">{actor.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recently Watched Shows Context */}
        {recentShows.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-8 mb-6 lg:mb-8 border border-gray-700/50">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">Recently Watched Shows</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3 lg:gap-6">
              {recentShows.map(item => (
                <Link
                  key={item.id}
                  href={`/tv/${item.show!.ids.tmdb}`}
                  className="group"
                >
                  <div className="aspect-[2/3] bg-gray-700 rounded-lg lg:rounded-xl mb-2 lg:mb-3 overflow-hidden shadow-lg border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <FaTv className="text-gray-500 text-3xl lg:text-5xl" />
                    </div>
                  </div>
                  <p className="font-semibold text-white text-xs lg:text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.show!.title}
                  </p>
                  <p className="text-gray-400 text-[10px] lg:text-xs mt-0.5 lg:mt-1">{item.show!.year}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
