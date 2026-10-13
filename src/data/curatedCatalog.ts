import { MediaItem } from '../types/movie';
import { fetchTMDBTrending, testTMDBConnection, searchTMDB } from '../services/tmdb';

export const KNOWN_TV_SHOWS_METADATA: Record<string, { seasonsCount: number; episodesCount: number; seasons?: any[] }> = {
  't-1396': { seasonsCount: 5, episodesCount: 62, seasons: [] },
  't-60625': { seasonsCount: 1, episodesCount: 5, seasons: [] },
  't-66732': { seasonsCount: 4, episodesCount: 34, seasons: [] },
  't-110492': { seasonsCount: 2, episodesCount: 16, seasons: [] },
};

export function getTVShowInitialMetadata(id: string | number): { seasonsCount: number; episodesCount: number; seasons?: any[] } | undefined {
  const key = String(id);
  return KNOWN_TV_SHOWS_METADATA[key] || { seasonsCount: 1, episodesCount: 10, seasons: [] };
}

export async function fetchNetflixTop10Movies(apiKey?: string): Promise<MediaItem[]> {
  try {
    const tmdbMovies = await fetchTMDBTrending('movie', 'week', apiKey);
    if (tmdbMovies && tmdbMovies.length > 0) {
      return tmdbMovies.slice(0, 10);
    }
  } catch (err) {
    console.warn('Falling back to curated top movies catalog:', err);
  }

  return [
    {
      id: 'm-inception',
      tmdbId: 27205,
      type: 'movie',
      title: 'Inception',
      originalTitle: 'Inception',
      releaseDate: '2010-07-16',
      year: 2010,
      overview: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLE1311o2R3B2S233KI1I828M.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8M1A928y8T8x.jpg',
      voteCount: 35000,
      tmdbRating: 8.4,
      genres: ['Action', 'Sci-Fi', 'Adventure'],
      cast: [{ name: 'Leonardo DiCaprio', character: 'Cobb' }],
      crew: [{ name: 'Christopher Nolan', job: 'Director' }],
      imdbId: 'tt1375666',
      imdbRating: 8.8,
      popularity: 95,
      metadataSource: 'tmdb',
    },
    {
      id: 'm-interstellar',
      tmdbId: 157336,
      type: 'movie',
      title: 'Interstellar',
      originalTitle: 'Interstellar',
      releaseDate: '2014-11-07',
      year: 2014,
      overview: 'When Earth becomes uninhabitable in the future, Joseph Cooper is tasked to pilot a spacecraft to find a new planet for humans.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljv3PAtM81RSp29R2i4E.jpg',
      voteCount: 33000,
      tmdbRating: 8.4,
      genres: ['Adventure', 'Drama', 'Sci-Fi'],
      cast: [{ name: 'Matthew McConaughey', character: 'Cooper' }],
      crew: [{ name: 'Christopher Nolan', job: 'Director' }],
      imdbId: 'tt0816692',
      imdbRating: 8.7,
      popularity: 92,
      metadataSource: 'tmdb',
    },
  ];
}

export async function fetchNetflixTop10Series(apiKey?: string): Promise<MediaItem[]> {
  try {
    const tmdbSeries = await fetchTMDBTrending('tv', 'week', apiKey);
    if (tmdbSeries && tmdbSeries.length > 0) {
      return tmdbSeries.slice(0, 10);
    }
  } catch (err) {
    console.warn('Falling back to curated top series catalog:', err);
  }

  return [
    {
      id: 't-breaking-bad',
      tmdbId: 1396,
      type: 'tv',
      title: 'Breaking Bad',
      originalTitle: 'Breaking Bad',
      releaseDate: '2008-01-20',
      year: 2008,
      overview: 'A chemistry teacher turns to manufacturing methamphetamine to secure his family\'s future.',
      posterUrl: 'https://image.tmdb.org/t/p/w500/zte3sB3pQ86u53p9e5i1.jpg',
      backdropUrl: 'https://image.tmdb.org/t/p/w1280/tsRy63MuZvR8B3BB.jpg',
      voteCount: 13000,
      tmdbRating: 8.9,
      genres: ['Crime', 'Drama', 'Thriller'],
      seasonsCount: 5,
      episodesCount: 62,
      cast: [{ name: 'Bryan Cranston', character: 'Walter White' }],
      crew: [{ name: 'Vince Gilligan', job: 'Creator' }],
      imdbId: 'tt0903747',
      imdbRating: 9.5,
      popularity: 99,
      metadataSource: 'tmdb',
    },
  ];
}

export async function fetchExploreRecommendations(apiKey?: string): Promise<MediaItem[]> {
  try {
    const trendingAll = await fetchTMDBTrending('all', 'week', apiKey);
    if (trendingAll && trendingAll.length > 0) {
      return trendingAll;
    }
  } catch (err) {
    console.warn('Falling back to explore recommendations:', err);
  }

  const movies = await fetchNetflixTop10Movies(apiKey);
  const series = await fetchNetflixTop10Series(apiKey);
  return [...movies, ...series];
}

export function getCuratedExploreMediaItems(): MediaItem[] {
  return [];
}

export async function fetchMediaDetails(id: string): Promise<Partial<MediaItem>> {
  return { id };
}

export { testTMDBConnection, searchTMDB };
export { testOMDbConnection, testOMDbSearch, type DiagnosticResult } from '../services/omdb';
