export const GET = async ({ locals }) => {
  const site = 'https://movies.vixtube.net';
  const key =
    locals?.runtime?.env?.TMDB_API_KEY || import.meta.env.TMDB_API_KEY;
  const base = 'https://api.themoviedb.org/3';

  const slugify = (t = '') =>
    t.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const pages = [
    '/', '/hollywood', '/bollywood', '/tv',
    '/trending', '/about', '/contact', '/privacy-policy',
  ];

  // Genre pages
  let genrePaths = [];
  try {
    const gr = await fetch(`${base}/genre/movie/list?api_key=${key}`);
    const gd = await gr.json();
    genrePaths = (gd.genres || []).map((g) => `/genre/${slugify(g.name)}`);
  } catch {
    genrePaths = [];
  }

  // Movie and TV pages
  const endpoints = [];
  for (let p = 1; p <= 5; p++) {
    endpoints.push({ type: 'movie', url: `${base}/movie/popular?api_key=${key}&page=${p}` });
    endpoints.push({ type: 'tv', url: `${base}/tv/popular?api_key=${key}&page=${p}` });
  }
  for (let p = 1; p <= 3; p++) {
    endpoints.push({ type: 'movie', url: `${base}/movie/top_rated?api_key=${key}&page=${p}` });
    endpoints.push({ type: 'tv', url: `${base}/tv/top_rated?api_key=${key}&page=${p}` });
  }

  const results = await Promise.all(
    endpoints.map(async (e) => {
      try {
        const r = await fetch(e.url);
        const d = await r.json();
        return (d.results || []).map((i) => `/${e.type}/${i.id}`);
      } catch {
        return [];
      }
    })
  );

  const all = [...new Set([...pages, ...genrePaths, ...results.flat()])];
  const urls = all
    .map((p) => `  <url>\n    <loc>${site}${p}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
