import {
  MOVIE_SITEMAPS,
  TV_SITEMAPS,
  PEOPLE_SITEMAPS,
  PAGES_PER_SITEMAP,
  PEOPLE_PAGES_PER_SITEMAP,
} from '../../utils/sitemap-config.js';

import { SPORTS } from '../../utils/sports-config.js';
import { LISTS } from '../../utils/lists-config.js';

const SITE = 'https://movies.vixtube.net';
const BASE = 'https://api.themoviedb.org/3';

const slugify = (t = '') =>
  t
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const xmlResponse = (paths) => {
  const urls = paths
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE}${p}</loc>\n  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

const getGenres = async (key, type, prefix) => {
  try {
    const r = await fetch(
      `${BASE}/genre/${type}/list?api_key=${key}`
    );

    const d = await r.json();

    return (d.genres || []).map(
      (g) => `${prefix}/${slugify(g.name)}`
    );
  } catch {
    return [];
  }
};

// Only well-known, non-adult people with an actual
// acting/directing/writing/production credit history
const GOOD_DEPT = new Set([
  'Acting',
  'Directing',
  'Writing',
  'Production',
]);

const isGoodPerson = (p) =>
  !p.adult &&
  p.known_for_department &&
  GOOD_DEPT.has(p.known_for_department) &&
  (p.known_for || []).length > 0 &&
  (p.popularity || 0) >= 3;

export const GET = async ({ params, locals }) => {
  const key =
    locals?.runtime?.env?.TMDB_API_KEY ||
    import.meta.env.TMDB_API_KEY;

  const name = params.name || '';

  // =====================================================
  // STATIC PAGES + SPORTS + LISTS + MOVIE GENRES + TV GENRES
  // =====================================================

  if (name === 'pages') {
    const [movieGenres, tvGenres] = await Promise.all([
      getGenres(key, 'movie', '/genre'),
      getGenres(key, 'tv', '/tv/genre'),
    ]);

    // Static pages
    const pages = [
      '/',
      '/hollywood',
      '/bollywood',
      '/tv',
      '/trending',
      '/about',
      '/contact',
      '/privacy-policy',
    ];

    // Sports pages
    const sports = [
      '/sports',
      ...SPORTS.map(
        (s) => `/sports/${s.slug}`
      ),
    ];

    // Lists pages
    const lists = [
      '/lists',
      ...LISTS.map(
        (l) => `/lists/${l.slug}`
      ),
    ];

    // Combine all pages
    return xmlResponse([
      ...pages,
      ...sports,
      ...lists,
      ...movieGenres,
      ...tvGenres,
    ]);
  }

  // =====================================================
  // MOVIE / TV FILES
  // movies-1, movies-2, tv-1, tv-2 ...
  // =====================================================

  const mv = name.match(
    /^(movies|tv)-(\d+)$/
  );

  if (mv) {
    const type = mv[1];
    const n = parseInt(mv[2], 10);

    const max =
      type === 'movies'
        ? MOVIE_SITEMAPS
        : TV_SITEMAPS;

    if (
      n < 1 ||
      n > max
    ) {
      return new Response(
        'Not found',
        { status: 404 }
      );
    }

    const start =
      (n - 1) *
        PAGES_PER_SITEMAP +
      1;

    const pageNumbers = Array.from(
      {
        length:
          PAGES_PER_SITEMAP,
      },
      (_, i) =>
        start + i
    ).filter(
      (p) => p <= 500
    );

    const endpoint =
      type === 'movies'
        ? 'discover/movie'
        : 'discover/tv';

    const urlType =
      type === 'movies'
        ? 'movie'
        : 'tv';

    const results = await Promise.all(
      pageNumbers.map(
        async (p) => {
          try {
            const r =
              await fetch(
                `${BASE}/${endpoint}?api_key=${key}&sort_by=vote_count.desc&vote_count.gte=100&include_adult=false&page=${p}`
              );

            const d =
              await r.json();

            return (
              d.results || []
            )
              .filter(
                (i) =>
                  i.poster_path &&
                  !i.adult
              )
              .map(
                (i) =>
                  `/${urlType}/${i.id}`
              );
          } catch {
            return [];
          }
        }
      )
    );

    return xmlResponse([
      ...new Set(
        results.flat()
      ),
    ]);
  }

  // =====================================================
  // PEOPLE FILES
  // people-1, people-2 ...
  // =====================================================

  const pm = name.match(
    /^people-(\d+)$/
  );

  if (pm) {
    const n = parseInt(
      pm[1],
      10
    );

    if (
      n < 1 ||
      n > PEOPLE_SITEMAPS
    ) {
      return new Response(
        'Not found',
        { status: 404 }
      );
    }

    const start =
      (n - 1) *
        PEOPLE_PAGES_PER_SITEMAP +
      1;

    const pageNumbers = Array.from(
      {
        length:
          PEOPLE_PAGES_PER_SITEMAP,
      },
      (_, i) =>
        start + i
    ).filter(
      (p) => p <= 500
    );

    const results = await Promise.all(
      pageNumbers.map(
        async (p) => {
          try {
            const r =
              await fetch(
                `${BASE}/person/popular?api_key=${key}&page=${p}`
              );

            const d =
              await r.json();

            return (
              d.results || []
            )
              .filter(
                isGoodPerson
              )
              .map(
                (p2) =>
                  `/person/${p2.id}`
              );
          } catch {
            return [];
          }
        }
      )
    );

    return xmlResponse([
      ...new Set(
        results.flat()
      ),
    ]);
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  return new Response(
    'Not found',
    { status: 404 }
  );
};
