export const GET = () => {
  const site = 'https://movies.vixtube.net';
  const paths = ['/', '/hollywood', '/bollywood', '/tv'];
  const urls = paths
    .map((p) => `  <url>\n    <loc>${site}${p}</loc>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
};
