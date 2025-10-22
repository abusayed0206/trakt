import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FaFilm, FaCalendar, FaStar, FaPlay, FaCheckCircle, FaBookmark } from 'react-icons/fa';
import { fetchTMDBMovie } from '@/lib/services/tmdb';
import { fetchWatchedMovies, fetchMovieWatchlist, fetchMovieHistory } from '@/lib/services/api';
import { getBackdropUrl, getPosterUrl, getProfileUrl, getLogoUrl } from '@/lib/utils/image-proxy';
import { Icons } from '@/lib/utils/icons';
import { getImdbUrl, getTmdbUrl, getLetterboxdUrl } from '@/lib/utils/media';

interface MoviePageProps {
  params: Promise<{
    tmdb_id: string;
  }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { tmdb_id } = await params;
  try {
    const movie = await fetchTMDBMovie(tmdb_id);
    return {
      title: `${movie.title} (${new Date(movie.release_date).getFullYear()}) - Movie Details`,
      description: movie.overview || `Details about ${movie.title}`,
    };
  } catch {
    return {
      title: 'Movie Not Found',
    };
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { tmdb_id } = await params;
  let movie;
  try {
    movie = await fetchTMDBMovie(tmdb_id);
  } catch {
    notFound();
  }

  // Fetch user data to determine watch status
  const [watchedMovies, watchlist, history] = await Promise.all([
    fetchWatchedMovies().catch(() => []),
    fetchMovieWatchlist().catch(() => []),
    fetchMovieHistory().catch(() => []),
  ]);

  // Check if movie is watched
  const watchedMovie = watchedMovies.find(m => m.movie.ids.tmdb === parseInt(tmdb_id));
  const isWatched = !!watchedMovie;

  // Check if movie is in watchlist
  const watchlistItem = watchlist.find(w => w.movie?.ids.tmdb === parseInt(tmdb_id));
  const inWatchlist = !!watchlistItem;

  // Get last 10 movies from history
  const recentMovies = history.slice(0, 10);

  // Get director and main cast
  const director = movie.credits?.crew.find(c => c.job === 'Director');
  const mainCast = movie.credits?.cast.slice(0, 10) || [];

  // Get trailer
  const trailer = movie.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');

  // Format runtime
  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format money
  const formatMoney = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen relative">
      {/* Full Page Backdrop Background */}
      {movie.backdrop_path ? (
        <>
          <div 
            className="fixed inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getBackdropUrl(movie.backdrop_path, 'w1280')})`,
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
              {movie.poster_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getPosterUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full rounded-xl lg:rounded-2xl shadow-2xl border-2 lg:border-4 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-gray-800 rounded-xl lg:rounded-2xl shadow-2xl border-2 lg:border-4 border-gray-700/50 flex items-center justify-center">
                  <FaFilm className="text-gray-600 text-4xl lg:text-6xl" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            {/* Title Section */}
            <div className="mb-4 lg:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 lg:mb-3 leading-tight">
                {movie.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-gray-300 text-base lg:text-xl">
                <span>{new Date(movie.release_date).getFullYear()}</span>
                {movie.runtime && (
                  <>
                    <span>•</span>
                    <span>{formatRuntime(movie.runtime)}</span>
                  </>
                )}
                {movie.status && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="px-2 lg:px-3 py-1 bg-gray-700/50 rounded-full text-xs lg:text-sm">{movie.status}</span>
                  </>
                )}
              </div>
            </div>

            {movie.tagline && (
              <p className="text-gray-400 italic text-base lg:text-lg mb-4 lg:mb-6 border-l-4 border-blue-500 pl-3 lg:pl-4">
                &ldquo;{movie.tagline}&rdquo;
              </p>
            )}

            {/* Status Badges */}
            <div className="flex gap-2 lg:gap-3 mb-4 lg:mb-6 flex-wrap">
              {isWatched && (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium border border-green-500/30">
                  <FaCheckCircle />
                  <span>Watched{watchedMovie?.plays && watchedMovie.plays > 1 ? ` (${watchedMovie.plays}x)` : ''}</span>
                </div>
              )}
              {inWatchlist && (
                <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium border border-blue-500/30">
                  <FaBookmark />
                  <span>In Watchlist (#{watchlistItem?.rank})</span>
                </div>
              )}
            </div>

            {/* Rating & Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <FaStar className="text-yellow-500 text-sm lg:text-base" />
                  <span className="text-xl lg:text-2xl font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                </div>
                <p className="text-gray-400 text-xs lg:text-sm">{movie.vote_count.toLocaleString()} votes</p>
              </div>
              {movie.budget && movie.budget > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Budget</p>
                  <p className="text-white font-semibold text-sm lg:text-base">{formatMoney(movie.budget)}</p>
                </div>
              )}
              {movie.revenue && movie.revenue > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs lg:text-sm mb-1">Revenue</p>
                  <p className="text-white font-semibold text-sm lg:text-base">{formatMoney(movie.revenue)}</p>
                </div>
              )}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg lg:rounded-xl p-3 lg:p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <FaCalendar className="text-gray-400 text-sm lg:text-base" />
                  <p className="text-gray-400 text-xs lg:text-sm">Release</p>
                </div>
                <p className="text-white font-semibold text-sm lg:text-base">{new Date(movie.release_date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-4 lg:mb-6">
                <div className="flex gap-2 flex-wrap">
                  {movie.genres.map(genre => (
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
              {movie.imdb_id && (
                <>
                  <Link
                    href={getLetterboxdUrl(movie.imdb_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 lg:p-3 bg-gray-800/70 backdrop-blur-sm hover:bg-gray-700 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-110 border border-gray-700"
                    title="View on Letterboxd"
                  >
                    <Icons.Letterboxd className="w-6 lg:w-8 h-6 lg:h-8" />
                  </Link>
                  <Link
                    href={getImdbUrl(movie.imdb_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 lg:p-3 bg-gray-800/70 backdrop-blur-sm hover:bg-gray-700 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-110 border border-gray-700"
                    title="View on IMDb"
                  >
                    <Icons.Imdb className="w-6 lg:w-8 h-6 lg:h-8" />
                  </Link>
                </>
              )}
              <Link
                href={getTmdbUrl(movie.id, 'movie')}
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
                {movie.overview || 'No overview available.'}
              </p>
            </div>

            {/* Director & Production Info */}
            {director && (
              <div className="mb-4 p-3 lg:p-4 bg-gray-800/30 backdrop-blur-sm rounded-lg lg:rounded-xl border border-gray-700/50">
                <span className="text-gray-400 text-sm lg:text-base">Directed by: </span>
                <span className="font-semibold text-white text-sm lg:text-lg">{director.name}</span>
              </div>
            )}

            {/* Production Companies */}
            {movie.production_companies && movie.production_companies.length > 0 && (
              <div className="mb-4 lg:mb-6">
                <h3 className="text-base lg:text-lg font-semibold text-white mb-2 lg:mb-3">Production Companies</h3>
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {movie.production_companies.slice(0, 4).map(company => (
                    <div key={company.id} className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm px-3 lg:px-4 py-2 rounded-lg border border-gray-700/50">
                      {company.logo_path && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getLogoUrl(company.logo_path, 'w300')}
                          alt={company.name}
                          className="h-4 lg:h-6 object-contain"
                        />
                      )}
                      <span className="text-gray-300 text-xs lg:text-sm">{company.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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

        {/* Recently Watched Movies Context */}
        {recentMovies.length > 0 && (
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-8 mb-6 lg:mb-8 border border-gray-700/50">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4 lg:mb-6">Recently Watched Movies</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3 lg:gap-6">
              {recentMovies.map(item => (
                <Link
                  key={item.id}
                  href={`/movie/${item.movie!.ids.tmdb}`}
                  className="group"
                >
                  <div className="aspect-[2/3] bg-gray-700 rounded-lg lg:rounded-xl mb-2 lg:mb-3 overflow-hidden shadow-lg border border-gray-700/50 group-hover:border-blue-500/50 transition-all duration-300">
                    <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <FaFilm className="text-gray-500 text-3xl lg:text-5xl" />
                    </div>
                  </div>
                  <p className="font-semibold text-white text-xs lg:text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                    {item.movie!.title}
                  </p>
                  <p className="text-gray-400 text-[10px] lg:text-xs mt-0.5 lg:mt-1">{item.movie!.year}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
