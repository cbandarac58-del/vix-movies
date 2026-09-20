import { MOVIE_SITEMAPS, TV_SITEMAPS } from '../utils/sitemap-config.js';

export const GET = () => {
  const site = 'https://movies.vixtube.net';

  const files = ['pages', 'sports'];
  for (let i = 1; i <= MOVIE_SITEMAPS; i++) files.push(`movies-${i}`);
  for (let i = 1; i <= TV_SITEMAPS; i++) files.push(`tv-${i}`);

  const entries = files
    .map((f) => `  <sitemap>\n    <loc>${site}/sitemaps/${f}.xml</loc>\n  </sitemap>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
