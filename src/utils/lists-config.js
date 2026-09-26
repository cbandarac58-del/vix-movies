// Each list maps to a TMDB "discover" or list endpoint.
export const LISTS = [
  {
    slug: 'top-rated',
    name: 'Top Rated Movies',
    emoji: '🏆',
    endpoint: 'movie/top_rated',
    intro: 'The highest-rated movies of all time, ranked by TMDB user votes.',
    sort: null,
  },
  {
    slug: 'most-popular',
    name: 'Most Popular Movies',
    emoji: '🔥',
    endpoint: 'movie/popular',
    intro: 'The most popular movies right now, based on views and searches.',
    sort: null,
  },
  {
    slug: 'now-playing',
    name: 'Now Playing in Theaters',
    emoji: '🎬',
    endpoint: 'movie/now_playing',
    intro: 'Movies currently playing in theaters.',
    sort: null,
  },
  {
    slug: 'upcoming',
    name: 'Upcoming Movies',
    emoji: '📅',
    endpoint: 'movie/upcoming',
    intro: 'Movies scheduled for release soon.',
    sort: null,
  },
];

export const getList = (slug) => LISTS.find((l) => l.slug === slug);
