// TMDB API Response Types

export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  adult: boolean;
  genre_ids?: number[];
  genres?: TMDBGenre[];
  original_language: string;
  popularity: number;
  video: boolean;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  budget?: number;
  revenue?: number;
  tagline?: string;
  status?: string;
  homepage?: string;
  imdb_id?: string;
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  spoken_languages?: TMDBSpokenLanguage[];
  credits?: TMDBCredits;
  videos?: TMDBVideos;
  images?: TMDBImages;
  external_ids?: TMDBExternalIds;
  recommendations?: {
    results: TMDBMovie[];
  };
  similar?: {
    results: TMDBMovie[];
  };
}

export interface TMDBShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  last_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  adult: boolean;
  genre_ids?: number[];
  genres?: TMDBGenre[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  origin_country: string[];
  episode_run_time?: number[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  status?: string;
  type?: string;
  tagline?: string;
  homepage?: string;
  in_production?: boolean;
  languages?: string[];
  networks?: TMDBNetwork[];
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  spoken_languages?: TMDBSpokenLanguage[];
  seasons?: TMDBSeason[];
  created_by?: TMDBCreator[];
  credits?: TMDBCredits;
  videos?: TMDBVideos;
  images?: TMDBImages;
  external_ids?: TMDBExternalIds;
  recommendations?: {
    results: TMDBShow[];
  };
  similar?: {
    results: TMDBShow[];
  };
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  iso_639_1: string;
  name: string;
  english_name: string;
}

export interface TMDBNetwork {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
  season_number: number;
}

export interface TMDBCreator {
  id: number;
  name: string;
  profile_path: string | null;
  credit_id: string;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
  credit_id: string;
  known_for_department: string;
  popularity: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  original_name: string;
  job: string;
  department: string;
  profile_path: string | null;
  credit_id: string;
  known_for_department: string;
  popularity: number;
}

export interface TMDBVideos {
  results: TMDBVideo[];
}

export interface TMDBVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBImages {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
  logos?: TMDBImage[];
}

export interface TMDBImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBExternalIds {
  imdb_id?: string;
  facebook_id?: string;
  instagram_id?: string;
  twitter_id?: string;
  tvdb_id?: number;
  tvrage_id?: number;
}
