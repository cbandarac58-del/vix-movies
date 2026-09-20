import {
  MOVIE_SITEMAPS,
  TV_SITEMAPS,
  PAGES_PER_SITEMAP,
} from '../../utils/sitemap-config.js';
import { SPORTS } from '../../utils/sports-config.js';
import { getSportVideos, durationSeconds } from '../../utils/youtube.js';

const SITE = 'https://movies.vixtube.net';
const BASE = 'https://api.themoviedb.org/3';

const slugify = (t = '') =>
  t.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Safe text for XML
const esc = (s = '') =>
  String(s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const xmlResponse = (paths) => {
  const urls = paths
    .map((p) => `  <url>\n    <loc>${SITE}${p}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

// Video sitemap (Google video extension)
const videoResponse = (videos) => {
  const urls = videos
    .map((v) => {
      const secs = durationSeconds(v.duration);
      const desc =
        (v.description || '')
          .replace(/https?:\/\/\S+/g, '')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 300) || v.title;
      return [
        '  <url>',
        `    <loc>${SITE}/sports/watch/${v.id}</loc>`,
        '    <video:video>',
        `      <video:thumbnail_loc>${esc(v.thumb)}</video:thumbnail_loc>`,
        `      <video:title>${esc(v.title.slice(0, 100))}</video:title>`,
        `      <video:description>${esc(desc)}</video:description>`,
        `      <video:player_loc>https://www.youtube.com/embed/${v.id}</video:player_loc>`,
        secs > 0 ? `      <video:duration>${secs}</video:duration>` : '',
        `      <video:publication_date>${esc(v.published)}</video:publication_date>`,
        '    </video:video>',
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${urls}\n</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};

const getGenres = async (key, type, prefix) => {
  try {
    const r = await fetch(`${BASE}/genre/${type}/list?api_key=${key}`);
    const d = await r.json();
    return (d.genres || []).map((g) => `${prefix}/${slugify(g.name)}`);
  } catch {
    return [];
  }
};

export const GET = async ({ params, locals }) => {
  const key = locals?.runtime?.env?.TMDB_API_KEY || import.meta.env.TMDB_API_KEY;
  const ytKey = locals?.runtime?.env?.YOUTUBE_API_KEY || import.meta.env.YOUTUBE_API_KEY;
  const name = params.name || '';

  // Static pages + sports pages + movie genre pages + TV genre pages
  if (name === 'pages') {
    const [movieGenres, tvGenres] = await Promise.all([
      getGenres(key, 'movie', '/genre'),
      getGenres(key, 'tv', '/tv/genre'),
    ]);
    const pages = [
      '/', '/hollywood', '/bollywood', '/tv',
      '/trending', '/about', '/contact', '/privacy-policy',
    ];
    const sports = ['/sports', ...SPORTS.map((s) => `/sports/${s.slug}`)];
    return xmlResponse([...pages, ...sports, ...movieGenres, ...tvGenres]);
  }

  // Sports video sitemap (latest videos of all sports)
  if (name === 'sports') {
    const unavailable = () =>
      new Response('Temporarily unavailable', { status: 503, headers: { 'Retry-After': '3600' } });
    if (!ytKey) return unavailable();

    const results = await Promise.all(SPORTS.map((s) => getSportVideos(s.channels, ytKey)));
    if (results.every((r) => r.error)) return unavailable();

    const seen = new Set();
    const videos = results
      .flatMap((r) => r.videos)
      .filter((v) => v.live !== 'upcoming' && v.published && !seen.has(v.id) && seen.add(v.id))
      .slice(0, 300);
    return videoResponse(videos);
  }

  // Movie / TV files: movies-1, movies-2, tv-1 ...
  const m = name.match(/^(movies|tv)-(\d+)$/);
  if (!m) return new Response('Not found', { status: 404 });

  const type = m[1];
  const n = parseInt(m[2], 10);
  const max = type === 'movies' ? MOVIE_SITEMAPS : TV_SITEMAPS;
  if (n < 1 || n > max) return new Response('Not found', { status: 404 });

  const start = (n - 1) * PAGES_PER_SITEMAP + 1;
  const pageNumbers = Array.from({ length: PAGES_PER_SITEMAP }, (_, i) => start + i).filter(
    (p) => p <= 500
  );
  const endpoint = type === 'movies' ? 'discover/movie' : 'discover/tv';
  const urlType = type === 'movies' ? 'movie' : 'tv';

  // Most-voted titles first (a stable, well-known list)
  const results = await Promise.all(
    pageNumbers.map(async (p) => {
      try {
        const r = await fetch(
          `${BASE}/${endpoint}?api_key=${key}&sort_by=vote_count.desc&vote_count.gte=100&include_adult=false&page=${p}`
        );
        const d = await r.json();
        return (d.results || [])
          .filter((i) => i.poster_path && !i.adult)
          .map((i) => `/${urlType}/${i.id}`);
      } catch {
        return [];
      }
    })
  );

  return xmlResponse([...new Set(results.flat())]);
};
